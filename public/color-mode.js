/* Sets data-kb-theme before mount, as Kobalte's inline ColorModeScript does; the CSP blocks inline scripts. */
(function () {
  try {
    var key = "kb-color-mode";
    var stored = localStorage.getItem(key) || "system";
    var mode =
      stored === "system"
        ? matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : stored;
    document.documentElement.dataset.kbTheme = mode;
    document.documentElement.style.colorScheme = mode;
  } catch (e) {}
})();
