(function () {
  const STORAGE_KEY = 'pixelPartyShopData';
  const defaults = {
    points: 0,
    owned: ['classic', 'snake-green', 'food-pixel'],
    equipped: 'classic',
    snakeColor: 'green',
    snakeFood: 'pixel'
  };

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return {
        points: Math.max(0, Number(saved?.points) || 0),
        owned: Array.isArray(saved?.owned)
          ? [...new Set([...defaults.owned, ...saved.owned])]
          : [...defaults.owned],
        equipped: saved?.equipped || defaults.equipped,
        snakeColor: saved?.snakeColor || defaults.snakeColor,
        snakeFood: saved?.snakeFood || defaults.snakeFood
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
    const earned = Math.floor(Math.max(0, Number(score) || 0) / 200);
    if (earned > 0) {
      const data = load();
      data.points += earned;
      save(data);
    }
    return earned;
  }

  const data = load();
  applyTheme(data.equipped);

  const gamePage = /\/(tetris|snake|2048)\.html$/i.test(window.location.pathname);
  if (gamePage) {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') event.preventDefault();
    }, { capture: true, passive: false });
  }

  window.PixelPartyShop = { load, save, applyTheme, awardGamePoints };
})();
