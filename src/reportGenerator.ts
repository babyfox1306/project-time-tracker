import * as vscode from 'vscode';
import * as path from 'path';
import { StorageManager, TimeEntry } from './storage';
import { formatTime, getRelativeFilePath, getTopFiles, getTopLanguages } from './utils';

export class ReportGenerator {
    private storage: StorageManager;

    constructor(storage: StorageManager) {
        this.storage = storage;
    }

    /**
     * Show export options and generate report
     */
    public async showExportOptions(): Promise<void> {
        const options = [
            { label: 'CSV Report', description: 'Export as CSV file for Excel', format: 'csv' },
            { label: 'Markdown Report', description: 'Export as Markdown file', format: 'markdown' },
            { label: 'Today Only', description: 'Export today\'s data only', format: 'today' },
            { label: 'Date Range', description: 'Export data for specific date range', format: 'range' }
        ];

        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: 'Choose export format and scope'
        });

        if (!selected) {
            return;
        }

        try {
            if (selected.format === 'today') {
                await this.exportToday();
            } else if (selected.format === 'range') {
                await this.exportDateRange();
            } else {
                await this.exportAll(selected.format as 'csv' | 'markdown');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Export failed: ${error}`);
        }
    }

    /**
     * Export today's data
     */
    private async exportToday(): Promise<void> {
        const todayEntry = this.storage.getTodayEntry();
        if (!todayEntry) {
            vscode.window.showWarningMessage('No data found for today');
            return;
        }

        const format = await this.chooseFormat();
        if (!format) return;

        const content = format === 'csv' 
            ? this.generateCSV([todayEntry])
            : this.generateMarkdown([todayEntry]);

        await this.saveReport(content, format, 'today');
    }

    /**
     * Export data for date range
     */
    private async exportDateRange(): Promise<void> {
        const startDate = await vscode.window.showInputBox({
            prompt: 'Enter start date (YYYY-MM-DD)',
            placeHolder: '2025-01-01'
        });

        if (!startDate) return;

        const endDate = await vscode.window.showInputBox({
            prompt: 'Enter end date (YYYY-MM-DD)',
            placeHolder: '2025-01-31'
        });

        if (!endDate) return;

        const entries = this.storage.getEntriesForDateRange(startDate, endDate);
        if (entries.length === 0) {
            vscode.window.showWarningMessage('No data found for the specified date range');
            return;
        }

        const format = await this.chooseFormat();
        if (!format) return;

        const content = format === 'csv' 
            ? this.generateCSV(entries)
            : this.generateMarkdown(entries);

        await this.saveReport(content, format, `${startDate}_to_${endDate}`);
    }

    /**
     * Export all data
     */
    private async exportAll(format: 'csv' | 'markdown'): Promise<void> {
        const allData = this.storage.getAllData();
        const entries: TimeEntry[] = [];

        for (const dateKey in allData) {
            for (const projectKey in allData[dateKey]) {
                entries.push(allData[dateKey][projectKey]);
            }
        }

        if (entries.length === 0) {
            vscode.window.showWarningMessage('No data found to export');
            return;
        }

        const content = format === 'csv' 
            ? this.generateCSV(entries)
            : this.generateMarkdown(entries);

        await this.saveReport(content, format, 'all');
    }

    /**
     * Choose export format
     */
    private async chooseFormat(): Promise<'csv' | 'markdown' | undefined> {
        const format = await vscode.window.showQuickPick([
            { label: 'CSV', description: 'For Excel and data analysis' },
            { label: 'Markdown', description: 'For documentation and sharing' }
        ], {
            placeHolder: 'Choose export format'
        });

        return format?.label.toLowerCase() as 'csv' | 'markdown' | undefined;
    }

    /**
     * Generate CSV content
     */
    private generateCSV(entries: TimeEntry[]): string {
        const headers = ['Date', 'Project', 'File', 'Language', 'Time (seconds)', 'Time (formatted)'];
        const rows: string[] = [headers.join(',')];

        for (const entry of entries) {
            if (Object.keys(entry.files).length === 0) {
                // No files tracked, add summary row
                rows.push([
                    entry.date,
                    entry.projectName,
                    'Total',
                    'All',
                    entry.totalSeconds.toString(),
                    formatTime(entry.totalSeconds)
                ].join(','));
            } else {
                // Add individual file rows
                for (const [filePath, fileData] of Object.entries(entry.files)) {
                    rows.push([
                        entry.date,
                        entry.projectName,
                        filePath,
                        fileData.language,
                        fileData.seconds.toString(),
                        formatTime(fileData.seconds)
                    ].join(','));
                }
            }
        }

        return rows.join('\n');
    }

    /**
     * Generate Markdown content
     */
    private generateMarkdown(entries: TimeEntry[]): string {
        const lines: string[] = [];
        
        lines.push('# Time Tracking Report');
        lines.push('');
        
        // Summary
        const totalTime = entries.reduce((sum, entry) => sum + entry.totalSeconds, 0);
        const uniqueProjects = new Set(entries.map(e => e.projectName));
        const dateRange = entries.length > 0 
            ? `${entries[0].date} to ${entries[entries.length - 1].date}`
            : 'No data';

        lines.push('## Summary');
        lines.push(`**Total Time:** ${formatTime(totalTime)}`);
        lines.push(`**Projects:** ${uniqueProjects.size}`);
        lines.push(`**Date Range:** ${dateRange}`);
        lines.push(`**Entries:** ${entries.length}`);
        lines.push('');

        // Group by date
        const entriesByDate = this.groupEntriesByDate(entries);
        
        for (const [date, dateEntries] of Object.entries(entriesByDate)) {
            lines.push(`## ${date}`);
            lines.push('');

            for (const entry of dateEntries) {
                lines.push(`### ${entry.projectName}`);
                lines.push(`**Total Time:** ${formatTime(entry.totalSeconds)}`);
                lines.push('');

                if (Object.keys(entry.files).length > 0) {
                    // Top files
                    const topFiles = getTopFiles(entry.files, 10);
                    if (topFiles.length > 0) {
                        lines.push('#### Top Files');
                        lines.push('| File | Language | Time |');
                        lines.push('|------|----------|------|');
                        
                        for (const file of topFiles) {
                            const relativePath = getRelativeFilePath(file.filePath);
                            lines.push(`| ${relativePath} | ${file.language} | ${formatTime(file.seconds)} |`);
                        }
                        lines.push('');
                    }

                    // By language
                    const topLanguages = getTopLanguages(entry.languages, 10);
                    if (topLanguages.length > 0) {
                        lines.push('#### By Language');
                        lines.push('| Language | Time |');
                        lines.push('|----------|------|');
                        
                        for (const lang of topLanguages) {
                            lines.push(`| ${lang.language} | ${formatTime(lang.seconds)} |`);
                        }
                        lines.push('');
                    }
                }
            }
        }

        return lines.join('\n');
    }

    /**
     * Group entries by date
     */
    private groupEntriesByDate(entries: TimeEntry[]): { [date: string]: TimeEntry[] } {
        const grouped: { [date: string]: TimeEntry[] } = {};
        
        for (const entry of entries) {
            if (!grouped[entry.date]) {
                grouped[entry.date] = [];
            }
            grouped[entry.date].push(entry);
        }
        
        return grouped;
    }

    /**
     * Save report to file
     */
    private async saveReport(content: string, format: string, scope: string): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const defaultPath = workspaceFolders?.[0]?.uri.fsPath || process.cwd();
        
        const fileName = `time-report-${scope}-${new Date().toISOString().split('T')[0]}.${format}`;
        const defaultUri = vscode.Uri.file(path.join(defaultPath, fileName));

        const uri = await vscode.window.showSaveDialog({
            defaultUri: defaultUri,
            filters: {
                [format.toUpperCase()]: [format]
            }
        });

        if (!uri) {
            return;
        }

        try {
            await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
            vscode.window.showInformationMessage(`Report saved to ${uri.fsPath}`);
            
            // Optionally open the file
            const openFile = await vscode.window.showInformationMessage(
                'Report saved successfully. Would you like to open it?',
                'Open', 'Close'
            );
            
            if (openFile === 'Open') {
                const document = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(document);
            }
        } catch (error) {
            throw new Error(`Failed to save file: ${error}`);
        }
    }

    /**
     * Generate quick stats for display
     */
    public generateQuickStats(): string {
        const stats = this.storage.getStatsSummary();
        const todayEntry = this.storage.getTodayEntry();
        
        const lines: string[] = [];
        lines.push(`**Total Time Tracked:** ${formatTime(stats.totalTime)}`);
        lines.push(`**Days Active:** ${stats.totalDays}`);
        lines.push(`**Projects:** ${stats.totalProjects}`);
        lines.push(`**Average per Day:** ${formatTime(stats.averageTimePerDay)}`);
        
        if (todayEntry) {
            lines.push('');
            lines.push(`**Today:** ${formatTime(todayEntry.totalSeconds)}`);
            if (Object.keys(todayEntry.files).length > 0) {
                const topFiles = getTopFiles(todayEntry.files, 3);
                lines.push('**Top Files Today:**');
                for (const file of topFiles) {
                    lines.push(`  • ${getRelativeFilePath(file.filePath)} - ${formatTime(file.seconds)}`);
                }
            }
        }
        
        return lines.join('\n');
    }
}
