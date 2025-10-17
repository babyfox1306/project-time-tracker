import * as vscode from 'vscode';
import { StorageManager, TimeEntry } from './storage';
import { getLanguageId, getRelativeFilePath, getConfigValue, isVSCodeActive } from './utils';

export class TimeTracker {
    private storage: StorageManager;
    private isTracking: boolean = false;
    private isPaused: boolean = false;
    private currentFile: string | null = null;
    private currentLanguage: string | null = null;
    private fileStartTime: number = 0;
    private updateInterval: any = null;
    private statusBarItem: vscode.StatusBarItem;
    private onUpdateCallback: (() => void) | null = null;
    private breakReminderShown: boolean = false;
    private sessionStartTime: number = 0;

    constructor(storage: StorageManager) {
        this.storage = storage;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.command = 'timeTracker.pause';
        this.setupEventListeners();
    }

    /**
     * Setup VS Code event listeners
     */
    private setupEventListeners(): void {
        // Track file changes
        vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
            if (this.isTracking && !this.isPaused) {
                this.handleFileChange(editor);
            }
        });

        // Track text document changes (actual editing)
        vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
            if (this.isTracking && !this.isPaused && event.document === vscode.window.activeTextEditor?.document) {
                this.handleTextChange();
            }
        });

        // Pause when VS Code loses focus
        vscode.window.onDidChangeWindowState((state: vscode.WindowState) => {
            if (this.isTracking && getConfigValue('pauseOnInactive', true)) {
                if (!state.focused) {
                    this.pause();
                } else if (this.isPaused && state.focused) {
                    this.resume();
                }
            }
        });

        // Handle workspace changes
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            if (this.isTracking) {
                this.handleWorkspaceChange();
            }
        });
    }

    /**
     * Start time tracking
     */
    public start(): void {
        if (this.isTracking) {
            return;
        }

        this.isTracking = true;
        this.isPaused = false;
        this.sessionStartTime = Date.now();
        this.breakReminderShown = false;
        
        // Start tracking current file if editor is open
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            this.handleFileChange(activeEditor);
        }

        // Start update interval
        this.startUpdateInterval();
        
        // Update status bar
        this.updateStatusBar();
        
        vscode.window.showInformationMessage('Time tracking started');
    }

    /**
     * Pause time tracking
     */
    public pause(): void {
        if (!this.isTracking || this.isPaused) {
            return;
        }

        this.isPaused = true;
        
        // Save current file time before pausing
        if (this.currentFile && this.currentLanguage) {
            this.saveCurrentFileTime();
        }

        // Stop update interval
        this.stopUpdateInterval();
        
        // Update status bar
        this.updateStatusBar();
        
        vscode.window.showInformationMessage('Time tracking paused');
    }

    /**
     * Resume time tracking
     */
    public resume(): void {
        if (!this.isTracking || !this.isPaused) {
            return;
        }

        this.isPaused = false;
        
        // Restart tracking current file
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            this.handleFileChange(activeEditor);
        }

        // Restart update interval
        this.startUpdateInterval();
        
        // Update status bar
        this.updateStatusBar();
        
        vscode.window.showInformationMessage('Time tracking resumed');
    }

    /**
     * Stop time tracking completely
     */
    public stop(): void {
        if (!this.isTracking) {
            return;
        }

        this.isTracking = false;
        this.isPaused = false;
        
        // Save current file time
        if (this.currentFile && this.currentLanguage) {
            this.saveCurrentFileTime();
        }

        // Stop update interval
        this.stopUpdateInterval();
        
        // Clear current file
        this.currentFile = null;
        this.currentLanguage = null;
        
        // Update status bar
        this.updateStatusBar();
        
        vscode.window.showInformationMessage('Time tracking stopped');
    }

    /**
     * Reset today's data
     */
    public async resetToday(): Promise<void> {
        const result = await vscode.window.showWarningMessage(
            'Are you sure you want to reset today\'s time tracking data?',
            'Yes', 'No'
        );

        if (result === 'Yes') {
            await this.storage.clearTodayData();
            this.updateStatusBar();
            vscode.window.showInformationMessage('Today\'s data has been reset');
        }
    }

    /**
     * Get current tracking status
     */
    public getStatus(): { isTracking: boolean; isPaused: boolean; currentFile: string | null } {
        return {
            isTracking: this.isTracking,
            isPaused: this.isPaused,
            currentFile: this.currentFile
        };
    }

    /**
     * Get today's time entry
     */
    public getTodayEntry(): TimeEntry {
        return this.storage.getOrCreateTodayEntry();
    }

    /**
     * Set callback for UI updates
     */
    public setUpdateCallback(callback: () => void): void {
        this.onUpdateCallback = callback;
    }

    /**
     * Handle file change event
     */
    private handleFileChange(editor: vscode.TextEditor | undefined): void {
        if (!editor) {
            return;
        }

        // Save previous file time
        if (this.currentFile && this.currentLanguage) {
            this.saveCurrentFileTime();
        }

        // Start tracking new file
        this.currentFile = editor.document.fileName;
        this.currentLanguage = getLanguageId(editor.document);
        this.fileStartTime = Date.now();
    }

    /**
     * Handle text change event (user is actively editing)
     */
    private handleTextChange(): void {
        // This ensures we're tracking active editing time
        // The actual time saving happens in the update interval
    }

    /**
     * Handle workspace change
     */
    private handleWorkspaceChange(): void {
        // Reset current file when workspace changes
        if (this.currentFile && this.currentLanguage) {
            this.saveCurrentFileTime();
        }
        
        this.currentFile = null;
        this.currentLanguage = null;
        this.fileStartTime = 0;
    }

    /**
     * Save current file time to storage
     */
    private async saveCurrentFileTime(): Promise<void> {
        if (!this.currentFile || !this.currentLanguage) {
            return;
        }

        const now = Date.now();
        const timeSpent = Math.floor((now - this.fileStartTime) / 1000);
        
        // Only save if minimum time threshold is met
        const minActiveSeconds = getConfigValue('minActiveSeconds', 5);
        if (timeSpent >= minActiveSeconds) {
            const relativePath = getRelativeFilePath(this.currentFile);
            await this.storage.updateFileTime(relativePath, this.currentLanguage, timeSpent);
        }

        // Reset file start time
        this.fileStartTime = now;
    }

    /**
     * Start update interval
     */
    private startUpdateInterval(): void {
        this.stopUpdateInterval();
        
        this.updateInterval = setInterval(async () => {
            if (this.isTracking && !this.isPaused && this.currentFile && this.currentLanguage) {
                await this.saveCurrentFileTime();
                this.updateStatusBar();
                
                // Check for break reminder (2 hours = 7200 seconds)
                this.checkBreakReminder();
                
                // Trigger UI update callback
                if (this.onUpdateCallback) {
                    this.onUpdateCallback();
                }
            }
        }, 5000); // Update every 5 seconds
    }

    /**
     * Stop update interval
     */
    private stopUpdateInterval(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Check if break reminder should be shown (after configured hours of continuous work)
     */
    private checkBreakReminder(): void {
        if (this.breakReminderShown) {
            return;
        }

        // Check if break reminder is enabled
        const isEnabled = getConfigValue('breakReminderEnabled', true);
        if (!isEnabled) {
            return;
        }

        const now = Date.now();
        const sessionDuration = Math.floor((now - this.sessionStartTime) / 1000);
        const reminderHours = getConfigValue('breakReminderHours', 2);
        const reminderSeconds = reminderHours * 60 * 60;

        if (sessionDuration >= reminderSeconds) {
            this.showBreakReminder();
            this.breakReminderShown = true;
        }
    }

    /**
     * Show cute break reminder notification
     */
    private async showBreakReminder(): Promise<void> {
        const messages = [
            "💝 Làm việc 2h rồi, đi bộ lấy chút nước nhé! 💝",
            "🌸 Anh em làm việc 2h rồi, nghỉ ngơi chút đi! 🌸",
            "☕ Đã 2h coding rồi, uống cà phê đi bạn! ☕",
            "🌿 Làm việc 2h liền, đi dạo chút cho khỏe! 🌿",
            "💖 Code 2h rồi, nghỉ ngơi để não thông minh hơn! 💖"
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        const result = await vscode.window.showInformationMessage(
            randomMessage,
            'Nghỉ ngơi 5 phút',
            'Tiếp tục làm',
            'Pause tracking'
        );

        if (result === 'Nghỉ ngơi 5 phút') {
            vscode.window.showInformationMessage('💝 Tuyệt vời! Nghỉ ngơi để làm việc hiệu quả hơn! 💝');
        } else if (result === 'Pause tracking') {
            this.pause();
        }
    }

    /**
     * Update status bar
     */
    private updateStatusBar(): void {
        const entry = this.getTodayEntry();
        const totalTime = formatTime(entry.totalSeconds);
        
        if (this.isTracking) {
            if (this.isPaused) {
                this.statusBarItem.text = `⏸️ ${totalTime} (Paused)`;
                this.statusBarItem.command = 'timeTracker.resume';
            } else {
                this.statusBarItem.text = `⏱️ ${totalTime}`;
                this.statusBarItem.command = 'timeTracker.pause';
            }
            this.statusBarItem.show();
        } else {
            this.statusBarItem.hide();
        }
    }

    /**
     * Dispose resources
     */
    public dispose(): void {
        this.stop();
        this.statusBarItem.dispose();
    }
}

/**
 * Format time helper function
 */
function formatTime(seconds: number): string {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
        return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
}
