# Veritas
 
**Reply sorting that actually works. Community verdicts on every post. Signal over noise.**
 
<img width="1200" height="630" alt="Veritas Preview" src="https://placeholder-for-your-screenshot.png" />
<br><br>
 
[**🚀 Explore the Live Demo**](#) | [**📂 View Codebase**](https://github.com/YourUsername/Veritas)
 
---
## Problem Statement
 
X (Twitter) lost **33 million users** between 2023–2024, shedding $2.5B in annual revenue (Business of Apps, 2026). The exodus wasn't random:
 
- **60% of users under 30** no longer trust X's algorithm to show meaningful content (Pew Research, 2024)
- **Reply sections became unreadable noise** — when viral posts hit 10k+ replies, you can't find what the OP said, distinguish bots from humans, or surface quality context
- **Misinformation floods feeds unchecked** — no transparent community verification at the post level
- **Reply sorting has been "tested" since 2024** but never shipped properly (HeyOrca changelog)
The migration to Bluesky, Threads, and Mastodon proved one thing: **users will abandon platforms that drown signal in noise**.
 
**Veritas addresses this with two features X tested but failed to ship:**
1. **3-mode reply sorting** (Most Relevant, Recent, OP-only)
2. **Community verdicts** (Verified, Disputed, Satire) that surface at the post level
This isn't speculative. These are the exact features appearing in X user feedback loops since the Musk acquisition.
 
---
## Technical Architecture
 
### Core Technologies
- **Vanilla JavaScript (ES Modules)** — Zero framework dependencies; demonstrates state management fundamentals that translate to React/Vue/Svelte
- **Event Delegation Pattern** — One `document` listener handles the entire app via `data-*` attributes
- **Pure Render Function** — `getFeedHtml()` is deterministic; same state = same output (foundation of modern frameworks)
- **Flat Array State** — No nested objects, no Redux, no complexity. Mutate array → call `render()`
### Key Features
 
#### 1. Reply Sorting (The Headline Feature)
```javascript
function sortReplies(replies, mode, opHandle) {
  const sorted = [...replies]
  
  if (mode === 'op') {
    // Show only OP's threaded context
    return sorted.filter(r => r.handle === opHandle)
  } else if (mode === 'recent') {
    // Newest first
    return sorted.reverse()
  } else {
    // Relevance = verified accounts first
    return sorted.sort((a, b) => {
      const aVerified = a.handle.includes('✅')
      const bVerified = b.handle.includes('✅')
      if (aVerified && !bVerified) return -1
      if (!aVerified && bVerified) return 1
      return a.handle.localeCompare(b.handle)
    })
  }
}
```
 
**Impact:** Solves the chaos of viral reply threads. Find OP's context in one click. Surface verified voices. Skip bot spam.
 
#### 2. Community Verdict System
```javascript
function handleVerdictClick(tweetId, verdictType) {
  const tweet = tweetsData.find(t => t.uuid === tweetId)
  
  // Atomic vote switching - one vote per user
  if (tweet.userVerdict === verdictType) {
    tweet.verdicts[verdictType]--
    tweet.userVerdict = null
  } else {
    if (tweet.userVerdict) {
      tweet.verdicts[tweet.userVerdict]--  // Remove old vote
    }
    tweet.verdicts[verdictType]++          // Add new vote
    tweet.userVerdict = verdictType
  }
  render()
}
```
 
**Transparency:** No algorithmic black box. If 55%+ of verdicts are "Verified", post gets a green ✓ badge. If "Disputed" leads, you see an amber ⚠ warning. The crowd decides what's real.
 
#### 3. Trust Score Calculator
```javascript
function getTrustScore(verdicts) {
  const total = verdicts.verified + verdicts.disputed + verdicts.satire
  if (total === 0) return { label: 'Unverified', cssClass: 'trust-low' }
  
  const verifiedRatio = verdicts.verified / total
  
  if (verifiedRatio >= 0.55) {
    return { 
      label: `✓ ${Math.round(verifiedRatio * 100)}%`, 
      cssClass: 'trust-high' 
    }
  } else if (verdicts.disputed > verdicts.verified) {
    const disputedRatio = Math.round((verdicts.disputed / total) * 100)
    return { 
      label: `⚠ ${disputedRatio}% Disputed`, 
      cssClass: 'trust-mid' 
    }
  }
  // ... satire and fallback logic
}
```
 
Real-time crowd consensus. No editorial gatekeeping. No invisible moderation.
 
### JavaScript Function Inventory
 
**Core Tweet Interactions (from original codebase):**
- `handleLikeClick()` — Toggle like state with count update
- `handleRetweetClick()` — Toggle retweet with visual feedback
- `handleReplyClick()` — Expand/collapse reply threads
- `handleTweetBtnClick()` — Post creation with UUID generation
**Production Extensions (5 new functions):**
- `handleBookmarkClick()` — Free bookmarking (X paywalled this)
- `handleVerdictClick()` — Community verdict system (atomic vote switching)
- `handleMoodSelect()` — Mood tag picker in compose area
- `handleFilterClick()` — Feed filtering by mood/bookmarks
- `handleReplySortClick()` — **The star feature** — 3-mode reply sorting
**Helper Functions:**
- `sortReplies()` — Algorithm for relevance/recent/OP-only modes
- `getTrustScore()` — Badge calculation from verdict ratios
- `render()` — Pure function that rebuilds entire DOM from state
---

## Product Decisions
 
### Why Reply Sorting Over Other Features?
 
**Hypothesis:** When users can't parse viral reply threads, they disengage from the platform entirely.
 
**Market Validation:**
- X has **tested reply sorting since 2024** but never shipped it production-ready
- Bluesky's growth accelerated when they shipped threaded reply context
- 60% of Gen Z users cited "algorithm distrust" as reason for leaving X
**Implementation decision:** Three modes cover every use case:
- **Most Relevant** — default; surfaces verified accounts and quality replies
- **Recent** — for breaking news where recency matters
- **OP-only** — instantly find what the original poster said in their own thread
### Why Community Verdicts Over Moderator Flags?
 
**Decision drivers:**
1. **Transparency** — Users see vote counts; nothing is hidden
2. **Scale** — Crowdsourcing beats editorial teams at volume
3. **Trust** — Decentralized verification feels less like censorship
4. **Speed** — Real-time updates vs. waiting for moderator review
The mechanism is deliberately simple: one vote per user per post. Vote totals are public. The algorithm is transparent ratio math, not a neural network black box.
 
### Why Vanilla JavaScript Over React?
 
**Technical reasoning:**
1. **State management demonstration** — Shows you understand the fundamentals that frameworks abstract
2. **Zero build step** — Works on any device, even in low-bandwidth emerging markets
3. **Learning artifact** — Other developers can fork and modify without webpack/npm knowledge
4. **Interview signal** — Proves you can solve problems without reaching for dependencies
**Product reasoning:** Offline-first architecture. No API calls. No server costs. Fork-friendly for open-source contributions.
 
---



