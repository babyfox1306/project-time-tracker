# Changelog

All notable changes to the "Project Time Tracker" extension will be documented in this file.

## [0.1.2] - 2025-12-18

### Improved
- 📝 Enhanced marketplace description highlighting Git Analytics features
- 🔍 Added new keywords: "git analytics", "commit timeline", "branch analytics", "git productivity"
- 📊 Better discoverability for Git Analytics features on marketplace
- ✨ Updated extension description to showcase commit timeline and productivity metrics

## [0.1.1] - 2025-01-21

### Improved
- 📚 Enhanced documentation with comprehensive Git Analytics usage guide
- 📖 Updated README with detailed export format examples (CSV/Markdown/JSON)
- 📝 Improved CHANGELOG with complete feature descriptions
- 🔍 Added FAQ section for Git Analytics features
- ✨ Better user guidance for Git Analytics command usage

### Fixed
- Documentation consistency across all files
- Export format examples now include Git data
- Git Analytics section properly documented in README

## [0.1.0] - 2025-10-21

### Added
- 🌿 **Git Integration**: Track time per Git branch and commit
- Git branch detection with automatic time tracking
- Commit tracking with timestamp and hash information
- Sidebar displays: "Branch: feature/auth (1h 23m) | 3 commits"
- Git stats section showing current branch, last commit, and commit count
- Time breakdown by branch with expandable view
- Git repository detection and validation
- 📈 **Git Analytics**: Advanced commit timeline and productivity metrics
  - Commit timeline visualization with time spent per commit
  - Branch switching frequency analysis
  - Productivity metrics (average time per commit, most active branch)
  - Time between commits calculation
  - View Git Analytics command with date range selection (Today, Week, Month, All Time, Custom)
- 📊 **Enhanced Exports**:
  - CSV export now includes Git columns (Branch, Commit, Commit Timestamp)
  - Markdown export includes Git Analytics section with branch breakdown and commit timeline
  - **NEW**: JSON export with full Git metadata including commit history and analytics
- 🔄 Branch switching indicator in sidebar (shows when branch changed multiple times)
- 📝 Commit timeline summary in Git section

### Improved
- Enhanced sidebar with Git information section
- Better time tracking accuracy with Git context
- Automatic Git state monitoring and updates
- Professional Git workflow integration
- Export reports now include comprehensive Git data
- Better analytics visualization in markdown reports

### Technical
- New `GitTracker` class for VSCode Git API integration
- New `GitAnalytics` class for commit timeline and productivity analysis
- Extended `TimeEntry` interface with Git metadata and commit history
- Git stats storage and retrieval methods
- Branch switching detection and time allocation
- Commit history tracking with timestamps and time spent
- Historical Git data aggregation across date ranges

### Coming Soon
- PDF export with Git metadata (Week 5-6)
- Vietnamese localization (Week 7-8)

## [0.0.9] - 2025-10-20

### Added
- 🎨 New professional logo design for better branding
- Enhanced marketplace presence with updated visual identity

### Improved
- Package optimization and cleanup
- Removed temporary development files
- Better extension metadata and descriptions

### Coming Soon
- Git branch and commit tracking (Week 2)
- Vietnamese localization (Week 2)
- Multi-project support (Week 3)

## [0.0.8] - 2025-10-20

### Added
- 🍅 Pomodoro timer integration with 25min work / 5min break cycles
- Status bar shows Pomodoro countdown and total time: `🍅 24:35 | ⏱️ 2h 15m`
- Desktop notifications for Pomodoro work/break transitions
- Commands: Start Pomodoro, Skip Break
- Configurable Pomodoro work and break durations
- Pomodoro session stats in sidebar (work/break sessions completed)

### Improved
- Enhanced sidebar UI with Pomodoro status section
- Better status bar formatting with emoji indicators
- Marketplace optimization (keywords, description)

### Coming Soon
- Git branch and commit tracking (Week 2)
- Vietnamese localization (Week 2)
- Multi-project support (Week 3)

## [0.0.1] - 2025-01-14

### Added
- Initial release of Project Time Tracker
- Automatic time tracking when workspace opens
- Manual start/pause/resume controls
- Real-time sidebar panel with statistics
- File-level time tracking with language detection
- CSV and Markdown export functionality
- Offline-first architecture with local storage
- Configurable settings for auto-start and pause behavior
- Status bar integration showing current tracking time
- Support for multiple programming languages
- Top files and language breakdown views
- Reset functionality for daily data

### Features
- **Time Tracking**: Tracks time spent on individual files and projects
- **Export Reports**: Generate CSV (for Excel) and Markdown reports
- **Privacy**: 100% offline, no data sent anywhere
- **Real-time UI**: Live updates in sidebar panel
- **Configurable**: Customizable auto-start and pause behavior
- **Multi-language**: Supports all VS Code programming languages
