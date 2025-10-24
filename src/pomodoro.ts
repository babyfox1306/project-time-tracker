import * as vscode from 'vscode';
import { getConfigValue } from './utils';
import { StorageManager } from './storage';

export interface PomodoroState {
    isActive: boolean;
    isWorkSession: boolean;
    timeRemaining: number; // in seconds
    sessionStartTime: number;
    totalWorkSessions: number;
    totalBreakSessions: number;
}

export class PomodoroTimer {
    private state: PomodoroState;
    private updateInterval: NodeJS.Timeout | null = null;
    private onUpdateCallback: ((state: PomodoroState) => void) | null = null;
    private onSessionCompleteCallback: ((isWorkSession: boolean) => void) | null = null;
    private lastNotificationTime: number = 0;
    private notificationThrottleMs: number = 3000; // 3 seconds between notifications
    private storage: StorageManager;

    constructor(storage: StorageManager) {
        this.storage = storage;
        this.state = {
            isActive: false,
            isWorkSession: true,
            timeRemaining: 0,
            sessionStartTime: 0,
            totalWorkSessions: 0,
            totalBreakSessions: 0
        };
        this.loadPomodoroStats();
    }

    /**
     * Start Pomodoro timer
     */
    public start(): void {
        if (this.state.isActive) {
            return;
        }

        const isEnabled = getConfigValue('pomodoroEnabled', true);
        if (!isEnabled) {
            vscode.window.showWarningMessage('Pomodoro timer is disabled in settings');
            return;
        }

        this.state.isActive = true;
        this.state.isWorkSession = true;
        this.state.sessionStartTime = Date.now();
        this.state.timeRemaining = getConfigValue('pomodoroWorkMinutes', 25) * 60;

        this.startUpdateInterval();
        this.showNotification('🍅 Pomodoro started! Focus time begins now.', 'info');
        this.playSound('start');
    }

    /**
     * Stop Pomodoro timer
     */
    public stop(): void {
        if (!this.state.isActive) {
            return;
        }

        this.state.isActive = false;
        this.stopUpdateInterval();
        this.showNotification('⏹️ Pomodoro stopped', 'info');
        this.playSound('stop');
    }

    /**
     * Skip current break and start work session
     */
    public skipBreak(): void {
        if (!this.state.isActive || this.state.isWorkSession) {
            return;
        }

        this.startWorkSession();
        this.showNotification('🚀 Break skipped! Back to work!', 'info');
        this.playSound('work');
    }

    /**
     * Get current Pomodoro state
     */
    public getState(): PomodoroState {
        return { ...this.state };
    }

    /**
     * Set callback for state updates
     */
    public setUpdateCallback(callback: (state: PomodoroState) => void): void {
        this.onUpdateCallback = callback;
    }

    /**
     * Set callback for session completion
     */
    public setSessionCompleteCallback(callback: (isWorkSession: boolean) => void): void {
        this.onSessionCompleteCallback = callback;
    }

    /**
     * Start work session
     */
    private startWorkSession(): void {
        this.state.isWorkSession = true;
        this.state.sessionStartTime = Date.now();
        this.state.timeRemaining = getConfigValue('pomodoroWorkMinutes', 25) * 60;
        this.state.totalWorkSessions++;
        this.savePomodoroStats();
    }

    /**
     * Start break session
     */
    private startBreakSession(): void {
        this.state.isWorkSession = false;
        this.state.sessionStartTime = Date.now();
        this.state.timeRemaining = getConfigValue('pomodoroBreakMinutes', 5) * 60;
        this.state.totalBreakSessions++;
        this.savePomodoroStats();
    }

    /**
     * Start update interval
     */
    private startUpdateInterval(): void {
        this.stopUpdateInterval();
        
        this.updateInterval = setInterval(() => {
            if (!this.state.isActive) {
                return;
            }

            this.state.timeRemaining--;

            // Trigger update callback
            if (this.onUpdateCallback) {
                this.onUpdateCallback(this.state);
            }

            // Check if session is complete
            if (this.state.timeRemaining <= 0) {
                this.handleSessionComplete();
            }
        }, 1000); // Update every second
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
     * Handle session completion
     */
    private handleSessionComplete(): void {
        const wasWorkSession = this.state.isWorkSession;
        
        // Trigger session complete callback
        if (this.onSessionCompleteCallback) {
            this.onSessionCompleteCallback(wasWorkSession);
        }

        if (wasWorkSession) {
            // Work session completed, start break
            this.startBreakSession();
            this.showNotification(
                '🎉 Work session complete! Time for a break!',
                'info'
            );
            this.playSound('break');
        } else {
            // Break completed, start work
            this.startWorkSession();
            this.showNotification(
                '💪 Break time over! Ready to focus again?',
                'info'
            );
            this.playSound('work');
        }
    }

    /**
     * Show notification with throttling
     */
    private showNotification(message: string, type: 'info' | 'warning' | 'error'): void {
        const now = Date.now();
        if (now - this.lastNotificationTime < this.notificationThrottleMs) {
            return; // Skip notification if too soon
        }
        this.lastNotificationTime = now;

        const actions = this.state.isWorkSession 
            ? ['Start Break', 'Stop Pomodoro']
            : ['Start Work', 'Skip Break', 'Stop Pomodoro'];

        const actionPromise = vscode.window.showInformationMessage(message, ...actions);
        
        actionPromise.then(selection => {
            switch (selection) {
                case 'Start Break':
                    if (this.state.isWorkSession) {
                        this.startBreakSession();
                    }
                    break;
                case 'Start Work':
                    if (!this.state.isWorkSession) {
                        this.startWorkSession();
                    }
                    break;
                case 'Skip Break':
                    this.skipBreak();
                    break;
                case 'Stop Pomodoro':
                    this.stop();
                    break;
            }
        });
    }

    /**
     * Play sound for Pomodoro events
     */
    private playSound(type: 'start' | 'stop' | 'work' | 'break'): void {
        try {
            // Use VS Code's built-in sound system
            const soundMap = {
                'start': 'notification',
                'stop': 'notification',
                'work': 'notification',
                'break': 'notification'
            };
            
            // Play system notification sound
            vscode.window.showInformationMessage('🔊', { modal: false });
        } catch (error) {
            // Fallback: just log the sound event
            console.log(`Pomodoro sound: ${type}`);
        }
    }

    /**
     * Format time for display
     */
    public static formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Load Pomodoro stats from storage
     */
    private loadPomodoroStats(): void {
        const stats = this.storage.getPomodoroStats();
        this.state.totalWorkSessions = stats.totalWorkSessions;
        this.state.totalBreakSessions = stats.totalBreakSessions;
    }

    /**
     * Save Pomodoro stats to storage
     */
    private savePomodoroStats(): void {
        this.storage.updatePomodoroStats(
            this.state.totalWorkSessions,
            this.state.totalBreakSessions,
            this.state.isWorkSession ? 'work' : 'break'
        );
    }

    /**
     * Dispose resources
     */
    public dispose(): void {
        this.stop();
    }
}