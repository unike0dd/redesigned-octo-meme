(function () {
  if (window.THEME?.init) {
    window.THEME.init();
    return;
  }

  const THEME_DARK = "dark";
  const THEME_LIGHT = "light";
  const STORAGE_KEY = "theme";

  function readClientCache(key) {
    try {
      return window.localStorage?.getItem(key) || "";
    } catch (error) {
      return "";
    }
  }

  function writeClientCache(key, value) {
    try {
      window.localStorage?.setItem(key, value);
      document.documentElement.dataset.preferenceCache = "localStorage";
    } catch (error) {
      document.documentElement.dataset.preferenceCache = "unavailable";
    }
  }

  const THEME = {
    current: readClientCache(STORAGE_KEY) || THEME_LIGHT,

    init() {
      this.current = readClientCache(STORAGE_KEY) || THEME_LIGHT;
      this.applyTheme();
      this.setupThemeToggle();
    },

    get isDark() {
      return this.current === THEME_DARK;
    },

    setTheme(theme) {
      if (![THEME_DARK, THEME_LIGHT].includes(theme)) return;
      this.current = theme;
      writeClientCache(STORAGE_KEY, theme);
      this.applyTheme();
    },

    toggleTheme() {
      const newTheme = this.current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
      this.setTheme(newTheme);
      window.dispatchEvent(
        new CustomEvent("theme:changed", { detail: { theme: newTheme } }),
      );
    },

    applyTheme() {
      const root = document.documentElement;
      if (this.isDark) {
        root.classList.add("dark-theme");
        root.setAttribute("data-theme", "dark");
      } else {
        root.classList.remove("dark-theme");
        root.setAttribute("data-theme", "light");
      }
    },

    setupThemeToggle() {
      const toggle = document.getElementById("theme-toggle");
      if (!toggle) return;

      const updateToggleText = () => {
        const key = this.current === THEME_LIGHT ? "darkTheme" : "lightTheme";
        const fallbackText = this.current === THEME_LIGHT ? "Dark" : "Light";
        toggle.textContent = window.I18N?.t ? window.I18N.t(key) : fallbackText;
      };

      updateToggleText();
      if (toggle.dataset.themeToggleBound === "true") return;

      toggle.dataset.themeToggleBound = "true";
      toggle.addEventListener("click", () => {
        this.toggleTheme();
        updateToggleText();
      });

      window.addEventListener("theme:changed", updateToggleText);
      window.addEventListener("language:changed", updateToggleText);
    },
  };

  // Global access
  window.THEME = THEME;

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => THEME.init());
  } else {
    THEME.init();
  }
})();
