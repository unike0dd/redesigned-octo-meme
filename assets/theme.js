(function () {
  const THEME_DARK = "dark";
  const THEME_LIGHT = "light";
  const STORAGE_KEY = "theme";

  const THEME = {
    current: localStorage.getItem(STORAGE_KEY) || THEME_LIGHT,

    init() {
      this.current = localStorage.getItem(STORAGE_KEY) || THEME_LIGHT;
      this.applyTheme();
      this.setupThemeToggle();
    },

    get isDark() {
      return this.current === THEME_DARK;
    },

    setTheme(theme) {
      if (![THEME_DARK, THEME_LIGHT].includes(theme)) return;
      this.current = theme;
      localStorage.setItem(STORAGE_KEY, theme);
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
        toggle.textContent = this.current === THEME_LIGHT ? "Dark" : "Light";
      };

      updateToggleText();
      toggle.addEventListener("click", () => {
        this.toggleTheme();
        updateToggleText();
      });

      window.addEventListener("theme:changed", updateToggleText);
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
