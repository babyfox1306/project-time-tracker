import * as vscode from 'vscode';

export interface GitInfo {
    branch: string;
    commit: string;
    commitTimestamp: number;
    isGitRepo: boolean;
}

export class GitTracker {
    private gitExtension: vscode.Extension<any> | undefined;
    private lastBranch: string = '';
    private lastCommit: string = '';

    constructor() {
        this.gitExtension = vscode.extensions.getExtension('vscode.git');
    }

    /**
     * Get current Git information
     */
    public async getCurrentGitInfo(): Promise<GitInfo> {
        if (!this.gitExtension || !this.gitExtension.isActive) {
            return {
                branch: '',
                commit: '',
                commitTimestamp: 0,
                isGitRepo: false
            };
        }

        try {
            const git = this.gitExtension.exports.getAPI(1);
            const repo = git.repositories[0]; // Use first repository

            if (!repo) {
                return {
                    branch: '',
                    commit: '',
                    commitTimestamp: 0,
                    isGitRepo: false
                };
            }

            const branch = await this.getCurrentBranch(repo);
            const commit = await this.getLastCommit(repo);
            const commitTimestamp = await this.getLastCommitTimestamp(repo);

            return {
                branch,
                commit,
                commitTimestamp,
                isGitRepo: true
            };
        } catch (error) {
            console.error('Error getting Git info:', error);
            return {
                branch: '',
                commit: '',
                commitTimestamp: 0,
                isGitRepo: false
            };
        }
    }

    /**
     * Check if branch or commit has changed
     */
    public async hasGitInfoChanged(): Promise<boolean> {
        const gitInfo = await this.getCurrentGitInfo();
        
        if (!gitInfo.isGitRepo) {
            return false;
        }

        const branchChanged = gitInfo.branch !== this.lastBranch;
        const commitChanged = gitInfo.commit !== this.lastCommit;

        if (branchChanged || commitChanged) {
            this.lastBranch = gitInfo.branch;
            this.lastCommit = gitInfo.commit;
            return true;
        }

        return false;
    }

    /**
     * Get current branch name
     */
    private async getCurrentBranch(repo: any): Promise<string> {
        try {
            const branch = repo.state.HEAD?.name || repo.state.HEAD?.commit || 'detached';
            return branch;
        } catch (error) {
            console.error('Error getting current branch:', error);
            return '';
        }
    }

    /**
     * Get last commit hash
     */
    private async getLastCommit(repo: any): Promise<string> {
        try {
            const commit = repo.state.HEAD?.commit || '';
            return commit.substring(0, 8); // Short hash
        } catch (error) {
            console.error('Error getting last commit:', error);
            return '';
        }
    }

    /**
     * Get last commit timestamp
     */
    private async getLastCommitTimestamp(repo: any): Promise<number> {
        try {
            // Try to get commit timestamp from Git API
            const commit = repo.state.HEAD?.commit;
            if (!commit) {
                return 0;
            }

            // For now, return current timestamp
            // TODO: Implement actual commit timestamp retrieval
            return Date.now();
        } catch (error) {
            console.error('Error getting commit timestamp:', error);
            return 0;
        }
    }

    /**
     * Get branch switching frequency (for analytics)
     */
    public getBranchSwitchingFrequency(): number {
        // This would track how often user switches branches
        // For now, return 0 - will be implemented in gitAnalytics.ts
        return 0;
    }

    /**
     * Get commit frequency (for analytics)
     */
    public getCommitFrequency(): number {
        // This would track how often user commits
        // For now, return 0 - will be implemented in gitAnalytics.ts
        return 0;
    }

    /**
     * Format branch name for display
     */
    public formatBranchName(branch: string): string {
        if (!branch) return 'No branch';
        
        // Remove common prefixes
        const cleanBranch = branch
            .replace(/^origin\//, '')
            .replace(/^remotes\/origin\//, '')
            .replace(/^heads\//, '');
        
        return cleanBranch;
    }

    /**
     * Format commit hash for display
     */
    public formatCommitHash(commit: string): string {
        if (!commit) return 'No commit';
        return commit.substring(0, 8);
    }

    /**
     * Get time spent on current branch (helper method)
     */
    public async getCurrentBranchTime(branchTime: { [branchName: string]: number }): Promise<number> {
        const gitInfo = await this.getCurrentGitInfo();
        if (!gitInfo.isGitRepo || !gitInfo.branch) return 0;
        return branchTime[gitInfo.branch] || 0;
    }
}
