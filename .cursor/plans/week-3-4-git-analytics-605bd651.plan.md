---
name: "Week 3-4: Git Analytics Implementation"
overview: ""
todos:
  - id: 6ccd71a3-5021-43a8-b3d7-250fb2bae33e
    content: Create src/gitAnalytics.ts with commit timeline calculation
    status: pending
  - id: 9055f07f-1824-423d-a902-6112d75f9041
    content: Implement getCommitTimeline() function in gitAnalytics.ts
    status: pending
  - id: 7d00babe-6e66-4a01-b8bf-4f6b73c4cd5a
    content: Implement getBranchSwitchingFrequency() function in gitAnalytics.ts
    status: pending
  - id: fa0d5803-3a75-4bd5-b102-18c6c1a8dd57
    content: Implement getGitProductivityStats() function in gitAnalytics.ts
    status: pending
  - id: e6b52388-5641-4347-9bed-68119b9b9386
    content: Add timeTracker.viewGitStats command registration in extension.ts
    status: pending
  - id: 50a36843-e710-4feb-9287-254c61cb9a4c
    content: Create git stats display view (webview or document) for commit timeline
    status: pending
  - id: 17fc44f1-de54-4f72-8cd6-76b783eeef80
    content: Add Git columns (Branch, Commit, Commit Timestamp) to CSV export in reportGenerator.ts
    status: pending
  - id: 69c29a7e-9542-4a2a-a593-c4201166ab49
    content: Add Git analytics section to Markdown export in reportGenerator.ts
    status: pending
  - id: 5b24faf7-158f-43d4-a32d-dae789a64856
    content: Add JSON export option to reportGenerator.ts with full git metadata
    status: pending
  - id: 207e4e7f-26d9-41f2-824c-355cd9e500d5
    content: Add getGitStatsForDateRange() method to StorageManager in storage.ts
    status: pending
  - id: bfea79d7-d4b1-42d3-970a-e4923271be02
    content: Update treeView.ts to add 'View Git Analytics' action item
    status: pending
  - id: 8c5c2dce-3090-4316-876d-f9195979f5cc
    content: Add branch switching indicator in treeView.ts git section
    status: pending
  - id: 828998a3-df27-42ed-9ff8-433d73a05d9e
    content: Register new command in package.json
    status: pending
---

# Week 3-4: Git Analytics Implementation

## Overview

Build advanced Git analytics to show commit timeline with time spent, analyze branch switching patterns, and enable JSON export with git metadata.

## Tasks

### 1. Create Git Analytics Module (`src/gitAnalytics.ts`)

- Calculate time between commits for each commit tracked
- Analyze branch switching frequency (how often user switches branches)
- Generate commit timeline showing: commit hash, timestamp, time spent, branch name
- Calculate productivity metrics: average time per commit, most active branches
- Aggregate git stats across date range (for historical analysis)

**Key Functions:**

- `getCommitTimeline(startDate?, endDate?)`: Returns chronological list of commits with time spent
- `getBranchSwitchingFrequency(dateRange)`: Returns branch switch count and patterns
- `getGitProductivityStats(dateRange)`: Returns averages and insights

### 2. Add Git Stats Command (`src/extension.ts`)

- Register new command: `timeTracker.viewGitStats`
- Display commit timeline in a new VS Code document/webview
- Show visual timeline with:
- Commit hash (short) and message
- Timestamp
- Time spent on that commit
- Branch name
- Time between commits

### 3. Enhance Report Generator (`src/reportGenerator.ts`)

- Add Git data to CSV export: include `Branch`, `Commit`, `Commit Timestamp` columns
- Add Git section to Markdown export: show branch breakdown, commit timeline
- Add new export option: `JSON Export` that includes full git metadata
- JSON format should include: time entries with gitStats, commit history, branch timeline

### 4. Update Storage for Historical Git Data

- Enhance `StorageManager.getEntriesForDateRange()` to include git stats
- Ensure gitStats are properly aggregated when querying multiple entries
- Add helper method: `getGitStatsForDateRange()` to aggregate git data across dates

### 5. Update Tree View (`src/treeView.ts`)

- Add "View Git Analytics" action item that calls `timeTracker.viewGitStats`
- Show branch switching indicator (if branch changed multiple times today)
- Display commit timeline summary in git section

## Files to Modify

1. **NEW**: `src/gitAnalytics.ts` - Core analytics logic
2. **MODIFY**: `src/extension.ts` - Add `timeTracker.viewGitStats` command
3. **MODIFY**: `src/reportGenerator.ts` - Add git columns to CSV, git section to Markdown, JSON export
4. **MODIFY**: `src/storage.ts` - Add `getGitStatsForDateRange()` method
5. **MODIFY**: `src/treeView.ts` - Add analytics action and enhanced git display
6. **MODIFY**: `package.json` - Register new command

## Success Criteria

- ✅ Commit timeline view shows chronological commits with time spent
- ✅ Branch switching frequency is calculated and displayed
- ✅ CSV export includes git metadata columns
- ✅ Markdown export includes git analytics section
- ✅ JSON export includes full git data structure
- ✅ All git analytics accessible via command palette