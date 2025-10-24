import * as vscode from 'vscode';
import { StorageManager } from './storage';
import { TimeTracker } from './tracker';
import { TimeTrackerTreeProvider } from './treeView';
import { ReportGenerator } from './reportGenerator';
import { getConfigValue } from './utils';

let storage: StorageManager;
let tracker: TimeTracker;
let treeProvider: TimeTrackerTreeProvider;
let reportGenerator: ReportGenerator;

export function activate(context: vscode.ExtensionContext) {
    console.log('Project Time Tracker extension is now active!');

    // Initialize components
    storage = new StorageManager(context);
    tracker = new TimeTracker(storage);
    treeProvider = new TimeTrackerTreeProvider(storage, tracker);
    reportGenerator = new ReportGenerator(storage);

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
