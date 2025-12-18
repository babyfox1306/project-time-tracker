import * as vscode from 'vscode';
import { StorageManager } from './storage';
import { TimeTracker } from './tracker';
import { TimeTrackerTreeProvider } from './treeView';
import { ReportGenerator } from './reportGenerator';
import { GitAnalytics } from './gitAnalytics';
import { getConfigValue, formatTime } from './utils';

let storage: StorageManager;
let tracker: TimeTracker;
let treeProvider: TimeTrackerTreeProvider;
let reportGenerator: ReportGenerator;
let gitAnalytics: GitAnalytics;

export function activate(context: vscode.ExtensionContext) {
    console.log('Project Time Tracker extension is now active!');

    // Initialize components
    storage = new StorageManager(context);
    tracker = new TimeTracker(storage);
    treeProvider = new TimeTrackerTreeProvider(storage, tracker);
    reportGenerator = new ReportGenerator(storage);
    gitAnalytics = new GitAnalytics(storage);

    // Register tree view
    const treeView = vscode.window.createTreeView('timeTrackerView', {
        treeDataProvider: treeProvider,
        showCollapseAll: true
    });

    // Register commands
    const commands = [
        vscode.commands.registerCommand('timeTracker.start', () => {
            tracker.start();
            treeProvider.refresh();
        }),

        vscode.commands.registerCommand('timeTracker.pause', () => {
            tracker.pause();
            treeProvider.refresh();
        }),

        vscode.commands.registerCommand('timeTracker.resume', () => {
            tracker.resume();
            treeProvider.refresh();
        }),

        vscode.commands.registerCommand('timeTracker.export', () => {
            reportGenerator.showExportOptions();
        }),

        vscode.commands.registerCommand('timeTracker.reset', async () => {
            await tracker.resetToday();
            treeProvider.refresh();
        }),

        vscode.commands.registerCommand('timeTracker.viewStats', () => {
            showDetailedStats();
        }),

        vscode.commands.registerCommand('timeTracker.startPomodoro', () => {
            tracker.startPomodoro();
            treeProvider.refresh();
        }),

        vscode.commands.registerCommand('timeTracker.skipBreak', () => {
            tracker.skipBreak();
            treeProvider.refresh();
        }),

        vscode.commands.registerCommand('timeTracker.viewGitStats', () => {
            showGitStats();
        })
    ];

    // Add commands to context
    context.subscriptions.push(...commands);
    context.subscriptions.push(treeView);
    context.subscriptions.push(tracker);

    // Auto-start if enabled
    if (getConfigValue('autoStart', true)) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            tracker.start();
            treeProvider.refresh();
        }
    }

    // Show welcome message
    showWelcomeMessage();
}

export function deactivate() {
    if (tracker) {
        tracker.dispose();
    }
}

/**
 * Show detailed statistics in a new document
 */
async function showDetailedStats(): Promise<void> {
    const stats = reportGenerator.generateQuickStats();
    const statsDocument = await vscode.workspace.openTextDocument({
        content: stats,
        language: 'markdown'
    });
    
    await vscode.window.showTextDocument(statsDocument);
}

/**
 * Show Git analytics in a new document
 */
async function showGitStats(): Promise<void> {
    // Ask user for date range
    const dateRangeOptions = [
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
        { label: 'All Time', value: 'all' },
        { label: 'Custom Range', value: 'custom' }
    ];

    const selected = await vscode.window.showQuickPick(dateRangeOptions, {
        placeHolder: 'Select date range for Git analytics'
    });

    if (!selected) {
        return;
    }

    let startDate: string | undefined;
    let endDate: string | undefined;

    if (selected.value === 'today') {
        const today = new Date().toISOString().split('T')[0];
        startDate = today;
        endDate = today;
    } else if (selected.value === 'week') {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
    } else if (selected.value === 'month') {
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
    } else if (selected.value === 'custom') {
        startDate = await vscode.window.showInputBox({
            prompt: 'Enter start date (YYYY-MM-DD)',
            placeHolder: '2025-01-01'
        }) || undefined;

        if (!startDate) {
            return;
        }

        endDate = await vscode.window.showInputBox({
            prompt: 'Enter end date (YYYY-MM-DD)',
            placeHolder: '2025-01-31'
        }) || undefined;

        if (!endDate) {
            return;
        }
    }

    // Get commit timeline
    const commits = gitAnalytics.getCommitTimeline(startDate, endDate);
    
    // Get branch switching info
    const branchSwitching = gitAnalytics.getBranchSwitchingFrequency({
        startDate,
        endDate
    });

    // Get productivity stats
    const productivityStats = gitAnalytics.getGitProductivityStats({
        startDate,
        endDate
    });

    // Format the report
    const lines: string[] = [];
    lines.push('# Git Analytics Report\n');
    
    if (startDate && endDate) {
        lines.push(`**Date Range:** ${startDate} to ${endDate}\n`);
    } else {
        lines.push(`**Date Range:** All Time\n`);
    }

    // Productivity Stats
    lines.push('## Productivity Statistics\n');
    lines.push(`- **Total Commits:** ${productivityStats.totalCommits}`);
    lines.push(`- **Total Time Spent:** ${formatTime(productivityStats.totalTimeSpent)}`);
    lines.push(`- **Average Time per Commit:** ${formatTime(productivityStats.averageTimePerCommit)}`);
    lines.push(`- **Most Active Branch:** ${productivityStats.mostActiveBranch}`);
    lines.push(`- **Branch Switches:** ${productivityStats.branchSwitchCount}`);
    lines.push(`- **Average Time Between Commits:** ${formatTime(productivityStats.averageTimeBetweenCommits)}\n`);

    // Branch Switching
    if (branchSwitching.switches.length > 0) {
        lines.push('## Branch Switching\n');
        lines.push(`**Total Switches:** ${branchSwitching.switchCount}`);
        lines.push(`**Average Time Between Switches:** ${formatTime(branchSwitching.averageTimeBetweenSwitches)}\n`);
        lines.push('### Switch History\n');
        
        for (const switchInfo of branchSwitching.switches) {
            const date = new Date(switchInfo.timestamp).toLocaleString();
            lines.push(`- **${switchInfo.fromBranch}** → **${switchInfo.toBranch}** (${date})`);
        }
        lines.push('');
    }

    // Commit Timeline
    lines.push('## Commit Timeline\n');
    if (commits.length === 0) {
        lines.push('No commits found in the selected date range.\n');
    } else {
        lines.push(`**Total Commits:** ${commits.length}\n`);
        lines.push('| Commit | Branch | Timestamp | Time Spent | Time Since Previous |');
        lines.push('|--------|--------|-----------|------------|---------------------|');
        
        for (const commit of commits) {
            const date = new Date(commit.timestamp).toLocaleString();
            const timeSpent = formatTime(commit.timeSpent);
            const timeBetween = commit.timeBetweenCommits 
                ? formatTime(Math.floor(commit.timeBetweenCommits / 1000))
                : 'N/A';
            
            lines.push(`| ${commit.commitHash.substring(0, 8)} | ${commit.branch} | ${date} | ${timeSpent} | ${timeBetween} |`);
        }
    }

    const content = lines.join('\n');
    const statsDocument = await vscode.workspace.openTextDocument({
        content: content,
        language: 'markdown'
    });
    
    await vscode.window.showTextDocument(statsDocument);
}

/**
 * Show welcome message with quick start guide
 */
function showWelcomeMessage(): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showInformationMessage(
            'Project Time Tracker: Open a workspace to start tracking time automatically!'
        );
        return;
    }

    // Check if this is first time use
    const todayEntry = storage.getTodayEntry();
    if (!todayEntry || todayEntry.totalSeconds === 0) {
        const action = vscode.window.showInformationMessage(
            'Project Time Tracker is ready! Time tracking will start automatically when you edit files.',
            'View Sidebar',
            'Start Tracking',
            'Settings'
        );

        action.then(selection => {
            switch (selection) {
                case 'View Sidebar':
                    vscode.commands.executeCommand('timeTrackerView.focus');
                    break;
                case 'Start Tracking':
                    tracker.start();
                    treeProvider.refresh();
                    break;
                case 'Settings':
                    vscode.commands.executeCommand('workbench.action.openSettings', 'timeTracker');
                    break;
            }
        });
    }
}

/**
 * Handle configuration changes
 */
function onConfigurationChanged(e: vscode.ConfigurationChangeEvent): void {
    if (e.affectsConfiguration('timeTracker')) {
        // Refresh tree view when settings change
        treeProvider.refresh();
    }
}

// Register configuration change listener
vscode.workspace.onDidChangeConfiguration(onConfigurationChanged);
