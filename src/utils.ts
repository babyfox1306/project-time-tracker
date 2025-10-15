import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Format seconds into human-readable time string
 * @param seconds Total seconds
 * @returns Formatted string like "2h 34m" or "45m" or "30s"
 */
export function formatTime(seconds: number): string {
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

/**
 * Get current date in ISO format (YYYY-MM-DD)
 */
export function getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get project name from workspace
 */
export function getProjectName(): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return 'No Workspace';
    }
    
    // Use the first workspace folder name
    const workspaceName = workspaceFolders[0].name;
    return workspaceName || 'Untitled';
}

/**
 * Get relative file path from workspace root
 */
export function getRelativeFilePath(filePath: string): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return path.basename(filePath);
    }
    
    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    try {
        const relativePath = path.relative(workspaceRoot, filePath);
        return relativePath || path.basename(filePath);
    } catch {
        return path.basename(filePath);
    }
}

/**
 * Get language ID from document
 */
export function getLanguageId(document: vscode.TextDocument): string {
    return document.languageId || 'plaintext';
}

/**
 * Aggregate time by language from files data
 */
export function aggregateByLanguage(files: { [filePath: string]: { seconds: number; language: string; lastActive: number } }): { [languageId: string]: number } {
    const languages: { [languageId: string]: number } = {};
    
    for (const fileData of Object.values(files)) {
        const lang = fileData.language;
        languages[lang] = (languages[lang] || 0) + fileData.seconds;
    }
    
    return languages;
}

/**
 * Get top files by time spent
 */
export function getTopFiles(files: { [filePath: string]: { seconds: number; language: string; lastActive: number } }, limit: number = 5): Array<{ filePath: string; seconds: number; language: string }> {
    return Object.entries(files)
        .map(([filePath, data]) => ({ filePath, ...data }))
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, limit);
}

/**
 * Get top languages by time spent
 */
export function getTopLanguages(languages: { [languageId: string]: number }, limit: number = 5): Array<{ language: string; seconds: number }> {
    return Object.entries(languages)
        .map(([language, seconds]) => ({ language, seconds }))
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, limit);
}

/**
 * Truncate file path for display
 */
export function truncatePath(filePath: string, maxLength: number = 50): string {
    if (filePath.length <= maxLength) {
        return filePath;
    }
    
    const parts = filePath.split('/');
    if (parts.length <= 2) {
        return filePath.substring(0, maxLength - 3) + '...';
    }
    
    // Keep first and last parts
    const first = parts[0];
    const last = parts[parts.length - 1];
    const middle = '...';
    
    const availableLength = maxLength - first.length - last.length - middle.length;
    if (availableLength > 0) {
        return `${first}/${middle}/${last}`;
    }
    
    return `${first}...${last}`;
}

/**
 * Check if VS Code is currently active/focused
 */
export function isVSCodeActive(): boolean {
    return vscode.window.state.focused;
}

/**
 * Get configuration value with fallback
 */
export function getConfigValue<T>(key: string, defaultValue: T): T {
    const config = vscode.workspace.getConfiguration('timeTracker');
    return config.get<T>(key, defaultValue);
}
