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
}());
