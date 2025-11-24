console.log("Elden Tweet popup loaded - Modern UI by dursunator");

document.addEventListener("DOMContentLoaded", async () => {
  const soundToggle = document.getElementById("soundToggle");
  const durationSlider = document.getElementById("durationSlider");
  const durationValue = document.getElementById("durationValue");
  const colorCards = document.querySelectorAll(".color-card");

  const storage = browser.storage;

  const DEFAULT_SOUND = true;
  const DEFAULT_COLOR = "yellow";
  const DEFAULT_DURATION = 3; 

  try {
    const res = await storage.sync.get(["soundEnabled", "bannerColor", "bannerDuration"]);
    const prefs = {
      soundEnabled: res.soundEnabled !== undefined ? res.soundEnabled : DEFAULT_SOUND,
      bannerColor: res.bannerColor || DEFAULT_COLOR,
      bannerDuration: res.bannerDuration || DEFAULT_DURATION
    };
    soundToggle.checked = prefs.soundEnabled;
    durationSlider.value = prefs.bannerDuration;
    durationValue.textContent = prefs.bannerDuration;

    colorCards.forEach(card => {
      card.classList.toggle("selected", card.dataset.color === prefs.bannerColor);
    });

    console.log("Preferences loaded:", prefs);


    soundToggle.addEventListener("change", async () => {
      try {
        await storage.sync.set({ soundEnabled: soundToggle.checked });
        console.log("Sound setting saved:", soundToggle.checked);
      } catch (error) {
        console.error("Error saving sound setting:", error);
      }
    });


    durationSlider.addEventListener("input", () => {
      durationValue.textContent = durationSlider.value;
    });

    durationSlider.addEventListener("change", async () => {
      try {
        const duration = parseInt(durationSlider.value);
        await storage.sync.set({ bannerDuration: duration });
        console.log("Banner duration saved:", duration);
      } catch (error) {
        console.error("Error saving duration:", error);
      }
    });
    colorCards.forEach(card => {
      card.addEventListener("click", async () => {
        colorCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");

        try {
          await storage.sync.set({ bannerColor: card.dataset.color });
          console.log("Banner color saved:", card.dataset.color);
        } catch (error) {
          console.error("Error saving banner color:", error);
        }
      });
    });

  } catch (error) {
    console.error("Error loading preferences:", error);

    soundToggle.checked = DEFAULT_SOUND;
    durationSlider.value = DEFAULT_DURATION;
    durationValue.textContent = DEFAULT_DURATION;
    colorCards.forEach(card => {
      card.classList.toggle("selected", card.dataset.color === DEFAULT_COLOR);
    });
  }
});
