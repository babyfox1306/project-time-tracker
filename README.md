# CodeClock Time Tracker

![CodeClock Time Tracker Logo](https://github.com/babyfox1306/project-time-tracker/raw/HEAD/media/logo.png)

[![Installs](https://img.shields.io/visual-studio-marketplace/i/CodeClock.codeclock-time-tracker)](https://marketplace.visualstudio.com/items?itemName=CodeClock.codeclock-time-tracker)
[![Stars](https://img.shields.io/github/stars/babyfox1306/project-time-tracker?style=social)](https://github.com/babyfox1306/project-time-tracker)
[![Vietnamese](https://img.shields.io/badge/lang-vi-green.svg)](https://github.com/babyfox1306/project-time-tracker)
[![Offline](https://img.shields.io/badge/privacy-100%25%20offline-purple.svg)](https://github.com/babyfox1306/project-time-tracker)

A VS Code extension for developers and teams to track time spent on projects offline. No cloud required - all data stays on your machine.

## Features

### 🍅 **Pomodoro Timer Integration**
- Built-in Pomodoro timer (25min work / 5min break)
- Status bar shows both Pomodoro and total time: `🍅 24:35 | ⏱️ 2h 15m`
- Desktop notifications for work/break transitions
- Configurable work and break durations
- Syncs with time tracking for focused productivity

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
- Pomodoro status indicator

### 📈 **Export Reports**
- **CSV format** - Import into Excel for client billing (includes Git data: Branch, Commit, Commit Timestamp)
- **Markdown format** - Share with team or documentation (includes Git Analytics section)
- **JSON format** - Full metadata export with commit history and analytics (NEW in v0.1.0)
- Export today's data, date ranges, or all historical data
- Detailed file and language breakdowns
- Git commit timeline and branch analytics in exports

### 💝 **Break Reminders**
- Cute notifications after 2 hours of continuous work
- Configurable reminder timing
- Encourages healthy work habits
- Multiple friendly message variations

### 🔒 **Privacy First**
- 100% offline - no data sent anywhere
- All data stored locally using VS Code's built-in storage
- No external dependencies or network calls

## 🌿 Git Integration & Analytics (v0.1.0)
Track time by Git branches and commits for better project context and team billing.
- ⏱️ **Time per branch** - See how long you spend on each feature branch
- 📝 **Commit tracking** - Link commits to time spent with timestamps
- 📊 **Branch analytics** - Time breakdown by branch in sidebar
- 🔍 **Repository detection** - Auto-detect Git repos and track accordingly
- 📈 **Git Analytics** - Advanced commit timeline and productivity insights
  - View commit timeline with time spent per commit
  - Branch switching frequency analysis
  - Productivity metrics (average time per commit, most active branch)
  - Time between commits visualization
  - Date range selection for historical analysis

## Why CodeClock?

| Feature | CodeClock | WakaTime | RescueTime |
|---------|-----------|----------|------------|
| **Offline First** | ✅ 100% Local | ❌ Cloud Required | ❌ Cloud Required |
| **Pomodoro Timer** | ✅ Built-in | ❌ No | ❌ No |
| **Git Integration** | ✅ Full Analytics | ❌ No | ❌ No |
| **Privacy** | ✅ No Data Sent | ❌ Data Uploaded | ❌ Data Uploaded |
| **VS Code Native** | ✅ Perfect Integration | ⚠️ Limited | ❌ No |
| **Free Features** | ✅ All Core Features | ⚠️ Limited | ⚠️ Limited |
| **Multi-Project Support** | ✅ Coming Soon | ⚠️ Limited | ⚠️ Limited |
| **Team Collaboration** | ✅ Planned | ⚠️ Paid Only | ⚠️ Paid Only |

**Perfect for**: Developers who value privacy, want offline-first tools, and need Pomodoro + time tracking in one extension.

## 🇻🇳 Vietnamese Developer Community
CodeClock is built with Vietnamese developers in mind. Full Vietnamese localization coming in Week 2!

## Installation

### From VS Code Marketplace
**Direct Link**: [Install CodeClock Time Tracker](https://marketplace.visualstudio.com/items?itemName=CodeClock.codeclock-time-tracker)

**Or manually:**
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "CodeClock Time Tracker"
4. Click Install

### From Open VSX Registry
For VSCodium and open-source VS Code builds:
[Install on Open VSX](https://open-vsx.org/extension/CodeClock/codeclock-time-tracker)

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

**Time Tracking:**
- `Time Tracker: Start Time Tracking` - Begin tracking
- `Time Tracker: Pause Time Tracking` - Pause current session
- `Time Tracker: Resume Time Tracking` - Resume paused session

**Pomodoro Timer:**
- `Time Tracker: Start Pomodoro` - Start Pomodoro session (25min work)
- `Time Tracker: Skip Break` - Skip current break period

**Reports & Data:**
- `Time Tracker: Export Time Report` - Generate CSV/Markdown/JSON reports
- `Time Tracker: Reset Today's Data` - Clear today's tracking data
- `Time Tracker: View Detailed Stats` - Open detailed statistics
- `Time Tracker: View Git Analytics` - View Git commit timeline and productivity metrics (NEW)

### Sidebar Panel
The Time Tracker panel shows:
- **Current Status** - Tracking state and total time
- **Pomodoro Timer** - Current Pomodoro session status
- **Project Details** - Current project and time breakdown
- **Top Files** - Files with most time spent
- **By Language** - Time grouped by programming language
- **Git Info** - Current branch, commits, and branch time breakdown
  - Branch switching indicator (when branch changed multiple times)
  - Commit timeline summary
  - View Git Analytics action
- **Actions** - Quick access to commands

### Status Bar
When tracking is active, you'll see:
- `🍅 24:35 | ⏱️ 2h 34m` - Pomodoro timer and total time tracked today
- Click to pause/resume tracking
- Pomodoro notifications for work/break transitions

### Git Analytics (NEW in v0.1.0)
View detailed Git analytics and commit timeline:

1. **Access Git Analytics:**
   - Command Palette: `Time Tracker: View Git Analytics`
   - Or click "View Git Analytics" in the Git Info section of sidebar

2. **Select Date Range:**
   - Today - View today's commits
   - This Week - Last 7 days
   - This Month - Last 30 days
   - All Time - All historical data
   - Custom Range - Specify start and end dates

3. **Analytics Report Includes:**
   - **Productivity Statistics:**
     - Total commits
     - Average time per commit
     - Most active branch
     - Branch switch count
     - Average time between commits
   - **Branch Switching:**
     - Total switches
     - Switch history with timestamps
     - Average time between switches
   - **Commit Timeline:**
     - Chronological list of all commits
     - Commit hash, branch, timestamp
     - Time spent on each commit
     - Time between commits

4. **Git Info in Sidebar:**
   - Current branch and last commit
   - Commit count for today
   - Branch switching indicator (if switched multiple times)
   - Time breakdown by branch (expandable)
   - Commit timeline summary

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

### `timeTracker.pomodoroEnabled`
- **Default:** `true`
- **Description:** Enable Pomodoro timer integration

### `timeTracker.pomodoroWorkMinutes`
- **Default:** `25`
- **Description:** Duration of work sessions in minutes

### `timeTracker.pomodoroBreakMinutes`
- **Default:** `5`
- **Description:** Duration of break sessions in minutes

## Export Formats

### CSV Export
Perfect for Excel and data analysis (includes Git data):
```csv
Date,Project,File,Language,Time (seconds),Time (formatted),Branch,Commit,Commit Timestamp
2025-01-14,my-project,src/app.ts,TypeScript,2700,45m,main,a1b2c3d4,2025-01-14T10:30:00Z
2025-01-14,my-project,src/utils.ts,TypeScript,1800,30m,feature/auth,e5f6g7h8,2025-01-14T11:15:00Z
```

### Markdown Export
Great for documentation and sharing (includes Git Analytics):
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

## Git Analytics
**Current Branch:** main
**Last Commit:** a1b2c3d4
**Commit Count:** 5

### Time by Branch
| Branch | Time |
|--------|------|
| main | 1h 30m |
| feature/auth | 1h 4m |

### Commit Timeline
| Commit | Branch | Timestamp | Time Spent |
|---------|--------|-----------|------------|
| a1b2c3d4 | main | 2025-01-14 10:30 | 45m |
| e5f6g7h8 | feature/auth | 2025-01-14 11:15 | 30m |
```

### JSON Export (NEW in v0.1.0)
Complete metadata export for programmatic access:
```json
{
  "exportDate": "2025-01-14T12:00:00Z",
  "totalEntries": 1,
  "entries": [
    {
      "date": "2025-01-14",
      "projectName": "my-project",
      "totalSeconds": 5400,
      "gitStats": {
        "currentBranch": "main",
        "lastCommit": "a1b2c3d4",
        "commitHistory": [
          {
            "commitHash": "a1b2c3d4",
            "timestamp": "2025-01-14T10:30:00Z",
            "branch": "main",
            "timeSpent": 2700,
            "timeBetweenCommits": null
          }
        ]
      }
    }
  ],
  "gitAnalytics": {
    "productivityStats": {
      "totalCommits": 5,
      "averageTimePerCommit": 1080,
      "mostActiveBranch": "main"
    }
  }
}
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

**Q: How does Git Analytics work?**
A: The extension automatically tracks your Git branch and commits as you work. Use the "View Git Analytics" command to see commit timeline, branch switching patterns, and productivity metrics for any date range.

**Q: Can I export Git data?**
A: Yes! All export formats (CSV, Markdown, JSON) now include Git information. JSON export includes full commit history and analytics.

**Q: Does Git tracking work with all Git workflows?**
A: Yes, it works with any Git repository. The extension uses VS Code's built-in Git API to detect branches and commits automatically.

## Contributing

Contributions welcome! Please see the [GitHub repository](https://github.com/babyfox1306/project-time-tracker) for:
- Bug reports
- Feature requests
- Pull requests
- Documentation improvements

## License

MIT License - see LICENSE file for details.

## Changelog

### v0.1.0 (Current)
- 🌿 Git Integration with branch and commit tracking
- 📈 Git Analytics: Commit timeline, branch switching analysis, productivity metrics
- 📊 Enhanced exports: CSV/Markdown with Git data + NEW JSON export
- 🔄 Branch switching indicators and commit timeline in sidebar
- View Git Analytics command with date range selection

### v0.0.9
- Professional logo design
- Package optimization

### v0.0.8
- 🍅 Pomodoro timer integration
- Status bar integration
- Desktop notifications

### v0.0.1
- Initial release
- Automatic time tracking
- Sidebar panel with real-time stats
- CSV and Markdown export
- Offline-first architecture
- Configurable settings

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

---

**Made with ❤️ for freelancers and developers who value their time.**
