(function () {
  "use strict";

  const form = document.getElementById("date-form");
  const status = document.getElementById("form-status");
  const submitButton = form ? form.querySelector(".submit-button") : null;

  if (!form || !status || !submitButton) {
    return;
  }

  const fields = {
    activity: {
      selector: "input[name='Activity']",
      error: document.getElementById("activity-error"),
      message: "Избери какво ти се прави, за да измисля най-хубавия план."
    },
    food: {
      selector: "input[name='Food']",
      error: document.getElementById("food-error"),
      message: "Избери нещо за хапване, обещавам да го взема насериозно."
    },
    dateTime: {
      date: document.getElementById("date-field"),
      time: document.getElementById("time-field"),
      error: document.getElementById("datetime-error"),
      message: "Избери дата и час, за да знам кога да се вълнувам официално."
    },
    confirm: {
      checkbox: document.getElementById("confirm-field"),
      error: document.getElementById("confirm-error"),
      message: "Това квадратче е задължително. Особено частта с неизпържването."
    }
  };

  function syncVisibleRadioValues(name) {
    const inputs = Array.from(form.querySelectorAll("input[name='" + name + "']"));

    inputs.forEach(function (input) {
      const label = input.closest("label");
      const optionText = label ? label.querySelector("span") : null;

      if (optionText) {
        input.value = optionText.textContent.trim();
      }
    });
  }

  function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function initWalletSlider() {
    const options = ["Леко", "Достатъчно", "Започваш да ме притесняваш"];
    const slider = document.querySelector("[data-wallet-slider]");
    const track = slider ? slider.querySelector(".wallet-track-shell") : null;
    const input = document.getElementById("wallet-field");
    const steps = slider ? Array.from(slider.querySelectorAll("[data-wallet-step]")) : [];

    if (!slider || !track || !input) {
      return;
    }

    let currentIndex = options.indexOf(input.value);
    let isDragging = false;

    if (currentIndex === -1) {
      currentIndex = 1;
    }

    function setWalletIndex(index) {
      currentIndex = clampNumber(Math.round(index), 0, options.length - 1);

      const selectedValue = options[currentIndex];
      const position = currentIndex * 50;

      slider.style.setProperty("--wallet-position", position + "%");
      slider.setAttribute("aria-valuenow", String(currentIndex + 1));
      slider.setAttribute("aria-valuetext", selectedValue);
      input.value = selectedValue;

      steps.forEach(function (step) {
        step.classList.toggle("is-selected", Number(step.dataset.walletStep) === currentIndex);
      });
    }

    function getIndexFromPointer(event) {
      const rect = track.getBoundingClientRect();
      const pointerX = clampNumber(event.clientX - rect.left, 0, rect.width);
      const ratio = rect.width ? pointerX / rect.width : 0.5;

      return Math.round(ratio * (options.length - 1));
    }

    function updateFromPointer(event) {
      event.preventDefault();
      setWalletIndex(getIndexFromPointer(event));
    }

    slider.addEventListener("pointerdown", function (event) {
      isDragging = true;
      slider.classList.add("is-dragging");
      slider.focus();

      if (slider.setPointerCapture) {
        slider.setPointerCapture(event.pointerId);
      }

      updateFromPointer(event);
    });

    slider.addEventListener("pointermove", function (event) {
      if (!isDragging) {
        return;
      }

      updateFromPointer(event);
    });

    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (eventName) {
      slider.addEventListener(eventName, function () {
        isDragging = false;
        slider.classList.remove("is-dragging");
        setWalletIndex(currentIndex);
      });
    });

    slider.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        setWalletIndex(currentIndex - 1);
      }

      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        setWalletIndex(currentIndex + 1);
      }

      if (event.key === "Home") {
        event.preventDefault();
        setWalletIndex(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        setWalletIndex(options.length - 1);
      }
    });

    setWalletIndex(currentIndex);
  }

  function setStatus(message, type) {
    status.textContent = message;
    status.classList.toggle("is-error", type === "error");
    status.classList.toggle("is-success", type === "success");
  }

  function setGroupError(group, hasError) {
    const wrapper = group.error ? group.error.closest(".question") : null;

    if (group.error) {
      group.error.textContent = hasError ? group.message : "";
    }

    if (wrapper) {
      wrapper.classList.toggle("is-invalid", hasError);
    }
  }

  function validateRadioGroup(group) {
    const selected = form.querySelector(group.selector + ":checked");
    const inputs = Array.from(form.querySelectorAll(group.selector));
    const hasError = !selected;

    setGroupError(group, hasError);
    inputs.forEach(function (input) {
      input.setAttribute("aria-invalid", String(hasError));
    });

    return !hasError;
  }

  function validateDateTime() {
    const hasError = !fields.dateTime.date.value || !fields.dateTime.time.value;

    setGroupError(fields.dateTime, hasError);
    fields.dateTime.date.setAttribute("aria-invalid", String(hasError && !fields.dateTime.date.value));
    fields.dateTime.time.setAttribute("aria-invalid", String(hasError && !fields.dateTime.time.value));

    return !hasError;
  }

  function validateConfirm() {
    const hasError = !fields.confirm.checkbox.checked;

    setGroupError(fields.confirm, hasError);
    fields.confirm.checkbox.setAttribute("aria-invalid", String(hasError));

    return !hasError;
  }

  // Custom validation keeps the native browser bubbles out of the experience.
  function validateForm() {
    const checks = [
      validateRadioGroup(fields.activity),
      validateRadioGroup(fields.food),
      validateDateTime(),
      validateConfirm()
    ];

    return checks.every(Boolean);
  }

  function focusFirstInvalidField() {
    const invalid = form.querySelector("[aria-invalid='true']");

    if (invalid) {
      invalid.focus({ preventScroll: true });
      invalid.closest(".question").scrollIntoView({
        block: "center",
        behavior: "smooth"
      });
    }
  }

  function buildFormData() {
    const data = new FormData(form);
    data.set("Checkbox state", fields.confirm.checkbox.checked ? "Отбелязано" : "Не е отбелязано");
    return data;
  }

  async function submitForm() {
    submitButton.disabled = true;
    submitButton.textContent = "Изпраща се...";
    setStatus("Изпращам отговора...", "");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: buildFormData(),
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Formspree request failed");
      }

      setStatus("Готово. Прехвърлям те нататък...", "success");
      window.setTimeout(function () {
        window.SimonkaSite.navigateWithFade("success.html");
      }, 420);
    } catch (error) {
      setStatus("Не успях да изпратя формата. Провери Formspree линка и пробвай пак.", "error");
      submitButton.disabled = false;
      submitButton.textContent = "Изпрати";
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    setStatus("", "");

    if (!validateForm()) {
      setStatus("Още мъничко и сме готови.", "error");
      focusFirstInvalidField();
      return;
    }

    submitForm();
  });

  form.addEventListener("change", function (event) {
    const name = event.target.name;

    if (name === "Activity") {
      validateRadioGroup(fields.activity);
    }

    if (name === "Food") {
      validateRadioGroup(fields.food);
    }

    if (name === "Date" || name === "Time") {
      validateDateTime();
    }

    if (name === "Checkbox state") {
      validateConfirm();
    }
  });

  syncVisibleRadioValues("Activity");
  syncVisibleRadioValues("Food");
  syncVisibleRadioValues("Delay");
  initWalletSlider();
}());
