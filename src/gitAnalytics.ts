import { StorageManager, TimeEntry } from './storage';
import { formatTime } from './utils';

export interface CommitInfo {
    commitHash: string;
    timestamp: number;
    branch: string;
    timeSpent: number; // Time spent working on this commit (in seconds)
    timeBetweenCommits?: number; // Time between this commit and previous one (in seconds)
}

export interface BranchSwitchInfo {
    fromBranch: string;
    toBranch: string;
    timestamp: number;
}

export interface GitProductivityStats {
    totalCommits: number;
    averageTimePerCommit: number;
    totalTimeSpent: number;
    mostActiveBranch: string;
    branchSwitchCount: number;
    averageTimeBetweenCommits: number;
}

export interface DateRange {
    startDate?: string;
    endDate?: string;
}

export class GitAnalytics {
    private storage: StorageManager;

    constructor(storage: StorageManager) {
        this.storage = storage;
    }

    /**
     * Get commit timeline for a date range
     * Returns chronological list of commits with time spent
     */
    public getCommitTimeline(startDate?: string, endDate?: string): CommitInfo[] {
        const entries = this.getEntriesForRange(startDate, endDate);
        const commits: CommitInfo[] = [];

        // Collect all commits from entries
        for (const entry of entries) {
            if (!entry.gitStats) {
                continue;
            }

            const gitStats = entry.gitStats;
            
            // If we have commit history, use it
            if (gitStats.commitHistory && gitStats.commitHistory.length > 0) {
                for (const commit of gitStats.commitHistory) {
                    commits.push({
                        commitHash: commit.commitHash,
                        timestamp: commit.timestamp,
                        branch: commit.branch,
                        timeSpent: commit.timeSpent,
                        timeBetweenCommits: commit.timeBetweenCommits
                    });
                }
            } else {
                // Fallback: use last commit if no history is available
                // This handles legacy data
                if (gitStats.lastCommit && gitStats.commitTimestamp > 0) {
                    // Estimate time spent based on branch time
                    const branchTime = gitStats.branchTime[gitStats.currentBranch] || 0;
                    commits.push({
                        commitHash: gitStats.lastCommit,
                        timestamp: gitStats.commitTimestamp,
                        branch: gitStats.currentBranch,
                        timeSpent: branchTime,
                        timeBetweenCommits: undefined
                    });
                }
            }
        }

        // Sort by timestamp
        commits.sort((a, b) => a.timestamp - b.timestamp);

        // Calculate time between commits
        for (let i = 1; i < commits.length; i++) {
            const prevCommit = commits[i - 1];
            const currentCommit = commits[i];
            currentCommit.timeBetweenCommits = currentCommit.timestamp - prevCommit.timestamp;
        }

        return commits;
    }

    /**
     * Get branch switching frequency and patterns
     */
    public getBranchSwitchingFrequency(dateRange?: DateRange): {
        switchCount: number;
        switches: BranchSwitchInfo[];
        averageTimeBetweenSwitches: number;
    } {
        const entries = this.getEntriesForRange(dateRange?.startDate, dateRange?.endDate);
        const switches: BranchSwitchInfo[] = [];
        let previousBranch: string | null = null;
        let previousTimestamp: number = 0;

        for (const entry of entries) {
            if (!entry.gitStats) {
                continue;
            }

            const gitStats = entry.gitStats;
            
            // Track branch switches within commit history
            if (gitStats.commitHistory && gitStats.commitHistory.length > 0) {
                for (const commit of gitStats.commitHistory) {
                    if (previousBranch && previousBranch !== commit.branch) {
                        switches.push({
                            fromBranch: previousBranch,
                            toBranch: commit.branch,
                            timestamp: commit.timestamp
                        });
                    }
                    previousBranch = commit.branch;
                    previousTimestamp = commit.timestamp;
                }
            } else {
                // Fallback: check if branch changed between entries
                if (previousBranch && previousBranch !== gitStats.currentBranch) {
                    switches.push({
                        fromBranch: previousBranch,
                        toBranch: gitStats.currentBranch,
                        timestamp: gitStats.commitTimestamp || Date.now()
                    });
                }
                previousBranch = gitStats.currentBranch;
            }
        }

        // Calculate average time between switches
        let totalTimeBetweenSwitches = 0;
        for (let i = 1; i < switches.length; i++) {
            totalTimeBetweenSwitches += switches[i].timestamp - switches[i - 1].timestamp;
        }
        const averageTimeBetweenSwitches = switches.length > 1 
            ? totalTimeBetweenSwitches / (switches.length - 1) 
            : 0;

        return {
            switchCount: switches.length,
            switches,
            averageTimeBetweenSwitches: Math.floor(averageTimeBetweenSwitches / 1000) // Convert to seconds
        };
    }

    /**
     * Get productivity statistics
     */
    public getGitProductivityStats(dateRange?: DateRange): GitProductivityStats {
        const entries = this.getEntriesForRange(dateRange?.startDate, dateRange?.endDate);
        const commits = this.getCommitTimeline(dateRange?.startDate, dateRange?.endDate);
        
        let totalCommits = 0;
        let totalTimeSpent = 0;
        const branchTimeMap: { [branch: string]: number } = {};
        const timeBetweenCommits: number[] = [];

        // Aggregate data from entries
        for (const entry of entries) {
            if (!entry.gitStats) {
                continue;
            }

            const gitStats = entry.gitStats;
            totalCommits += gitStats.commitCount || 0;

            // Aggregate branch times
            for (const [branch, time] of Object.entries(gitStats.branchTime)) {
                branchTimeMap[branch] = (branchTimeMap[branch] || 0) + time;
                totalTimeSpent += time;
            }
        }

        // Calculate time between commits from timeline
        for (const commit of commits) {
            if (commit.timeSpent > 0) {
                totalTimeSpent += commit.timeSpent;
            }
            if (commit.timeBetweenCommits !== undefined) {
                timeBetweenCommits.push(commit.timeBetweenCommits);
            }
        }

        // Find most active branch
        let mostActiveBranch = '';
        let maxBranchTime = 0;
        for (const [branch, time] of Object.entries(branchTimeMap)) {
            if (time > maxBranchTime) {
                maxBranchTime = time;
                mostActiveBranch = branch;
            }
        }

        // Calculate averages
        const averageTimePerCommit = totalCommits > 0 ? totalTimeSpent / totalCommits : 0;
        const averageTimeBetweenCommits = timeBetweenCommits.length > 0
            ? timeBetweenCommits.reduce((sum, time) => sum + time, 0) / timeBetweenCommits.length / 1000 // Convert to seconds
            : 0;

        const branchSwitching = this.getBranchSwitchingFrequency(dateRange);

        return {
            totalCommits: commits.length > 0 ? commits.length : totalCommits,
            averageTimePerCommit: Math.floor(averageTimePerCommit),
            totalTimeSpent: Math.floor(totalTimeSpent),
            mostActiveBranch: mostActiveBranch || 'N/A',
            branchSwitchCount: branchSwitching.switchCount,
            averageTimeBetweenCommits: Math.floor(averageTimeBetweenCommits)
        };
    }

    /**
     * Get entries for date range
     */
    private getEntriesForRange(startDate?: string, endDate?: string): TimeEntry[] {
        if (startDate && endDate) {
            return this.storage.getEntriesForDateRange(startDate, endDate);
        } else if (startDate) {
            // If only start date, get from start to today
            const today = new Date().toISOString().split('T')[0];
            return this.storage.getEntriesForDateRange(startDate, today);
        } else {
            // Get all entries for current project
            return this.storage.getProjectEntries();
        }
    }

    /**
     * Format commit timeline for display
     */
    public formatCommitTimeline(commits: CommitInfo[]): string {
        if (commits.length === 0) {
            return 'No commits found in the selected date range.';
        }

        const lines: string[] = [];
        lines.push('# Commit Timeline\n');
        lines.push(`Total commits: ${commits.length}\n`);

        for (const commit of commits) {
            const date = new Date(commit.timestamp).toLocaleString();
            const timeSpent = formatTime(commit.timeSpent);
            const timeBetween = commit.timeBetweenCommits 
                ? formatTime(Math.floor(commit.timeBetweenCommits / 1000))
                : 'N/A';

            lines.push(`## ${commit.commitHash.substring(0, 8)}`);
            lines.push(`- **Branch:** ${commit.branch}`);
            lines.push(`- **Timestamp:** ${date}`);
            lines.push(`- **Time Spent:** ${timeSpent}`);
            lines.push(`- **Time Since Previous:** ${timeBetween}`);
            lines.push('');
        }

        return lines.join('\n');
    }
}

