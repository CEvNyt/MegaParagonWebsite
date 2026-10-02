const FORM_ENDPOINTS = {
  join: "/api/forms/join",
  inquiry: "/api/forms/inquiry",
};

const FORM_MESSAGES = {
  join: {
    success:
      "Thank you for applying. Our team will review your application and contact you soon.",
    error:
      "We could not submit your application right now. Please try again later.",
  },
  inquiry: {
    success:
      "Thank you for your inquiry. Our team will contact you soon about your consultation.",
    error: "We could not send your inquiry right now. Please try again later.",
  },
};

async function submitForm(formType, form) {
  const endpoint = FORM_ENDPOINTS[formType];
  if (!endpoint) throw new Error(`Unknown form type: ${formType}`);

  // Recruitment includes a CV file, so it uses multipart FormData.
  const isMultipart = formType === "join";
  const body = isMultipart
    ? new FormData(form)
    : JSON.stringify(Object.fromEntries(new FormData(form)));

  const response = await fetch(endpoint, {
    method: "POST",
    headers: isMultipart ? {} : { "Content-Type": "application/json" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Form submission failed with HTTP ${response.status}`);
  }

  return response;
}

function setupForm(form) {
  const formType = form.dataset.formType;
  // Each form owns its status element so Join and Quote can show independent messages.
  const message = form.querySelector(".form-message");
  const submitButton = form.querySelector("[type=submit]");
  const formMessages = FORM_MESSAGES[formType];

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "Sending...";
    message.classList.add("is-visible");
    submitButton.disabled = true;

    try {
      await submitForm(formType, form);
      message.textContent = formMessages.success;
      form.reset();
    } catch (error) {
      console.error(`${formType} form submission failed:`, error);
      message.textContent = formMessages.error;
    } finally {
      submitButton.disabled = false;
    }
  });
}

document.querySelectorAll("form[data-form-type]").forEach(setupForm);
