(function () {
  const focusData = {
    level1: {
      eyebrowKey: "itSupportFocusLevel1Eyebrow",
      titleKey: "aboutLevel1Title",
      textKey: "itSupportFocusLevel1Text",
      itemKeys: [
        "aboutLevel1List1",
        "aboutLevel1List2",
        "aboutLevel1List3",
        "aboutLevel1List4",
        "aboutLevel1List5",
      ],
    },
    level2: {
      eyebrowKey: "itSupportFocusLevel2Eyebrow",
      titleKey: "aboutLevel2Title",
      textKey: "itSupportFocusLevel2Text",
      itemKeys: [
        "aboutLevel2List1",
        "aboutLevel2List2",
        "itSupportLevel2SystemSupport",
        "itSupportLevel2WorkflowSupport",
        "itSupportLevel2RootCause",
        "aboutLevel2List5",
      ],
    },
    escalation: {
      eyebrowKey: "itSupportFocusEscalationEyebrow",
      titleKey: "itSupportFocusEscalationTab",
      textKey: "itSupportFocusEscalationText",
      itemKeys: [
        "itSupportFocusEscalationItem1",
        "itSupportFocusEscalationItem2",
        "itSupportFocusEscalationItem3",
        "itSupportFocusEscalationItem4",
        "itSupportFocusEscalationItem5",
        "itSupportFocusEscalationItem6",
      ],
    },
  };

  const focusDisplay = document.querySelector(".it-focus-display");
  const focusTabs = Array.from(document.querySelectorAll(".it-focus-tab"));

  if (!focusDisplay || focusTabs.length === 0) return;

  function translate(key) {
    return window.I18N?.t ? window.I18N.t(key) : key;
  }

  function getActiveFocusKey() {
    return (
      focusTabs.find((tab) => tab.classList.contains("is-active"))?.dataset
        .itFocus || "level1"
    );
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

  function renderFocus(key) {
    const data = focusData[key];
    if (!data) return;

    const eyebrow = makeElement("p", "eyebrow", translate(data.eyebrowKey));
    const title = makeElement("h3", "", translate(data.titleKey));
    const text = makeElement("p", "", translate(data.textKey));
    const list = makeElement("ul", "", "");

    data.itemKeys.forEach((itemKey) => {
      list.appendChild(makeElement("li", "", translate(itemKey)));
    });

    focusDisplay.replaceChildren(eyebrow, title, text, list);
  }

  focusTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const focusKey = tab.dataset.itFocus;
      if (!focusData[focusKey]) return;

      focusTabs.forEach((item) => {
        item.classList.remove("is-active");
        item.setAttribute("aria-selected", "false");
      });

      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      renderFocus(focusKey);
    });
  });

  window.addEventListener("language:changed", () => {
    renderFocus(getActiveFocusKey());
  });

  renderFocus(getActiveFocusKey());
})();
