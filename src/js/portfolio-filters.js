/**
 * Portfolio Filters Module
 * Handles project filtering by category
 */

const SELECTORS = {
  filterBtn: '.filter-btn',
  projectCard: '.project-card',
};

const CLASSES = {
  active: 'filter-btn--active',
  hidden: 'is-hidden',
};

/**
 * Shows only the project cards whose `data-category` matches, hiding the rest
 * with a CSS class rather than removing them so they can be restored instantly.
 *
 * @param {string} category - Category to show; 'all' shows every project
 * @returns {void}
 * @example
 * filterProjects('web') // hides every card whose data-category isn't 'web'
 */
function filterProjects(category) {
  const projects = document.querySelectorAll(SELECTORS.projectCard);

  projects.forEach((project) => {
    const projectCategory = project.dataset.category;

    if (category === 'all' || projectCategory === category) {
      project.classList.remove(CLASSES.hidden);
    } else {
      project.classList.add(CLASSES.hidden);
    }
  });
}

/**
 * Marks one filter button as the active choice and resets the others, updating
 * `aria-pressed` so screen readers announce the current filter.
 *
 * @param {HTMLElement} activeBtn - Button to mark as active
 * @throws {TypeError} If `activeBtn` is null or undefined
 * @example
 * updateActiveButton(document.querySelector('[data-filter="web"]'))
 */
function updateActiveButton(activeBtn) {
  const buttons = document.querySelectorAll(SELECTORS.filterBtn);

  buttons.forEach((btn) => {
    btn.classList.remove(CLASSES.active);
    btn.setAttribute('aria-pressed', 'false');
  });

  activeBtn.classList.add(CLASSES.active);
  activeBtn.setAttribute('aria-pressed', 'true');
}

/**
 * Handles clicks on the filters container via event delegation, so one listener
 * covers all buttons. Clicks on anything other than a `.filter-btn` are ignored.
 *
 * @param {MouseEvent} event - Click event bubbling from the filters container
 * @returns {void}
 */
function handleFilterClick(event) {
  const button = event.target;

  if (!button.classList.contains('filter-btn')) {
    return;
  }

  const category = button.dataset.filter;

  updateActiveButton(button);
  filterProjects(category);
}

/**
 * Enables category filtering on the portfolio page. Returns silently when the
 * `.portfolio__filters` container is absent, so it is safe to load on any page.
 * Also runs automatically once the DOM is ready.
 *
 * @returns {void}
 * @example
 * import { initPortfolioFilters } from './portfolio-filters.js';
 * initPortfolioFilters();
 */
export function initPortfolioFilters() {
  const filtersContainer = document.querySelector('.portfolio__filters');

  if (!filtersContainer) {
    return;
  }

  filtersContainer.addEventListener('click', handleFilterClick);
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolioFilters);
} else {
  initPortfolioFilters();
}
