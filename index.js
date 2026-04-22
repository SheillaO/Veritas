import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid'

console.log('Tweets loaded:', tweetsData.length)

// ─── STATE ────────────────────────────────────────────────────────────────────
let activeMood = 'insight'
let activeFilter = 'all'
let replySortMode = {}
let activeReplyBox = null  // Track which tweet has reply box open

// Fun names for auto-generated replies
const funNames = [
  "Chris Farley", "Beyoncé Knowles", "Sabrina Carpenter", "Kenan Thompson",
  "Kate McKinnon", "Bill Hader", "Aidy Bryant", "Adam Sandler",
  "Ryan Reynolds", "Emma Stone", "Scarlett Johansson", "John Mulaney",
  "Will Ferrell", "Amy Poehler"
]

// ─── EVENT DELEGATION ─────────────────────────────────────────────────────────
document.addEventListener('click', function(e) {
  if (e.target.dataset.like) {
    handleLikeClick(e.target.dataset.like)
  }
  else if (e.target.dataset.retweet) {
    handleRetweetClick(e.target.dataset.retweet)
  }
  else if (e.target.dataset.reply) {
    handleReplyClick(e.target.dataset.reply)
  }
  else if (e.target.id === 'tweet-btn') {
    handleTweetBtnClick()
  }
  else if (e.target.dataset.bookmark) {
    handleBookmarkClick(e.target.dataset.bookmark)
  }
  else if (e.target.dataset.verdict) {
    const [uuid, type] = e.target.dataset.verdict.split('|')
    handleVerdictClick(uuid, type)
  }
  else if (e.target.classList.contains('mood-btn')) {
    handleMoodSelect(e.target)
  }
  else if (e.target.classList.contains('nav-item')) {
    handleFilterClick(e.target)
  }
  else if (e.target.dataset.sortReplies) {
    handleReplySortClick(e.target.dataset.sortReplies, e.target.dataset.mode)
  }
  else if (e.target.dataset.submitReply) {
    handleSubmitReply(e.target.dataset.submitReply)
  }
  else if (e.target.id === 'theme-toggle') {
    handleThemeToggle()
  }
})

// ─── ORIGINAL FUNCTIONS ───────────────────────────────────────────────────────

function handleLikeClick(tweetId) {
  const tweet = tweetsData.find(t => t.uuid === tweetId)
  if (tweet.isLiked) { tweet.likes-- } else { tweet.likes++ }
  tweet.isLiked = !tweet.isLiked
  render()
}

function handleRetweetClick(tweetId) {
  const tweet = tweetsData.find(t => t.uuid === tweetId)
  if (tweet.isRetweeted) { tweet.retweets-- } else { tweet.retweets++ }
  tweet.isRetweeted = !tweet.isRetweeted
  render()
}

function handleReplyClick(replyId) {
  // Toggle reply input box
  if (activeReplyBox === replyId) {
    activeReplyBox = null
  } else {
    activeReplyBox = replyId
  }
  render()
}

function handleTweetBtnClick() {
   console.log("Function Triggered");
  const input = document.getElementById("tweet-input");
  if (!input.value.trim()) return

  tweetsData.unshift({
    handle: `@You`,
    profilePic: `images/scrimbalogo.png`,
    likes: 0,
    retweets: 0,
    tweetText: input.value,
    replies: [],
    isLiked: false,
    isRetweeted: false,
    isBookmarked: false,
    moodTag: activeMood,
    verdicts: { verified: 0, disputed: 0, satire: 0 },
    userVerdict: null,
    uuid: uuidv4()
  })
  input.value = ''
  render()
}

// ─── NEW FUNCTION 1: Bookmark ─────────────────────────────────────────────────
function handleBookmarkClick(tweetId) {
  const tweet = tweetsData.find(t => t.uuid === tweetId)
  tweet.isBookmarked = !tweet.isBookmarked
  render()
}

// ─── NEW FUNCTION 2: Community Verdict ────────────────────────────────────────
function handleVerdictClick(tweetId, verdictType) {
  const tweet = tweetsData.find(t => t.uuid === tweetId)

  if (tweet.userVerdict === verdictType) {
    tweet.verdicts[verdictType]--
    tweet.userVerdict = null
  } else {
    if (tweet.userVerdict) {
      tweet.verdicts[tweet.userVerdict]--
    }
    tweet.verdicts[verdictType]++
    tweet.userVerdict = verdictType
  }
  render()
}

// ─── NEW FUNCTION 3: Mood Tag Selector ────────────────────────────────────────
function handleMoodSelect(clickedBtn) {
  document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'))
  clickedBtn.classList.add('active')
  activeMood = clickedBtn.dataset.mood
}

// ─── NEW FUNCTION 4: Feed Filter ──────────────────────────────────────────────
function handleFilterClick(clickedNav) {
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'))
  clickedNav.classList.add('active')
  activeFilter = clickedNav.dataset.filter
  render()
}

// ─── NEW FUNCTION 5: Reply Sorting ────────────────────────────────────────────
function handleReplySortClick(tweetId, mode) {
  replySortMode[tweetId] = mode
  render()
}

// ─── NEW FUNCTION 6: Submit Reply ─────────────────────────────────────────────
function handleSubmitReply(tweetId) {
  const input = document.getElementById(`reply-input-${tweetId}`)
  if (!input || !input.value.trim()) return

  const tweet = tweetsData.find(t => t.uuid === tweetId)
  const randomName = funNames[Math.floor(Math.random() * funNames.length)]
  
  tweet.replies.push({
    handle: `@${randomName.replace(' ', '')} ✅`,
    profilePic: `images/scrimbalogo.png`,
    tweetText: input.value
  })

  input.value = ''
  activeReplyBox = null
  render()
}

// ─── NEW FUNCTION 7: Theme Toggle ─────────────────────────────────────────────
function handleThemeToggle() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  // Update icon and label
  const icon = document.querySelector("#theme-toggle i");
  const label = document.querySelector(".theme-label");

  if (newTheme === "light") {
    icon.className = "fa-solid fa-moon";
    label.textContent = "Dark mode";
  } else {
    icon.className = "fa-solid fa-sun";
    label.textContent = "Light mode";
  }
}

// ─── HELPER: Sort Replies by Mode ─────────────────────────────────────────────
function sortReplies(replies, mode, opHandle) {
  const sorted = [...replies]

  if (mode === 'op') {
    return sorted.filter(r => r.handle === opHandle)
  } else if (mode === 'recent') {
    return sorted.reverse()
  } else {
    return sorted.sort((a, b) => {
      const aVerified = a.handle.includes('✅')
      const bVerified = b.handle.includes('✅')
      if (aVerified && !bVerified) return -1
      if (!aVerified && bVerified) return 1
      return a.handle.localeCompare(b.handle)
    })
  }
}

// ─── HELPER: Trust Score ──────────────────────────────────────────────────────
function getTrustScore(verdicts) {
  const total = verdicts.verified + verdicts.disputed + verdicts.satire
  if (total === 0) return { label: 'Unverified', cssClass: 'trust-low', score: null }

  const verifiedRatio = verdicts.verified / total

  if (verifiedRatio >= 0.55) {
    return { label: `✓ ${Math.round(verifiedRatio * 100)}%`, cssClass: 'trust-high', score: verifiedRatio }
  } else if (verdicts.disputed > verdicts.verified) {
    const disputedRatio = Math.round((verdicts.disputed / total) * 100)
    return { label: `⚠ ${disputedRatio}% Disputed`, cssClass: 'trust-mid', score: verifiedRatio }
  } else if (verdicts.satire > verdicts.verified) {
    return { label: `Satire`, cssClass: 'trust-low', score: verifiedRatio }
  } else {
    return { label: 'Unverified', cssClass: 'trust-low', score: null }
  }
}

const moodLabels = {
  insight: '💡 Insight',
  hottake: '🔥 Hot Take',
  genuine: '🙏 Genuine',
  rant: '😤 Rant',
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

function getFeedHtml() {
  let visibleTweets = tweetsData

  if (activeFilter === 'bookmarks') {
    visibleTweets = tweetsData.filter(t => t.isBookmarked)
  } else if (activeFilter !== 'all') {
    visibleTweets = tweetsData.filter(t => t.moodTag === activeFilter)
  }

  if (visibleTweets.length === 0) {
    return `<p class="empty-state">No posts here yet.</p>`
  }

  let feedHtml = ''

  visibleTweets.forEach(function(tweet) {
    const sortMode = replySortMode[tweet.uuid] || 'relevance'
    const sortedReplies = sortReplies(tweet.replies, sortMode, tweet.handle)

    let repliesHtml = ''
    if (sortedReplies.length > 0) {
      repliesHtml = sortedReplies.map(reply => `
        <div class="tweet-reply">
          <img src="${reply.profilePic}" class="profile-pic">
          <div class="reply-body">
            <p class="reply-handle">${reply.handle}</p>
            <p class="reply-text">${reply.tweetText}</p>
          </div>
        </div>`).join('')
    }

    const trust = getTrustScore(tweet.verdicts)
    const totalVerdicts = tweet.verdicts.verified + tweet.verdicts.disputed + tweet.verdicts.satire

    let replySortControls = ''
    if (tweet.replies.length > 0) {
      replySortControls = `
        <div style="display:flex;gap:8px;margin-bottom:12px;font-size:13px;">
          <button class="verdict-btn ${sortMode === 'relevance' ? 'active-verified' : ''}" data-sort-replies="${tweet.uuid}" data-mode="relevance">Most Relevant</button>
          <button class="verdict-btn ${sortMode === 'recent' ? 'active-verified' : ''}" data-sort-replies="${tweet.uuid}" data-mode="recent">Recent</button>
          <button class="verdict-btn ${sortMode === 'op' ? 'active-verified' : ''}" data-sort-replies="${tweet.uuid}" data-mode="op">OP Only</button>
        </div>`
    }

    let replyInputBox = ''
    if (activeReplyBox === tweet.uuid) {
      replyInputBox = `
        <div class="reply-input-box">
          <textarea id="reply-input-${tweet.uuid}" placeholder="Post your reply..." rows="2"></textarea>
          <button class="reply-submit-btn" data-submit-reply="${tweet.uuid}">Reply</button>
        </div>`
    }

    feedHtml += `
      <div class="tweet">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div class="tweet-body">
          <div class="tweet-header">
            <span class="handle">${tweet.handle}</span>
            <span class="trust-badge ${trust.cssClass}">${trust.label}</span>
            <span class="mood-tag">${moodLabels[tweet.moodTag] || ''}</span>
          </div>
          <p class="tweet-text">${tweet.tweetText}</p>
          
          <p class="tweet-text">${tweet.tweetText}</p>

${tweet.videoUrl ? `
  <a href="${tweet.videoUrl}" target="_blank" rel="noopener" class="video-link">
    <i class="fa-brands fa-youtube"></i> Watch on YouTube
  </a>
` : ''}
          

          <div class="tweet-actions">
            <button class="action-btn" data-reply="${tweet.uuid}">
              <i class="fa-regular fa-comment" data-reply="${tweet.uuid}"></i>
              <span>${tweet.replies.length}</span>
            </button>
            <button class="action-btn ${tweet.isRetweeted ? 'retweeted' : ''}" data-retweet="${tweet.uuid}">
              <i class="fa-solid fa-retweet" data-retweet="${tweet.uuid}"></i>
              <span>${tweet.retweets}</span>
            </button>
            <button class="action-btn ${tweet.isLiked ? 'liked' : ''}" data-like="${tweet.uuid}">
              <i class="fa-${tweet.isLiked ? 'solid' : 'regular'} fa-heart" data-like="${tweet.uuid}"></i>
              <span>${tweet.likes}</span>
            </button>
            <button class="action-btn ${tweet.isBookmarked ? 'bookmarked' : ''}" data-bookmark="${tweet.uuid}">
              <i class="fa-${tweet.isBookmarked ? 'solid' : 'regular'} fa-bookmark" data-bookmark="${tweet.uuid}"></i>
              <span>${tweet.bookmarks || 0}</span>
            </button>
          </div>

          <div class="verdict-row">
            <span style="font-size:13px;color:var(--text-secondary);">Community (${totalVerdicts}):</span>
            <button class="verdict-btn ${tweet.userVerdict === 'verified' ? 'active-verified' : ''}" 
                    data-verdict="${tweet.uuid}|verified">✓ Verified ${tweet.verdicts.verified}</button>
            <button class="verdict-btn ${tweet.userVerdict === 'disputed' ? 'active-disputed' : ''}" 
                    data-verdict="${tweet.uuid}|disputed">⚠ Disputed ${tweet.verdicts.disputed}</button>
            <button class="verdict-btn ${tweet.userVerdict === 'satire' ? 'active-satire' : ''}" 
                    data-verdict="${tweet.uuid}|satire">Satire ${tweet.verdicts.satire}</button>
          </div>

          ${replyInputBox}

          <div class="replies-section ${activeReplyBox === tweet.uuid || tweet.replies.length > 0 ? 'visible' : ''}" id="replies-${tweet.uuid}">
            ${replySortControls}
            ${repliesHtml}
          </div>
        </div>
      </div>`
  })

  return feedHtml
}

function render() {
  document.getElementById('feed').innerHTML = getFeedHtml()
}

// ─── INITIALIZE ───────────────────────────────────────────────────────────────
// Set theme on load
const savedTheme = localStorage.getItem("theme") || "light"; // Changed from 'dark'
document.documentElement.setAttribute("data-theme", savedTheme);
const icon = document.querySelector("#theme-toggle i");
const label = document.querySelector(".theme-label");

if (icon && label) {
  if (savedTheme === "light") {
    icon.className = "fa-solid fa-moon";
    label.textContent = "Dark mode";
  } else {
    icon.className = "fa-solid fa-sun";
    label.textContent = "Light mode";
  }
}

render();

// Force render on load
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, rendering feed')
  console.log('Tweets available:', tweetsData.length)
  render()
})

