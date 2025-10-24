<!-- e4c2547b-b661-4d64-8b4b-ff31d14cec58 4f9e7caf-d378-46c1-b385-4a26a66220a0 -->
# CodeClock: Premium Time & Productivity Platform

## Vision

Build a sustainable software ecosystem for developer productivity - starting with VSCode extension, expanding to desktop/web, and scaling across IDEs. Focus: earn revenue first, expand second, AI last.

---

## Phase 1: Build User Base (Months 1-6) - FREE ONLY

**Goal**: Reach 2000+ active users before considering monetization

**Gatekeeper**: Cannot proceed to Phase 2 until 2000+ installs + 60%+ retention

---

### Month 1-2: Git Integration (FREE) - Target: 500 users

**Week 1-2: Git Tracking Core**

- Extend `src/storage.ts`: Add `gitBranch`, `gitCommit`, `commitTimestamp` to `TimeEntry`
- Create `src/gitTracker.ts`: Integrate `vscode.git` API for branch/commit detection
- Update `src/tracker.ts`: Auto-track time per branch and commit
- Sidebar display: "Branch: feature/auth (1h 23m) | 3 commits"

**Week 3-4: Git Analytics**

- Create `src/gitAnalytics.ts`: Calculate time between commits, branch switching frequency
- Add command `timeTracker.viewGitStats`: Show commit timeline with time spent
- Export git data to JSON format

**Week 5-6: Marketing Push**

- Update README highlighting Git workflow integration
- Post on Reddit (r/vscode, r/webdev): "Track your coding time per Git branch"
- Dev.to article: "Why I built a Git-native time tracker"

**Week 7-8: Polish & Iterate**

- Fix bugs from user feedback
- Optimize performance for large repos
- Add more Git visualizations

**Checkpoint**: If < 500 users, stay in this phase. Identify why growth is slow.

---

### Month 3-4: Export Features (FREE) - Target: 1000 users

**Week 9-10: Professional Export**

- Upgrade `src/reportGenerator.ts`: Add PDF export with `pdfkit`
- CSV export with git metadata (branch, commit, time)
- Beautiful templates for freelancer reports

**Week 11-12: Invoice Templates**

- Professional invoice layouts (no paywall yet)
- Configurable hourly rates, client info, tax settings
- Export grouped by project/branch

**Week 13-14: Marketing: Freelancer Focus**

- Reddit (r/freelance, r/digitalnomad): "Free tool to track & invoice coding work"
- Indie Hackers post: Building in public
- ProductHunt launch: "Git-native time tracker for developers"

**Week 15-16: Community Building**

- GitHub Discussions for feedback
- User interviews: What features do you need?
- Iterate based on feedback

**Checkpoint**: If < 1000 users, extend this phase. Don't move forward.

---

### Month 5-6: Polish & Retention - Target: 2000 users

**Week 17-20: Stability & Performance**

- Fix all reported bugs
- Optimize for large projects (1000+ files)
- Add data backup/restore
- Multi-project support (still free)

**Week 21-24: Growth & Engagement**

- Weekly usage stats in sidebar
- Streak tracking: "You've tracked 14 days straight!"
- Share feature: Export stats as image for Twitter
- Referral program: "Invite friends" (non-monetary)

**Metrics to track**:

- Daily Active Users (DAU)
- Weekly retention rate
- Feature usage (which features are most used?)
- User feedback sentiment

**Checkpoint**:

- ✅ 2000+ installs
- ✅ 60%+ 7-day retention
- ✅ <5% crash rate
- ✅ Positive user feedback

**Phase 1 Target**: 2000+ users, stable product, clear user demand

---

**GATE**: Only proceed to Phase 2 if ALL checkpoints passed. Otherwise, iterate on user growth.

---

## Phase 2: Desktop Expansion (Months 5-8)

**Goal**: Cross-platform Tauri app with web dashboard

### Month 5: Architecture Refactor

**Week 17-18: Monorepo Setup**

- Restructure to monorepo: `packages/vscode-extension`, `packages/core`, `packages/desktop`
- Extract shared logic to `packages/core`: Storage, tracking, analytics
- Define common TypeScript interfaces for cross-platform compatibility

**Week 19-20: Tauri Foundation**

- Setup Tauri project in `packages/desktop`
- Port core tracking logic from VSCode extension
- Implement system tray integration for always-on tracking

### Month 6: Desktop Feature Parity

**Week 21-22: Core Features**

- File tracking via OS file watcher (replace VSCode-specific APIs)
- Pomodoro timer with native notifications
- Git integration using `simple-git` library

**Week 23-24: Desktop-Specific Features**

- App usage tracking beyond IDE (optional, privacy-focused)
- Offline-first sync via local file system or Git-based sync
- Native widgets: menubar stats, quick timers

### Month 7: Web Dashboard (Optional)

**Week 25-26: Simple Analytics Web View**

- Create read-only web dashboard (Next.js/SvelteKit)
- Load data from exported JSON files (no server required initially)
- Visualizations: productivity heatmap, git timeline, invoice history

**Week 27-28: Team Features (Foundation)**

- Multi-user data aggregation (local, no cloud yet)
- Shared reports export for team leads
- Prepare infrastructure for optional cloud sync (Phase 3)

### Month 8: Desktop Launch

**Week 29-30: Beta Testing**

- Private beta with Pro users
- Fix platform-specific bugs (Windows/macOS/Linux)
- Performance optimization for battery life

**Week 31-32: Public Launch**

- Release Tauri app on GitHub Releases + website
- Pricing: Desktop app included in Pro tier or separate one-time purchase ($20-30)
- Marketing: "The only time tracker that works everywhere"

**Phase 2 Target**: 2000+ total users, $800-1200 MRR, desktop app with 200+ downloads

---

## Phase 3: AI & Premium Ecosystem (Months 9-12+)

**Goal**: Smart analytics layer + enterprise features

### Month 9-10: AI Analytics Foundation

- Collect anonymized productivity patterns (opt-in)
- Local ML models for productivity insights: "You're most productive 9-11 AM on Tuesdays"
- Suggest optimal Pomodoro timing based on actual work patterns
- Focus time recommendations by analyzing git commit quality vs. time spent

### Month 11-12: Enterprise Features

- Team dashboards with aggregated analytics
- Role-based access control for managers
- API for third-party integrations (Jira, Linear, Notion)
- Self-hosted option for privacy-conscious teams

### Beyond Month 12: Full Ecosystem

- Cross-IDE plugins (JetBrains, Sublime, Neovim)
- Cloud sync with end-to-end encryption (optional)
- Advanced AI: Burnout detection, meeting cost calculator, focus score
- Enterprise tier: $50/month per 5 users

**Phase 3 Target**: 5000+ users, $2000-3000 MRR, recognized as premium productivity platform

---

## Technical Architecture

### Current VSCode Extension Stack

- TypeScript
- VSCode Extension API
- Local storage (globalState)
- Git extension API

### Phase 2 Desktop Stack

- **Framework**: Tauri (Rust + WebView)
- **Frontend**: Svelte/React (lightweight)
- **Storage**: SQLite (via `tauri-plugin-sql`) or JSON files
- **Git**: `simple-git` npm package
- **Shared Core**: TypeScript library in monorepo

### Phase 3 Cloud Stack (Optional)

- **Backend**: Cloudflare Workers (serverless, cheap)
- **Database**: Turso (SQLite-compatible, edge)
- **Auth**: Clerk or WorkOS
- **Encryption**: End-to-end with user-controlled keys

---

## Monetization Strategy

### Pricing Tiers

| Tier | Price | Features |

|------|-------|----------|

| **Free** | $0 | Basic tracking, Pomodoro, simple CSV export |

| **Pro** | $5/month or $30/year | Git analytics, PDF invoices, unlimited projects, themes, priority support |

| **Desktop** | +$20 one-time | Standalone app, all Pro features, lifetime updates |

| **Enterprise** | $50/month per 5 users | Team dashboards, API access, self-hosted, SLA |

### Revenue Platforms

- **Extension**: Gumroad license keys (easy, no server needed)
- **Desktop**: Gumroad + LemonSqueezy (handles EU VAT)
- **Enterprise**: Direct sales + Stripe

### Marketing Channels

- **Organic**: VS Code Marketplace, Open VSX, GitHub, Product Hunt
- **Content**: Blog posts on freelancer workflows, Git productivity tips
- **Community**: Discord, Reddit (r/vscode, r/freelance, r/webdev)
- **Paid** (if budget): Google Ads targeting "time tracking for developers"

---

## Repository Structure (Post-Refactor)

```
codeclock/
├── packages/
│   ├── core/              # Shared TypeScript library
│   │   ├── src/
│   │   │   ├── storage.ts
│   │   │   ├── tracker.ts
│   │   │   ├── gitTracker.ts
│   │   │   ├── analytics.ts
│   │   │   └── types.ts
│   ├── vscode-extension/  # Current extension
│   │   ├── src/
│   │   │   ├── extension.ts
│   │   │   ├── treeView.ts
│   │   │   └── commands.ts
│   │   └── package.json
│   ├── desktop/           # Tauri app (Phase 2)
│   │   ├── src-tauri/     # Rust backend
│   │   └── src/           # Frontend
│   └── web-dashboard/     # Optional web view (Phase 2-3)
├── docs/
├── marketing/
└── README.md
```

---

## Success Metrics

| Milestone | Timeline | Installs/Users | Revenue | Key Features |

|-----------|----------|----------------|---------|--------------|

| Phase 1 Start | Month 1 | 124 | $0 | Current state |

| Git + Export | Month 2 | 500 | $0 | Git analytics, PDF export |

| Pro Launch | Month 3 | 1000 | $200-400 | Freemium model live |

| Phase 1 Complete | Month 4 | 1500 | $400-600 | Stable monetization |

| Desktop Beta | Month 7 | 2000 | $800 | Tauri app testing |

| Desktop Launch | Month 8 | 2500 | $1200 | Cross-platform |

| AI Features | Month 10 | 3500 | $1800 | Smart insights |

| Enterprise | Month 12 | 5000+ | $3000+ | Full ecosystem |

---

## Core Philosophy

> "Don't AI-ify everything. Build tools that help developers earn money and manage time effectively. When they trust you, AI becomes a bonus feature, not a gimmick."

**Priorities**:

1. **Revenue first**: Freelancer-focused features that solve real billing problems
2. **Expand smart**: Desktop app only after extension is profitable
3. **AI last**: Add intelligence only when you have real user data and trust

**Differentiators**:

- 100% offline-first (privacy, no subscriptions for basic features)
- Git-native workflow integration (not just dumb time tracking)
- Freelancer-friendly invoicing (not just stats)
- Eventually cross-platform (not locked to VSCode)

---

## Next Steps

Ready to start **Phase 1, Month 1, Week 1**: Git Integration Foundation?

First task: Extend `src/storage.ts` to add git metadata fields to TimeEntry interface.

### To-dos

- [ ] Extend TimeEntry interface in src/storage.ts with git fields (gitBranch, gitCommit, commitTimestamp)
- [ ] Create src/gitTracker.ts with vscode.git API integration for branch/commit detection
- [ ] Update src/tracker.ts to auto-track time per branch and commit
- [ ] Update src/treeView.ts to show branch/commit info in sidebar
- [ ] Create src/gitAnalytics.ts for commit timeline and branch switching analysis
- [ ] Add timeTracker.viewGitStats command to display commit timeline with time spent
- [ ] Upgrade src/reportGenerator.ts with pdfkit for professional PDF invoices
- [ ] Create invoice template system with logo, client info, and hourly rates
- [ ] Add configuration for hourly rates, client details, and tax settings
- [ ] Implement invoice generation grouped by project/branch
- [ ] Create src/licensing.ts with offline-first license key validation
- [ ] Implement feature gating for Pro tier (Git analytics, PDF invoices, themes)
- [ ] Integrate Gumroad API for license key delivery and validation
- [ ] Update README and create landing page showcasing Git + Invoice workflows
- [ ] Restructure to monorepo with packages/core, packages/vscode-extension, packages/desktop
- [ ] Initialize Tauri project in packages/desktop with basic window setup
- [ ] Extract shared logic to packages/core (storage, tracking, analytics)
- [ ] Port tracking logic to Tauri using OS file watchers