(function () {
  const BOARD_SELECTOR = "[data-service-focus-board]";
  const DISPLAY_SELECTOR = "[data-service-focus-display]";
  const TAB_SELECTOR = "[data-service-focus-tab]";
  const ACTIVE_CLASS = "is-active";

  const focusBoards = Array.from(document.querySelectorAll(BOARD_SELECTOR));

  if (focusBoards.length === 0) return;

  function translate(key) {
    return window.I18N?.t ? window.I18N.t(key) : key;
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text) {
      element.textContent = text;
    }

    return element;
  }

  function getItemKeys(tab) {
    return String(tab.dataset.focusItemKeys || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function getActiveTab(tabs) {
    return tabs.find((tab) => tab.classList.contains(ACTIVE_CLASS)) || tabs[0];
  }

  function renderFocus(display, tab) {
    if (!display || !tab) return;

    const eyebrowKey = tab.dataset.focusEyebrowKey;
    const titleKey = tab.dataset.focusTitleKey;
    const textKey = tab.dataset.focusTextKey;
    const itemKeys = getItemKeys(tab);

    if (!eyebrowKey || !titleKey || !textKey || itemKeys.length === 0) return;

    const eyebrow = makeElement("p", "eyebrow", translate(eyebrowKey));
    const title = makeElement("h3", "", translate(titleKey));
    const text = makeElement("p", "", translate(textKey));
    const list = makeElement("ul", "", "");

    itemKeys.forEach((itemKey) => {
      list.appendChild(makeElement("li", "", translate(itemKey)));
    });

    display.replaceChildren(eyebrow, title, text, list);
  }

  function activateTab(tabs, display, tab) {
    if (!tab) return;

    tabs.forEach((item) => {
      item.classList.remove(ACTIVE_CLASS);
      item.setAttribute("aria-selected", "false");
    });

    tab.classList.add(ACTIVE_CLASS);
    tab.setAttribute("aria-selected", "true");
    renderFocus(display, tab);
  }

  function initFocusBoard(board) {
    const display = board.querySelector(DISPLAY_SELECTOR);
    const tabs = Array.from(board.querySelectorAll(TAB_SELECTOR));

    if (!display || tabs.length === 0) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activateTab(tabs, display, tab));
    });

    window.addEventListener("language:changed", () => {
      renderFocus(display, getActiveTab(tabs));
    });

    activateTab(tabs, display, getActiveTab(tabs));
  }

  focusBoards.forEach(initFocusBoard);
})();
