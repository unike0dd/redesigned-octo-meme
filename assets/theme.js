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
      const getThemeToggles = () =>
        document.querySelectorAll("#theme-toggle, [data-theme-toggle]");
      const getNextTheme = () =>
        this.current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;

      const updateThemeControls = () => {
        const nextTheme = getNextTheme();
        getThemeToggles().forEach((toggle) => {
          const isMobilePaletteToggle = toggle.dataset.themeToggle === "mobile";
          if (isMobilePaletteToggle) {
            toggle.textContent = nextTheme === THEME_LIGHT ? "SUN" : "Moon";
          } else {
            const key = nextTheme === THEME_DARK ? "darkTheme" : "lightTheme";
            const fallbackText = nextTheme === THEME_DARK ? "Dark" : "Light";
            toggle.textContent = window.I18N?.t ? window.I18N.t(key) : fallbackText;
          }
          toggle.setAttribute(
            "aria-label",
            nextTheme === THEME_DARK
              ? "Switch to dark theme"
              : "Switch to light theme",
          );
        });

        document.querySelectorAll("[data-theme-option]").forEach((option) => {
          const isActive = option.dataset.themeOption === this.current;
          option.setAttribute("aria-pressed", String(isActive));
          option.classList.toggle("theme-active", isActive);
        });
      };

      const toggle = document.getElementById("theme-toggle");
      if (toggle && toggle.dataset.themeToggleBound !== "true") {
        toggle.dataset.themeToggleBound = "true";
        toggle.addEventListener("click", () => {
          this.toggleTheme();
        });
      }

      document.querySelectorAll("[data-theme-option]").forEach((option) => {
        if (option.dataset.themeOptionBound === "true") return;

        option.dataset.themeOptionBound = "true";
        option.addEventListener("click", () => {
          this.setTheme(option.dataset.themeOption);
          window.dispatchEvent(
            new CustomEvent("theme:changed", { detail: { theme: this.current } }),
          );
        });
      });

      bindThemeControls();
      window.addEventListener("theme:changed", bindThemeControls);
      window.addEventListener("language:changed", bindThemeControls);
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
