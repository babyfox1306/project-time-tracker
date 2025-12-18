import * as vscode from 'vscode';
import { getCurrentDate, getProjectName } from './utils';

export interface TimeEntry {
    date: string;           // ISO date: '2025-10-14'
    projectName: string;    // workspace.name
    totalSeconds: number;
    files: {
        [filePath: string]: {
            seconds: number;
            language: string;
            lastActive: number;
        }
    };
    languages: {
        [languageId: string]: number; // Total seconds per language
    };
    pomodoroStats?: {
        totalWorkSessions: number;
        totalBreakSessions: number;
        lastSessionType: 'work' | 'break' | null;
        lastSessionEnd: number;
    };
    gitStats?: {
        currentBranch: string;
        lastCommit: string;
        commitTimestamp: number;
        branchTime: { [branchName: string]: number }; // Time spent per branch
        commitCount: number;
        commitHistory?: Array<{
            commitHash: string;
            timestamp: number;
            branch: string;
            timeSpent: number;
            timeBetweenCommits?: number;
        }>;
    };
}

export interface TimeData {
    [dateKey: string]: {
        [projectKey: string]: TimeEntry;
    };
}

export class StorageManager {
    private context: vscode.ExtensionContext;
    private readonly STORAGE_KEY = 'timeTrackerData';

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Generate storage key for date and project
     */
    private getStorageKey(date: string, projectName: string): string {
        return `${this.STORAGE_KEY}_${date}_${projectName}`;
    }

    /**
     * Get all stored time data
     */
    public getAllData(): TimeData {
        const data = this.context.globalState.get<TimeData>(this.STORAGE_KEY, {});
        return data;
    }

    /**
     * Get time entry for specific date and project
     */
    public getEntry(date: string, projectName: string): TimeEntry | undefined {
        const data = this.getAllData();
        return data[date]?.[projectName];
    }

    /**
     * Get today's entry for current project
     */
    public getTodayEntry(): TimeEntry | undefined {
        const today = getCurrentDate();
        const projectName = getProjectName();
        return this.getEntry(today, projectName);
    }

    /**
     * Save or update time entry
     */
    public async saveEntry(entry: TimeEntry): Promise<void> {
        const data = this.getAllData();
        
        if (!data[entry.date]) {
            data[entry.date] = {};
        }
        
        data[entry.date][entry.projectName] = entry;
        
        await this.context.globalState.update(this.STORAGE_KEY, data);
    }

    /**
     * Create new time entry for today
     */
    public createTodayEntry(): TimeEntry {
        const today = getCurrentDate();
        const projectName = getProjectName();
        
        return {
            date: today,
            projectName: projectName,
            totalSeconds: 0,
            files: {},
            languages: {},
            pomodoroStats: {
                totalWorkSessions: 0,
                totalBreakSessions: 0,
                lastSessionType: null,
                lastSessionEnd: 0
            },
            gitStats: {
                currentBranch: '',
                lastCommit: '',
                commitTimestamp: 0,
                branchTime: {},
                commitCount: 0,
                commitHistory: []
            }
        };
    }

    /**
     * Get or create today's entry
     */
    public getOrCreateTodayEntry(): TimeEntry {
        let entry = this.getTodayEntry();
        if (!entry) {
            entry = this.createTodayEntry();
        }
        return entry;
    }

    /**
     * Update file time in today's entry
     */
    public async updateFileTime(filePath: string, language: string, additionalSeconds: number): Promise<void> {
        const entry = this.getOrCreateTodayEntry();
        
        if (!entry.files[filePath]) {
            entry.files[filePath] = {
                seconds: 0,
                language: language,
                lastActive: Date.now()
            };
        }
        
        entry.files[filePath].seconds += additionalSeconds;
        entry.files[filePath].lastActive = Date.now();
        
        // Update language totals
        if (!entry.languages[language]) {
            entry.languages[language] = 0;
        }
        entry.languages[language] += additionalSeconds;
        
        // Update total
        entry.totalSeconds += additionalSeconds;
        
        await this.saveEntry(entry);
    }

    /**
     * Get entries for a specific date range
     */
    public getEntriesForDateRange(startDate: string, endDate: string): TimeEntry[] {
        const data = this.getAllData();
        const entries: TimeEntry[] = [];
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (const dateKey in data) {
            const entryDate = new Date(dateKey);
            if (entryDate >= start && entryDate <= end) {
                for (const projectKey in data[dateKey]) {
                    entries.push(data[dateKey][projectKey]);
                }
            }
        }
        
        return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    /**
     * Get entries for current project across all dates
     */
    public getProjectEntries(projectName?: string): TimeEntry[] {
        const data = this.getAllData();
        const entries: TimeEntry[] = [];
        const targetProject = projectName || getProjectName();
        
        for (const dateKey in data) {
            if (data[dateKey][targetProject]) {
                entries.push(data[dateKey][targetProject]);
            }
        }
        
        return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    /**
     * Clear today's data
     */
    public async clearTodayData(): Promise<void> {
        const today = getCurrentDate();
        const projectName = getProjectName();
        const data = this.getAllData();
        
        if (data[today] && data[today][projectName]) {
            delete data[today][projectName];
            
            // Clean up empty date entries
            if (Object.keys(data[today]).length === 0) {
                delete data[today];
            }
            
            await this.context.globalState.update(this.STORAGE_KEY, data);
        }
    }

    /**
     * Clear all data (with confirmation)
     */
    public async clearAllData(): Promise<void> {
        await this.context.globalState.update(this.STORAGE_KEY, {});
    }

    /**
     * Get total time across all projects and dates
     */
    public getTotalTime(): number {
        const data = this.getAllData();
        let total = 0;
        
        for (const dateKey in data) {
            for (const projectKey in data[dateKey]) {
                total += data[dateKey][projectKey].totalSeconds;
            }
        }
        
        return total;
    }

    /**
     * Get statistics summary
     */
    public getStatsSummary(): {
        totalDays: number;
        totalProjects: number;
        totalTime: number;
        averageTimePerDay: number;
    } {
        const data = this.getAllData();
        const dates = new Set<string>();
        const projects = new Set<string>();
        let totalTime = 0;
        
        for (const dateKey in data) {
            dates.add(dateKey);
            for (const projectKey in data[dateKey]) {
                projects.add(projectKey);
                totalTime += data[dateKey][projectKey].totalSeconds;
            }
        }
        
        const totalDays = dates.size;
        const totalProjects = projects.size;
        const averageTimePerDay = totalDays > 0 ? totalTime / totalDays : 0;
        
        return {
            totalDays,
            totalProjects,
            totalTime,
            averageTimePerDay
        };
    }

    /**
     * Update Pomodoro stats for today
     */
    public async updatePomodoroStats(workSessions: number, breakSessions: number, lastSessionType: 'work' | 'break' | null): Promise<void> {
        const entry = this.getOrCreateTodayEntry();
        
        if (!entry.pomodoroStats) {
            entry.pomodoroStats = {
                totalWorkSessions: 0,
                totalBreakSessions: 0,
                lastSessionType: null,
                lastSessionEnd: 0
            };
        }
        
        entry.pomodoroStats.totalWorkSessions = workSessions;
        entry.pomodoroStats.totalBreakSessions = breakSessions;
        entry.pomodoroStats.lastSessionType = lastSessionType;
        entry.pomodoroStats.lastSessionEnd = Date.now();
        
        await this.saveEntry(entry);
    }

    /**
     * Get Pomodoro stats for today
     */
    public getPomodoroStats(): { totalWorkSessions: number; totalBreakSessions: number; lastSessionType: 'work' | 'break' | null } {
        const entry = this.getTodayEntry();
        
        if (!entry || !entry.pomodoroStats) {
            return {
                totalWorkSessions: 0,
                totalBreakSessions: 0,
                lastSessionType: null
            };
        }
        
        return {
            totalWorkSessions: entry.pomodoroStats.totalWorkSessions,
            totalBreakSessions: entry.pomodoroStats.totalBreakSessions,
            lastSessionType: entry.pomodoroStats.lastSessionType
        };
    }

    /**
     * Update Git stats for today
     */
    public async updateGitStats(branch: string, commit: string, commitTimestamp: number, additionalSeconds: number): Promise<void> {
        const entry = this.getOrCreateTodayEntry();
        
        if (!entry.gitStats) {
            entry.gitStats = {
                currentBranch: '',
                lastCommit: '',
                commitTimestamp: 0,
                branchTime: {},
                commitCount: 0,
                commitHistory: []
            };
        }
        
        // Initialize commit history if not present
        if (!entry.gitStats.commitHistory) {
            entry.gitStats.commitHistory = [];
        }
        
        // Update current branch
        entry.gitStats.currentBranch = branch;
        
        // Update commit info if it's a new commit
        if (commit !== entry.gitStats.lastCommit) {
            // Calculate time between commits
            let timeBetweenCommits: number | undefined = undefined;
            if (entry.gitStats.commitHistory.length > 0) {
                const lastCommit = entry.gitStats.commitHistory[entry.gitStats.commitHistory.length - 1];
                timeBetweenCommits = commitTimestamp - lastCommit.timestamp;
            }
            
            // Add to commit history
            entry.gitStats.commitHistory.push({
                commitHash: commit,
                timestamp: commitTimestamp,
                branch: branch,
                timeSpent: additionalSeconds,
                timeBetweenCommits: timeBetweenCommits
            });
            
            entry.gitStats.lastCommit = commit;
            entry.gitStats.commitTimestamp = commitTimestamp;
            entry.gitStats.commitCount++;
        } else {
            // Update time spent for current commit
            if (entry.gitStats.commitHistory.length > 0) {
                const lastCommit = entry.gitStats.commitHistory[entry.gitStats.commitHistory.length - 1];
                if (lastCommit.commitHash === commit) {
                    lastCommit.timeSpent += additionalSeconds;
                }
            }
        }
        
        // Update branch time
        if (!entry.gitStats.branchTime[branch]) {
            entry.gitStats.branchTime[branch] = 0;
        }
        entry.gitStats.branchTime[branch] += additionalSeconds;
        
        await this.saveEntry(entry);
    }

    /**
     * Get Git stats for today
     */
    public getGitStats(): { currentBranch: string; lastCommit: string; commitTimestamp: number; branchTime: { [branchName: string]: number }; commitCount: number; commitHistory?: Array<{ commitHash: string; timestamp: number; branch: string; timeSpent: number; timeBetweenCommits?: number }> } | null {
        const entry = this.getTodayEntry();
        
        if (!entry || !entry.gitStats) {
            return null;
        }
        
        return {
            currentBranch: entry.gitStats.currentBranch,
            lastCommit: entry.gitStats.lastCommit,
            commitTimestamp: entry.gitStats.commitTimestamp,
            branchTime: entry.gitStats.branchTime,
            commitCount: entry.gitStats.commitCount,
            commitHistory: entry.gitStats.commitHistory
        };
    }

    /**
     * Get Git stats for a specific branch
     */
    public getBranchTime(branchName: string): number {
        const gitStats = this.getGitStats();
        return gitStats?.branchTime[branchName] || 0;
    }

    /**
     * Get aggregated Git stats for a date range
     */
    public getGitStatsForDateRange(startDate: string, endDate: string): {
        totalCommits: number;
        branches: { [branchName: string]: number };
        commitHistory: Array<{
            commitHash: string;
            timestamp: number;
            branch: string;
            timeSpent: number;
            timeBetweenCommits?: number;
        }>;
        branchSwitches: number;
    } {
        const entries = this.getEntriesForDateRange(startDate, endDate);
        const branches: { [branchName: string]: number } = {};
        const commitHistory: Array<{
            commitHash: string;
            timestamp: number;
            branch: string;
            timeSpent: number;
            timeBetweenCommits?: number;
        }> = [];
        let totalCommits = 0;
        let branchSwitches = 0;
        let previousBranch: string | null = null;

        for (const entry of entries) {
            if (!entry.gitStats) {
                continue;
            }

            const gitStats = entry.gitStats;
            totalCommits += gitStats.commitCount || 0;

            // Aggregate branch times
            for (const [branchName, time] of Object.entries(gitStats.branchTime)) {
                branches[branchName] = (branches[branchName] || 0) + time;
            }

            // Collect commit history
            if (gitStats.commitHistory && gitStats.commitHistory.length > 0) {
                for (const commit of gitStats.commitHistory) {
                    commitHistory.push(commit);
                    
                    // Track branch switches
                    if (previousBranch && previousBranch !== commit.branch) {
                        branchSwitches++;
                    }
                    previousBranch = commit.branch;
                }
            } else if (gitStats.currentBranch) {
                // Fallback for legacy data
                if (previousBranch && previousBranch !== gitStats.currentBranch) {
                    branchSwitches++;
                }
                previousBranch = gitStats.currentBranch;
            }
        }

        // Sort commit history by timestamp
        commitHistory.sort((a, b) => a.timestamp - b.timestamp);

        return {
            totalCommits,
            branches,
            commitHistory,
            branchSwitches
        };
    }
}
