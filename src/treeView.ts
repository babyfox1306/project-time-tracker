import * as vscode from 'vscode';
import { StorageManager, TimeEntry } from './storage';
import { TimeTracker } from './tracker';
import { formatTime, getRelativeFilePath, getTopFiles, getTopLanguages, truncatePath } from './utils';
import { PomodoroTimer } from './pomodoro';

export class TimeTrackerTreeProvider implements vscode.TreeDataProvider<TimeTrackerItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TimeTrackerItem | undefined | null | void> = new vscode.EventEmitter<TimeTrackerItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TimeTrackerItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private storage: StorageManager;
    private tracker: TimeTracker;

    constructor(storage: StorageManager, tracker: TimeTracker) {
        this.storage = storage;
        this.tracker = tracker;
        
        // Refresh tree when tracker updates
        this.tracker.setUpdateCallback(() => {
            this.refresh();
        });
    }

    /**
     * Refresh the tree view
     */
    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Get tree item
     */
    getTreeItem(element: TimeTrackerItem): vscode.TreeItem {
        return element;
    }

    /**
     * Get children of tree item
     */
    getChildren(element?: TimeTrackerItem): Thenable<TimeTrackerItem[]> {
        if (!element) {
            // Root level - show main status
            return this.getRootItems();
        } else if (element.contextValue === 'status') {
            // Status section - show current session info
            return this.getStatusItems();
        } else if (element.contextValue === 'pomodoro') {
            // Pomodoro section - show Pomodoro timer info
            return this.getPomodoroItems();
        } else if (element.contextValue === 'project') {
            // Project section - show project details
            return this.getProjectItems();
        } else if (element.contextValue === 'files') {
            // Files section - show top files
            return this.getFileItems();
        } else if (element.contextValue === 'languages') {
            // Languages section - show language breakdown
            return this.getLanguageItems();
        } else if (element.contextValue === 'git') {
            // Git section - show Git information
            return this.getGitItems();
        } else if (element.contextValue === 'git-branches') {
            // Git branches section - show branch time breakdown
            return this.getGitBranchItems();
        } else if (element.contextValue === 'actions') {
            // Actions section - show action buttons
            return this.getActionItems();
        }
        
        return Promise.resolve([]);
    }

    /**
     * Get root level items
     */
    private async getRootItems(): Promise<TimeTrackerItem[]> {
        const items: TimeTrackerItem[] = [];
        
        // Status item
        const statusItem = new TimeTrackerItem(
            '📊 Time Tracker',
            vscode.TreeItemCollapsibleState.Expanded,
            'status'
        );
        statusItem.tooltip = 'Current tracking status and session info';
        items.push(statusItem);

        // Pomodoro item
        const pomodoroState = this.tracker.getPomodoroState();
        const pomodoroItem = new TimeTrackerItem(
            pomodoroState.isActive 
                ? `🍅 Pomodoro (${pomodoroState.isWorkSession ? 'Work' : 'Break'})`
                : '🍅 Pomodoro Timer',
            vscode.TreeItemCollapsibleState.Collapsed,
            'pomodoro'
        );
        pomodoroItem.tooltip = pomodoroState.isActive 
            ? `Current Pomodoro session: ${pomodoroState.isWorkSession ? 'Work' : 'Break'}`
            : 'Start Pomodoro timer for focused work sessions';
        items.push(pomodoroItem);

        // Project item
        const projectItem = new TimeTrackerItem(
            '📁 Project Details',
            vscode.TreeItemCollapsibleState.Collapsed,
            'project'
        );
        projectItem.tooltip = 'Project-specific time tracking data';
        items.push(projectItem);

        // Actions item
        const actionsItem = new TimeTrackerItem(
            '⚡ Actions',
            vscode.TreeItemCollapsibleState.Collapsed,
            'actions'
        );
        actionsItem.tooltip = 'Time tracking actions and commands';
        items.push(actionsItem);

        return items;
    }

    /**
     * Get status items
     */
    private async getStatusItems(): Promise<TimeTrackerItem[]> {
        const items: TimeTrackerItem[] = [];
        const status = this.tracker.getStatus();
        const todayEntry = this.tracker.getTodayEntry();

        // Current status
        let statusText = '⏹️ Stopped';
        if (status.isTracking) {
            statusText = status.isPaused ? '⏸️ Paused' : '⏱️ Tracking';
        }
        
        const statusItem = new TimeTrackerItem(
            `${statusText} - ${formatTime(todayEntry.totalSeconds)}`,
            vscode.TreeItemCollapsibleState.None,
            'status-item'
        );
        statusItem.tooltip = `Current status: ${statusText}`;
        items.push(statusItem);

        // Current file
        if (status.currentFile) {
            const currentFileItem = new TimeTrackerItem(
                `📄 ${truncatePath(getRelativeFilePath(status.currentFile), 40)}`,
                vscode.TreeItemCollapsibleState.None,
                'current-file'
            );
            currentFileItem.tooltip = `Currently tracking: ${status.currentFile}`;
            items.push(currentFileItem);
        }

        // Session start time
        if (status.isTracking && !status.isPaused) {
            const sessionItem = new TimeTrackerItem(
                `🕐 Session active`,
                vscode.TreeItemCollapsibleState.None,
                'session'
            );
            sessionItem.tooltip = 'Time tracking session is active';
            items.push(sessionItem);
        }

        return items;
    }

    /**
     * Get Pomodoro items
     */
    private async getPomodoroItems(): Promise<TimeTrackerItem[]> {
        const items: TimeTrackerItem[] = [];
        const pomodoroState = this.tracker.getPomodoroState();

        if (pomodoroState.isActive) {
            // Current session info
            const sessionType = pomodoroState.isWorkSession ? 'Work' : 'Break';
            const timeRemaining = PomodoroTimer.formatTime(pomodoroState.timeRemaining);
            
            const sessionItem = new TimeTrackerItem(
                `${pomodoroState.isWorkSession ? '🍅' : '☕'} ${sessionType} Session - ${timeRemaining}`,
                vscode.TreeItemCollapsibleState.None,
                'pomodoro-session'
            );
            sessionItem.tooltip = `Current ${sessionType.toLowerCase()} session: ${timeRemaining} remaining`;
            items.push(sessionItem);

            // Session stats
            const statsItem = new TimeTrackerItem(
                `📊 Sessions: ${pomodoroState.totalWorkSessions} work, ${pomodoroState.totalBreakSessions} break`,
                vscode.TreeItemCollapsibleState.None,
                'pomodoro-stats'
            );
            statsItem.tooltip = 'Total Pomodoro sessions completed today';
            items.push(statsItem);

            // Skip break action (only during break)
            if (!pomodoroState.isWorkSession) {
                const skipItem = new TimeTrackerItem(
                    '⏭️ Skip Break',
                    vscode.TreeItemCollapsibleState.None,
                    'skip-break'
                );
                skipItem.command = {
                    command: 'timeTracker.skipBreak',
                    title: 'Skip Break'
                };
                skipItem.tooltip = 'Skip current break and start work session';
                items.push(skipItem);
            }
        } else {
            // Start Pomodoro action
            const startItem = new TimeTrackerItem(
                '▶️ Start Pomodoro',
                vscode.TreeItemCollapsibleState.None,
                'start-pomodoro'
            );
            startItem.command = {
                command: 'timeTracker.startPomodoro',
                title: 'Start Pomodoro'
            };
            startItem.tooltip = 'Start a 25-minute Pomodoro work session';
            items.push(startItem);

            // Pomodoro info
            const infoItem = new TimeTrackerItem(
                'ℹ️ Pomodoro Technique: 25min work, 5min break',
                vscode.TreeItemCollapsibleState.None,
                'pomodoro-info'
            );
            infoItem.tooltip = 'Pomodoro Technique helps maintain focus and productivity';
            items.push(infoItem);
        }

        return items;
    }

    /**
     * Get project items
     */
    private async getProjectItems(): Promise<TimeTrackerItem[]> {
        const items: TimeTrackerItem[] = [];
        const todayEntry = this.tracker.getTodayEntry();

        // Project name
        const projectItem = new TimeTrackerItem(
            `📁 ${todayEntry.projectName}`,
            vscode.TreeItemCollapsibleState.None,
            'project-name'
        );
        projectItem.tooltip = `Project: ${todayEntry.projectName}`;
        items.push(projectItem);

        // Total time
        const totalItem = new TimeTrackerItem(
            `⏱️ Total: ${formatTime(todayEntry.totalSeconds)}`,
            vscode.TreeItemCollapsibleState.None,
            'total-time'
        );
        totalItem.tooltip = `Total time tracked today: ${formatTime(todayEntry.totalSeconds)}`;
        items.push(totalItem);

        // Files section
        if (Object.keys(todayEntry.files).length > 0) {
            const filesItem = new TimeTrackerItem(
                '📄 Top Files',
                vscode.TreeItemCollapsibleState.Collapsed,
                'files'
            );
            filesItem.tooltip = 'Files with most time tracked';
            items.push(filesItem);
        }

        // Languages section
        if (Object.keys(todayEntry.languages).length > 0) {
            const languagesItem = new TimeTrackerItem(
                '🔤 By Language',
                vscode.TreeItemCollapsibleState.Collapsed,
                'languages'
            );
            languagesItem.tooltip = 'Time breakdown by programming language';
            items.push(languagesItem);
        }

        // Git section
        const gitStats = this.tracker.getGitStats();
        if (gitStats && gitStats.currentBranch) {
            const gitItem = new TimeTrackerItem(
                '🌿 Git Info',
                vscode.TreeItemCollapsibleState.Collapsed,
                'git'
            );
            gitItem.tooltip = 'Git branch and commit information';
            items.push(gitItem);
        }

        return items;
    }

    /**
     * Get file items
     */
    private async getFileItems(): Promise<TimeTrackerItem[]> {
        const items: TimeTrackerItem[] = [];
        const todayEntry = this.tracker.getTodayEntry();
        const topFiles = getTopFiles(todayEntry.files, 10);

        for (const file of topFiles) {
            const fileItem = new TimeTrackerItem(
                `${truncatePath(getRelativeFilePath(file.filePath), 35)} - ${formatTime(file.seconds)}`,
                vscode.TreeItemCollapsibleState.None,
                'file-item'
            );
            fileItem.tooltip = `${file.filePath}\nLanguage: ${file.language}\nTime: ${formatTime(file.seconds)}`;
            fileItem.iconPath = this.getLanguageIcon(file.language);
            items.push(fileItem);
        }

        return items;
    }

    /**
     * Get language items
     */
    private async getLanguageItems(): Promise<TimeTrackerItem[]> {
        const items: TimeTrackerItem[] = [];
        const todayEntry = this.tracker.getTodayEntry();
        const topLanguages = getTopLanguages(todayEntry.languages, 10);

        for (const lang of topLanguages) {
            const langItem = new TimeTrackerItem(
                `${lang.language} - ${formatTime(lang.seconds)}`,
                vscode.TreeItemCollapsibleState.None,
                'language-item'
            );
            langItem.tooltip = `${lang.language}: ${formatTime(lang.seconds)}`;
            langItem.iconPath = this.getLanguageIcon(lang.language);
            items.push(langItem);
        }

        return items;
    }

    /**
     * Get Git items
     */
    private async getGitItems(): Promise<TimeTrackerItem[]> {
        const items: TimeTrackerItem[] = [];
        const gitStats = this.tracker.getGitStats();

        if (!gitStats) {
            const noGitItem = new TimeTrackerItem(
                '❌ No Git repository detected',
                vscode.TreeItemCollapsibleState.None,
                'no-git'
            );
            noGitItem.tooltip = 'Open a Git repository to see Git tracking information';
            items.push(noGitItem);
            return items;
        }

        // Current branch
        const branchItem = new TimeTrackerItem(
            `🌿 Branch: ${gitStats.currentBranch}`,
            vscode.TreeItemCollapsibleState.None,
            'git-branch'
        );
        branchItem.tooltip = `Current branch: ${gitStats.currentBranch}`;
        items.push(branchItem);

        // Last commit
        if (gitStats.lastCommit) {
            const commitItem = new TimeTrackerItem(
                `📝 Last commit: ${gitStats.lastCommit}`,
                vscode.TreeItemCollapsibleState.None,
                'git-commit'
            );
            commitItem.tooltip = `Last commit: ${gitStats.lastCommit}`;
            items.push(commitItem);
        }

        // Commit count
        const commitCountItem = new TimeTrackerItem(
            `🔢 Commits today: ${gitStats.commitCount}`,
            vscode.TreeItemCollapsibleState.None,
            'git-commits'
        );
        commitCountItem.tooltip = `Total commits tracked today: ${gitStats.commitCount}`;
        items.push(commitCountItem);

        // Branch time breakdown
        const branchTimes = Object.entries(gitStats.branchTime);
        if (branchTimes.length > 0) {
            const branchTimeItem = new TimeTrackerItem(
                '⏱️ Time by Branch',
                vscode.TreeItemCollapsibleState.Collapsed,
                'git-branches'
            );
            branchTimeItem.tooltip = 'Time spent on each branch';
            items.push(branchTimeItem);
        }

        return items;
    }

    /**
     * Get Git branch items
     */
    private async getGitBranchItems(): Promise<TimeTrackerItem[]> {
        const items: TimeTrackerItem[] = [];
        const gitStats = this.tracker.getGitStats();

        if (!gitStats) {
            return items;
        }

        const branchTimes = Object.entries(gitStats.branchTime)
            .sort(([, a], [, b]) => b - a); // Sort by time descending

        for (const [branchName, seconds] of branchTimes) {
            const branchItem = new TimeTrackerItem(
                `🌿 ${branchName} - ${formatTime(seconds)}`,
                vscode.TreeItemCollapsibleState.None,
                'git-branch-item'
            );
            branchItem.tooltip = `Branch: ${branchName}\nTime: ${formatTime(seconds)}`;
            items.push(branchItem);
        }

        return items;
    }

    /**
     * Get action items
     */
    private async getActionItems(): Promise<TimeTrackerItem[]> {
        const items: TimeTrackerItem[] = [];
        const status = this.tracker.getStatus();

        // Start/Pause/Resume button
        if (!status.isTracking) {
            const startItem = new TimeTrackerItem(
                '▶️ Start Tracking',
                vscode.TreeItemCollapsibleState.None,
                'action-start'
            );
            startItem.command = {
                command: 'timeTracker.start',
                title: 'Start Tracking'
            };
            startItem.tooltip = 'Start time tracking';
            items.push(startItem);
        } else if (status.isPaused) {
            const resumeItem = new TimeTrackerItem(
                '▶️ Resume',
                vscode.TreeItemCollapsibleState.None,
                'action-resume'
            );
            resumeItem.command = {
                command: 'timeTracker.resume',
                title: 'Resume Tracking'
            };
            resumeItem.tooltip = 'Resume time tracking';
            items.push(resumeItem);
        } else {
            const pauseItem = new TimeTrackerItem(
                '⏸️ Pause',
                vscode.TreeItemCollapsibleState.None,
                'action-pause'
            );
            pauseItem.command = {
                command: 'timeTracker.pause',
                title: 'Pause Tracking'
            };
            pauseItem.tooltip = 'Pause time tracking';
            items.push(pauseItem);
        }

        // Export button
        const exportItem = new TimeTrackerItem(
            '📊 Export Report',
            vscode.TreeItemCollapsibleState.None,
            'action-export'
        );
        exportItem.command = {
            command: 'timeTracker.export',
            title: 'Export Report'
        };
        exportItem.tooltip = 'Export time tracking data';
        items.push(exportItem);

        // Reset button
        const resetItem = new TimeTrackerItem(
            '🔄 Reset Today',
            vscode.TreeItemCollapsibleState.None,
            'action-reset'
        );
        resetItem.command = {
            command: 'timeTracker.reset',
            title: 'Reset Today'
        };
        resetItem.tooltip = 'Reset today\'s tracking data';
        items.push(resetItem);

        return items;
    }

    /**
     * Get language icon
     */
    private getLanguageIcon(language: string): vscode.ThemeIcon {
        const iconMap: { [key: string]: string } = {
            'typescript': 'symbol-class',
            'javascript': 'symbol-function',
            'python': 'symbol-method',
            'java': 'symbol-class',
            'csharp': 'symbol-class',
            'cpp': 'symbol-class',
            'c': 'symbol-class',
            'html': 'symbol-text',
            'css': 'symbol-color',
            'json': 'symbol-object',
            'markdown': 'symbol-text',
            'xml': 'symbol-text',
            'yaml': 'symbol-text',
            'plaintext': 'symbol-text'
        };

        const iconName = iconMap[language.toLowerCase()] || 'symbol-text';
        return new vscode.ThemeIcon(iconName);
    }
}

export class TimeTrackerItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string
    ) {
        super(label, collapsibleState);
    }
}
