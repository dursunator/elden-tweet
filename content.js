console.log("Elden Tweet content script loaded! - by dursunator");

const storage = browser.storage;

const soundUrl = browser.runtime.getURL("assets/elden_ring_sound.mp3");

const tweetKeywords = [
  "Tweet", "Post", "Tweetle", "ツイート", "트윗",
  "Tuitear", "Tweeten", "Tweeter", "Твитнуть",
  "تغريد", "ทวีต", "发推", "發推"
];

let soundEnabled = true;
let bannerColor = "yellow";
let bannerDuration = 3; 
const loadPrefs = async () => {
  try {
    const res = await storage.sync.get(["soundEnabled", "bannerColor", "bannerDuration"]);
    soundEnabled = res.soundEnabled !== undefined ? res.soundEnabled : true;
    bannerColor = res.bannerColor || "yellow";
    bannerDuration = res.bannerDuration || 3;
    console.log("Preferences loaded:", { soundEnabled, bannerColor, bannerDuration });
  } catch (error) {
    console.error("Error loading preferences:", error);
  }
};
loadPrefs();

storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync") {
    if (changes.soundEnabled) {
      soundEnabled = changes.soundEnabled.newValue;
      console.log("Sound setting updated:", soundEnabled);
    }
    if (changes.bannerColor) {
      bannerColor = changes.bannerColor.newValue;
      console.log("Banner color updated:", bannerColor);
    }
    if (changes.bannerDuration) {
      bannerDuration = changes.bannerDuration.newValue;
      console.log("Banner duration updated:", bannerDuration);
    }
  }
});

function showEldenRingBanner() {
  console.log("🎮 Tweet sent! Showing Elden Ring banner - by dursunator");
  const existingBanner = document.getElementById('elden-ring-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  const banner = document.createElement('div');
  banner.id = 'elden-ring-banner';
  let imageName;
  if (bannerColor === "yellow") {
    imageName = "tweet_sent.png"; 
  } else if (bannerColor === "red") {
    imageName = "tweet_sent_red.png";
  } else if (bannerColor === "blue") {
    imageName = "tweet_sent_blue.png";
  } else {
    imageName = "tweet_sent.png"; 
  }

  const imgPath = browser.runtime.getURL(`assets/${imageName}`);
  banner.innerHTML = `<img src="${imgPath}" alt="Tweet Sent - Elden Ring">`;
  document.body.appendChild(banner);

  if (soundEnabled) {
    const audio = new Audio(soundUrl);
    audio.volume = 0.35;
    audio.play().catch(err => console.error("Sound playback error:", err));
  }

 
  requestAnimationFrame(() => {
    banner.classList.add('show');
  });

  
  const displayDuration = bannerDuration * 1000; 
  setTimeout(() => {
    banner.classList.remove('show');
    setTimeout(() => {
      if (banner.parentNode) {
        banner.remove();
      }
    }, 500);
  }, displayDuration);
}


let lastTweetTime = 0;
const DEBOUNCE_DELAY = 2000; 

function handleTweetClick() {
  const now = Date.now();
  if (now - lastTweetTime < DEBOUNCE_DELAY) {
    console.log("Tweet click debounced");
    return;
  }
  lastTweetTime = now;

  console.log("Tweet/Post button clicked - dursunator");
  setTimeout(showEldenRingBanner, 800);
}


const twitterObserver = new MutationObserver((mutations) => {
  
  const buttons = document.querySelectorAll(
    'div[role="button"], button[role="button"], button[data-testid*="tweet"]'
  );

  buttons.forEach(btn => {
    if (btn.dataset.eldenRingAttached) return;

    const ariaLabel = (btn.getAttribute("aria-label") || "").toLowerCase();
    const dataTestId = (btn.getAttribute("data-testid") || "").toLowerCase();
    const text = (btn.innerText || "").trim().toLowerCase();

   
    const isNewPostsButton =
      text.includes("new") ||
      ariaLabel.includes("new") ||
      ariaLabel.includes("see") ||
      text.includes("see");

    if (isNewPostsButton) {
      return; 
    }

    
    const isTweetBtn = tweetKeywords.some(k =>
      ariaLabel.includes(k.toLowerCase()) ||
      text === k.toLowerCase() ||
      dataTestId.includes("tweet")
    );

    
    const isPostBtn = (text === "post" || ariaLabel.includes("post")) &&
      (dataTestId.includes("tweet") ||
        btn.closest('[data-testid="tweetButton"]') ||
        btn.closest('[data-testid="toolBar"]') ||
        btn.closest('[aria-label*="Tweet"]'));

    if (isTweetBtn || isPostBtn) {
      btn.addEventListener("click", handleTweetClick, { passive: true });
      btn.dataset.eldenRingAttached = "true";
      console.log("✅ Attached listener to tweet button:", text || dataTestId);
    }
  });

  
  const specificButtons = document.querySelectorAll(
    '[data-testid="tweetButtonInline"], [data-testid="tweetButton"]'
  );

  specificButtons.forEach(btn => {
    if (!btn.dataset.eldenRingAttached) {
      btn.addEventListener("click", handleTweetClick, { passive: true });
      btn.dataset.eldenRingAttached = "true";
      console.log("✅ Attached listener to main tweet button");
    }
  });
});

twitterObserver.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
});

console.log("🦊 Twitter observer started - Firefox optimized by dursunator");


document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    console.log("⌨️ Ctrl+Enter detected - checking for tweet composition");

    
    const tweetTextarea = document.querySelector('[data-testid="tweetTextarea_0"]');
    const replyTextarea = document.querySelector('[data-testid="tweetTextarea_1"]');

    if (tweetTextarea || replyTextarea) {
      const activeTextarea = tweetTextarea || replyTextarea;
      const text = activeTextarea.textContent || activeTextarea.value;

      if (text && text.trim().length > 0) {
        console.log("✅ Tweet text detected, will show banner");
        
        setTimeout(handleTweetClick, 1000);
      }
    }
  }
}, { passive: true });

console.log("⌨️ Keyboard shortcut listener added - by dursunator");
