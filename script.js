(function () {
  "use strict";

  const page = document.body.dataset.page;
  const exitDuration = 260;

  function navigateWithFade(target) {
    document.body.classList.add("page-exit");
    window.setTimeout(function () {
      window.location.href = target;
    }, exitDuration);
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // Playful first-page button behavior.
  function initHomePage() {
    const yesButton = document.querySelector(".yes-button");
    const noButton = document.querySelector(".no-button");

    if (!yesButton || !noButton) {
      return;
    }

    let attempts = 0;
    let lastMove = 0;

    function growYesButton() {
      const scale = clamp(1 + attempts * 0.045, 1, 1.72);
      yesButton.style.setProperty("--yes-scale", scale.toFixed(2));

      if (attempts >= 6) {
        yesButton.classList.add("yes-growing");
      }
    }

    function moveNoButton(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      const now = Date.now();
      if (now - lastMove < 90) {
        return;
      }
      lastMove = now;

      attempts += 1;
      growYesButton();

      if (attempts >= 15) {
        noButton.classList.add("is-gone");
        noButton.setAttribute("aria-hidden", "true");
        noButton.tabIndex = -1;
        return;
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const buttonWidth = attempts >= 10 ? 36 : 92;
      const buttonHeight = attempts >= 10 ? 36 : 52;
      const safeInset = 18;
      const maxX = Math.max(safeInset, viewportWidth - buttonWidth - safeInset);
      const maxY = Math.max(safeInset, viewportHeight - buttonHeight - safeInset);
      const x = randomBetween(safeInset, maxX);
      const y = randomBetween(safeInset + 8, maxY - 8);
      const rotate = randomBetween(-22, 22);
      const tinyScale = attempts >= 10 ? randomBetween(0.52, 0.75) : randomBetween(0.82, 1.08);
      const teleport = attempts % 4 === 0;

      noButton.classList.add("is-running");
      noButton.classList.toggle("is-tiny", attempts >= 10);
      noButton.style.left = x + "px";
      noButton.style.top = y + "px";
      noButton.style.transform = "rotate(" + rotate + "deg) scale(" + tinyScale.toFixed(2) + ")";
      noButton.style.transitionDuration = teleport ? "120ms" : "330ms";
      noButton.textContent = attempts >= 10 ? "не" : "Не";
    }

    yesButton.addEventListener("click", function () {
      navigateWithFade("form.html");
    });

    ["pointerenter", "pointerdown", "touchstart", "mousedown", "focus"].forEach(function (eventName) {
      noButton.addEventListener(eventName, moveNoButton, { passive: false });
    });

    noButton.addEventListener("click", moveNoButton);
  }

  // Success page close/back behavior.
  function initSuccessPage() {
    const closeButton = document.querySelector(".close-button");

    if (!closeButton) {
      return;
    }

    closeButton.addEventListener("click", function () {
      window.close();

      window.setTimeout(function () {
        if (window.history.length > 1) {
          window.history.back();
          return;
        }

        navigateWithFade("index.html");
      }, 120);
    });
  }

  window.SimonkaSite = {
    navigateWithFade: navigateWithFade
  };

  if (page === "home") {
    initHomePage();
  }

  if (page === "success") {
    initSuccessPage();
  }
}());
