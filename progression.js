(function () {
  const STORAGE_KEY = 'pixelPartyShopData';
  const defaults = { points: 0, owned: ['classic'], equipped: 'classic' };

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return {
        points: Math.max(0, Number(saved?.points) || 0),
        owned: Array.isArray(saved?.owned) ? saved.owned : [...defaults.owned],
        equipped: saved?.equipped || defaults.equipped
      };
    } catch {
      return { ...defaults, owned: [...defaults.owned] };
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
  }

  function awardGamePoints(score) {
    const earned = Math.floor(Math.max(0, Number(score) || 0) / 1000);
    if (earned > 0) {
      const data = load();
      data.points += earned;
      save(data);
    }
    return earned;
  }

  const data = load();
  applyTheme(data.equipped);
  window.PixelPartyShop = { load, save, applyTheme, awardGamePoints };
})();
