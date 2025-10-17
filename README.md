# CodeClock Time Tracker

![CodeClock Time Tracker Logo](https://github.com/babyfox1306/project-time-tracker/raw/HEAD/media/logo.png)

A VS Code extension for freelancers and developers to track time spent on projects offline. No cloud required - all data stays on your machine.

## Features

### ⏱️ **Automatic Time Tracking**
- Starts tracking when you open a workspace
- Tracks time spent on individual files
- Groups time by programming language
- Pauses when VS Code loses focus (configurable)

### 📊 **Real-time Sidebar**
- Live view of current session
- Top files by time spent
- Breakdown by programming language
- Current project information

### 📈 **Export Reports**
- **CSV format** - Import into Excel for client billing
- **Markdown format** - Share with team or documentation
- Export today's data, date ranges, or all historical data
- Detailed file and language breakdowns

### 💝 **Break Reminders**
- Cute notifications after 2 hours of continuous work
- Configurable reminder timing
- Encourages healthy work habits
- Multiple friendly message variations

### 🔒 **Privacy First**
- 100% offline - no data sent anywhere
- All data stored locally using VS Code's built-in storage
- No external dependencies or network calls

## Installation

### From VS Code Marketplace
**Direct Link**: [Install CodeClock Time Tracker](https://marketplace.visualstudio.com/items?itemName=CodeClock.codeclock-time-tracker)

**Or manually:**
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "CodeClock Time Tracker"
4. Click Install

### Manual Installation
1. Download the `.vsix` file from releases
2. Open VS Code
3. Go to Extensions → Install from VSIX
4. Select the downloaded file

## Usage

### Getting Started
1. Open a workspace/project folder
2. Time tracking starts automatically
3. View the "Time Tracker" panel in the Explorer sidebar
4. Edit files to accumulate tracked time

### Commands
Access via Command Palette (Ctrl+Shift+P) or the sidebar:

- `Time Tracker: Start Time Tracking` - Begin tracking
- `Time Tracker: Pause Time Tracking` - Pause current session
- `Time Tracker: Resume Time Tracking` - Resume paused session
- `Time Tracker: Export Time Report` - Generate CSV/Markdown reports
- `Time Tracker: Reset Today's Data` - Clear today's tracking data
- `Time Tracker: View Detailed Stats` - Open detailed statistics

### Sidebar Panel
The Time Tracker panel shows:
- **Current Status** - Tracking state and total time
- **Project Details** - Current project and time breakdown
- **Top Files** - Files with most time spent
- **By Language** - Time grouped by programming language
- **Actions** - Quick access to commands

### Status Bar
When tracking is active, you'll see:
- `⏱️ 2h 34m` - Total time tracked today
- Click to pause/resume tracking

## Configuration

Access settings via `File > Preferences > Settings` and search for "timeTracker":

### `timeTracker.autoStart`
- **Default:** `true`
- **Description:** Automatically start tracking when workspace opens

### `timeTracker.pauseOnInactive`
- **Default:** `true`
- **Description:** Pause tracking when VS Code loses focus

### `timeTracker.minActiveSeconds`
- **Default:** `5`
- **Description:** Minimum seconds on a file to count as active time

## Export Formats

### CSV Export
Perfect for Excel and data analysis:
```csv
Date,Project,File,Language,Time (seconds),Time (formatted)
2025-01-14,my-project,src/app.ts,TypeScript,2700,45m
2025-01-14,my-project,src/utils.ts,TypeScript,1800,30m
```

### Markdown Export
Great for documentation and sharing:
```markdown
# Time Tracking Report
**Project:** my-project  
**Date:** 2025-01-14  
**Total Time:** 2h 34m

## Files
| File | Language | Time |
|------|----------|------|
| src/app.ts | TypeScript | 45m |
| src/utils.ts | TypeScript | 30m |

## Summary by Language
| Language | Time |
|----------|------|
| TypeScript | 1h 15m |
| JSON | 15m |
```

## Privacy & Data Storage

- **Local Storage Only** - All data stored using VS Code's built-in storage
- **No Network Calls** - Extension works completely offline
- **No External Dependencies** - Uses only VS Code APIs
- **Data Location** - Stored in VS Code's global state (accessible via Developer Tools)

## Troubleshooting

### Time Not Tracking
1. Ensure a workspace is open (File > Open Folder)
2. Check that auto-start is enabled in settings
3. Verify you're actively editing files (not just viewing)

### Missing Data
1. Check if tracking was paused
2. Verify minimum active seconds setting
3. Look in the sidebar for current status

### Export Issues
1. Ensure you have write permissions to the target directory
2. Try saving to a different location
3. Check VS Code's output panel for error messages

## FAQ

**Q: Does this work offline?**
A: Yes! The extension works completely offline and stores all data locally.

**Q: Can I track multiple projects?**
A: Yes, each workspace/project is tracked separately with its own data.

**Q: How accurate is the time tracking?**
A: Very accurate - tracks actual file editing time, not just VS Code being open.

**Q: Can I export data for client billing?**
A: Yes! CSV exports are perfect for importing into Excel or billing systems.

**Q: Does it track time when VS Code is minimized?**
A: By default, tracking pauses when VS Code loses focus. You can disable this in settings.

## Contributing

Contributions welcome! Please see the [GitHub repository](https://github.com/babyfox1306/project-time-tracker) for:
- Bug reports
- Feature requests
- Pull requests
- Documentation improvements

## License

MIT License - see LICENSE file for details.

## Changelog

### v0.0.1
- Initial release
- Automatic time tracking
- Sidebar panel with real-time stats
- CSV and Markdown export
- Offline-first architecture
- Configurable settings

---

**Made with ❤️ for freelancers and developers who value their time.**
