(function () {
  const focusData = {
    level1: {
      eyebrow: "Front-line support",
      title: "Level I Support",
      text: "Structured first-contact assistance for user requests, ticket creation, basic troubleshooting, access help, and escalation coordination.",
      items: [
        "Help desk intake and ticket creation",
        "Basic troubleshooting",
        "End-user support",
        "Account access assistance",
        "Escalation coordination",
      ],
    },
    level2: {
      eyebrow: "Advanced ownership",
      title: "Level II Support",
      text: "Deeper technical coverage for advanced troubleshooting, incident review, system and workflow support, root-cause analysis, and post-escalation resolution.",
      items: [
        "Advanced troubleshooting",
        "Incident investigation",
        "System support",
        "Workflow support",
        "Root-cause analysis",
        "Resolution ownership after escalation",
      ],
    },
    escalation: {
      eyebrow: "Clear handoff",
      title: "Escalation Flow",
      text: "A disciplined escalation path that keeps issues visible, documented, prioritized, and owned until final closure.",
      items: [
        "Issue notes",
        "Priority tracking",
        "Escalation coordination",
        "Internal handoff",
        "Status communication",
        "Resolution closure",
      ],
    },
  };

  const focusDisplay = document.querySelector(".it-focus-display");
  const focusTabs = Array.from(document.querySelectorAll(".it-focus-tab"));

  if (!focusDisplay || focusTabs.length === 0) return;

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

    const eyebrow = makeElement("p", "eyebrow", data.eyebrow);
    const title = makeElement("h3", "", data.title);
    const text = makeElement("p", "", data.text);
    const list = makeElement("ul", "", "");

    data.items.forEach((item) => {
      list.appendChild(makeElement("li", "", item));
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

  renderFocus("level1");
})();
