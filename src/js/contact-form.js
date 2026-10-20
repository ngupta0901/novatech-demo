/**
 * Contact Form Module
 * Handles form validation and submission
 */

import { validateField, validateForm } from './validation.js';

const SELECTORS = {
  form: '#contact-form',
  status: '#form-status',
};

const CLASSES = {
  invalid: 'is-invalid',
  statusSuccess: 'form-status--success',
  statusError: 'form-status--error',
};

const MESSAGES = {
  success: 'Thank you! Your message has been sent. We\'ll get back to you soon.',
  error: 'Sorry, there was an error sending your message. Please try again.',
};

/**
 * Displays a success or error message in the form's status region so users
 * (and screen readers, if the element is a live region) learn the outcome.
 * Replaces any previous status styling.
 *
 * @param {HTMLElement} statusEl - Status element
 * @param {string} message - Message to display
 * @param {boolean} isSuccess - True for success styling, false for error styling
 * @throws {TypeError} If `statusEl` is null or undefined
 * @example
 * showStatus(statusEl, 'Message sent!', true)
 */
function showStatus(statusEl, message, isSuccess) {
  statusEl.textContent = message;
  statusEl.classList.remove(CLASSES.statusSuccess, CLASSES.statusError);
  statusEl.classList.add(isSuccess ? CLASSES.statusSuccess : CLASSES.statusError);
}

/**
 * Empties the status region and removes its styling, so stale results from a
 * previous attempt don't linger while a new submission is validated.
 *
 * @param {HTMLElement} statusEl - Status element
 * @throws {TypeError} If `statusEl` is null or undefined
 * @example
 * clearStatus(document.querySelector('#form-status'))
 */
function clearStatus(statusEl) {
  statusEl.textContent = '';
  statusEl.classList.remove(CLASSES.statusSuccess, CLASSES.statusError);
}

/**
 * Handles contact form submission: validates all fields, moves focus to the
 * first invalid one (so keyboard and screen reader users land on the problem),
 * and otherwise submits. Submission is currently simulated with a 1.5s delay;
 * replace the timeout with a real request when an API exists. The submit button
 * is disabled while sending to prevent duplicate submissions.
 *
 * @param {SubmitEvent} event - Submit event from the contact form
 * @returns {Promise<void>} Resolves once validation fails or submission finishes
 * @throws {TypeError} If the `#form-status` element is missing from the page
 */
async function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const statusEl = document.querySelector(SELECTORS.status);

  clearStatus(statusEl);

  // Validate all fields
  const validationResult = validateForm(form);

  if (!validationResult.isValid) {
    // Focus first invalid field
    const firstInvalidField = form.querySelector(`.${CLASSES.invalid}`);
    if (firstInvalidField) {
      firstInvalidField.focus();
    }
    return;
  }

  // Simulate form submission
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    showStatus(statusEl, MESSAGES.success, true);
    form.reset();
  } catch (error) {
    showStatus(statusEl, MESSAGES.error, false);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

/**
 * Validates a field when the user leaves it, giving feedback early without
 * flagging optional fields the user hasn't touched.
 *
 * @param {FocusEvent} event - Blur event from an input or textarea
 */
function handleFieldBlur(event) {
  const field = event.target;

  if (field.hasAttribute('required') || field.value) {
    validateField(field);
  }
}

/**
 * Wires up submit and blur validation on the contact form. Safe to call on
 * pages without the form (it returns silently), which lets the module be
 * loaded site-wide. Also runs automatically once the DOM is ready.
 *
 * @returns {void}
 * @example
 * import { initContactForm } from './contact-form.js';
 * initContactForm();
 */
export function initContactForm() {
  const form = document.querySelector(SELECTORS.form);

  if (!form) {
    return;
  }

  form.addEventListener('submit', handleSubmit);

  // Add blur validation to required fields
  const fields = form.querySelectorAll('input, textarea');
  fields.forEach((field) => {
    field.addEventListener('blur', handleFieldBlur);
  });
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactForm);
} else {
  initContactForm();
}
