/**
 * Validation Module
 * Reusable form validation utilities
 */

const CLASSES = {
  invalid: 'is-invalid',
};

const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-+()]{10,}$/,
};

const MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  minLength: (min) => `Please enter at least ${min} characters`,
  maxLength: (max) => `Please enter no more than ${max} characters`,
};

/**
 * Reads the constraints declared on a field's HTML attributes so validation
 * stays driven by the markup instead of duplicated rules in JavaScript.
 * Unset length constraints (the DOM reports -1) are normalized to null.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} field - Form field to inspect
 * @returns {{required: boolean, type: string, minLength: number|null, maxLength: number|null, pattern: string|null}}
 *   The constraints declared on the field
 * @example
 * // <input type="email" required minlength="5">
 * getValidationRules(input) // { required: true, type: 'email', minLength: 5, maxLength: null, pattern: null }
 */
function getValidationRules(field) {
  return {
    required: field.hasAttribute('required'),
    type: field.type,
    minLength: field.minLength > 0 ? field.minLength : null,
    maxLength: field.maxLength > 0 ? field.maxLength : null,
    pattern: field.pattern || null,
  };
}

/**
 * Validates one field and updates the UI to match, so users get immediate,
 * accessible feedback. Only the first failing rule is reported, in this order:
 * required, email format, phone format, min length, max length. Empty optional
 * fields are always valid.
 *
 * Side effects: toggles the `is-invalid` class on the field and writes the
 * message into the element with id `<field.id>-error` (if present).
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} field - Field to validate
 * @returns {{isValid: boolean, message: string}} Result; `message` is empty when valid
 * @throws {TypeError} If `field` is null or undefined
 * @example
 * validateField(document.getElementById('email'))
 * // { isValid: false, message: 'Please enter a valid email address' }
 */
export function validateField(field) {
  const rules = getValidationRules(field);
  const value = field.value.trim();
  const errorEl = document.getElementById(`${field.id}-error`);

  let isValid = true;
  let message = '';

  // Required check
  if (rules.required && !value) {
    isValid = false;
    message = MESSAGES.required;
  }

  // Email check
  else if (rules.type === 'email' && value && !PATTERNS.email.test(value)) {
    isValid = false;
    message = MESSAGES.email;
  }

  // Phone check
  else if (rules.type === 'tel' && value && !PATTERNS.phone.test(value)) {
    isValid = false;
    message = MESSAGES.phone;
  }

  // Min length check
  else if (rules.minLength && value && value.length < rules.minLength) {
    isValid = false;
    message = MESSAGES.minLength(rules.minLength);
  }

  // Max length check
  else if (rules.maxLength && value && value.length > rules.maxLength) {
    isValid = false;
    message = MESSAGES.maxLength(rules.maxLength);
  }

  // Update UI
  if (isValid) {
    field.classList.remove(CLASSES.invalid);
    if (errorEl) {
      errorEl.textContent = '';
    }
  } else {
    field.classList.add(CLASSES.invalid);
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  return { isValid, message };
}

/**
 * Validates every required or non-empty field in a form in one pass, so a
 * submit handler can block submission and surface all errors at once.
 * Each field's error UI is updated via {@link validateField}.
 *
 * @param {HTMLFormElement} form - Form to validate
 * @returns {{isValid: boolean, errors: Array<{field: string, message: string}>}}
 *   `errors` lists each failing field by name (or id) with its message
 * @throws {TypeError} If `form` is null or undefined
 * @example
 * const { isValid, errors } = validateForm(document.querySelector('#contact-form'))
 * // isValid === false, errors === [{ field: 'email', message: 'This field is required' }]
 */
export function validateForm(form) {
  const fields = form.querySelectorAll('input, textarea, select');
  const errors = [];

  fields.forEach((field) => {
    if (field.hasAttribute('required') || field.value) {
      const result = validateField(field);
      if (!result.isValid) {
        errors.push({
          field: field.name || field.id,
          message: result.message,
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Checks email format without touching the DOM, for use outside form fields.
 * Intentionally lenient (something@domain.tld); it does not verify the address exists.
 *
 * @param {string} email - Email address to check
 * @returns {boolean} True if the address matches the expected format
 * @example
 * isValidEmail('jane@novatech.com') // true
 * isValidEmail('jane@novatech')     // false
 */
export function isValidEmail(email) {
  return PATTERNS.email.test(email);
}

/**
 * Checks phone format without touching the DOM. Accepts digits, spaces,
 * dashes, plus signs and parentheses so common regional formats pass; requires
 * at least 10 such characters.
 *
 * @param {string} phone - Phone number to check
 * @returns {boolean} True if the number matches the expected format
 * @example
 * isValidPhone('+1 (555) 123-4567') // true
 * isValidPhone('12345')             // false
 */
export function isValidPhone(phone) {
  return PATTERNS.phone.test(phone);
}
