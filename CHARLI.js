/**
 * TransExDel — entry point.
 * Each feature lives in its own init function so new modules can be added without touching existing ones.
 */

const DESKTOP_QUERY = '(min-width: 68.75em)'; // keep in sync with the CSS breakpoint (1100px)

/**
 * Mobile menu: toggles the nav + contacts panels under the header.
 * On desktop both panels are always visible, so the controller stays idle.
 */
function initMenu() {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('menu-toggle');
  if (!header || !toggle) return;

  const desktop = window.matchMedia(DESKTOP_QUERY);
  const OPEN_CLASS = 'is-menu-open';
  const LABEL_OPEN = 'Закрити меню';
  const LABEL_CLOSED = 'Відкрити меню';

  const isOpen = () => header.classList.contains(OPEN_CLASS);

  const setOpen = (open) => {
    header.classList.toggle(OPEN_CLASS, open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? LABEL_OPEN : LABEL_CLOSED);
  };

  toggle.addEventListener('click', () => {
    if (desktop.matches) return;
    setOpen(!isOpen());
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (isOpen() && !header.contains(event.target)) setOpen(false);
  });

  header.addEventListener('click', (event) => {
    if (isOpen() && event.target.closest('.nav__link')) setOpen(false);
  });

  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

/**
 * Header: switches to the compact state once the page leaves the top.
 * Uses IntersectionObserver instead of a scroll handler, so nothing runs on every scroll frame.
 */
function initHeaderState() {
  const header = document.getElementById('site-header');
  const sentinel = document.getElementById('scroll-sentinel');
  if (!header || !sentinel || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(([entry]) => {
    header.classList.toggle('is-scrolled', !entry.isIntersecting);
  });
  observer.observe(sentinel);
}

/**
 * Tabs (ARIA tabs pattern): click, arrow keys, Home/End.
 * Works for any [data-tabs] root, so more tab groups can be added without new code.
 */
function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach((root) => {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
    if (!tabs.length) return;

    const select = (index, { focus = false } = {}) => {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[i]?.classList.toggle('is-active', active);
      });
      if (focus) tabs[index].focus();
      // keep the chosen tab in view inside the horizontally scrolling mobile list
      tabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };

    root.addEventListener('click', (event) => {
      const index = tabs.indexOf(event.target.closest('[role="tab"]'));
      if (index !== -1) select(index);
    });

    root.addEventListener('keydown', (event) => {
      const current = tabs.indexOf(document.activeElement);
      if (current === -1) return;
      const last = tabs.length - 1;
      const next = {
        ArrowDown: current === last ? 0 : current + 1,
        ArrowRight: current === last ? 0 : current + 1,
        ArrowUp: current === 0 ? last : current - 1,
        ArrowLeft: current === 0 ? last : current - 1,
        Home: 0,
        End: last,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(next, { focus: true });
    });
  });
}

function init() {
  initMenu();
  initHeaderState();
  initTabs();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}