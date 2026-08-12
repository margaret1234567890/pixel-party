const shopItems = [
  { id: 'classic', name: 'Classic Neon', cost: 0, description: 'The original green arcade glow.' },
  { id: 'sunset', name: 'Pixel Sunset', cost: 3, description: 'Warm pink and orange after-hours colors.' },
  { id: 'ice', name: 'Ice Arcade', cost: 5, description: 'Cool blue tones with a frosty glow.' },
  { id: 'galaxy', name: 'Galaxy Mode', cost: 8, description: 'Deep purple with bright cosmic accents.' }
];

const pointsEl = document.getElementById('shopPoints');
const gridEl = document.getElementById('shopGrid');
const messageEl = document.getElementById('shopMessage');

function renderShop() {
  const data = PixelPartyShop.load();
  pointsEl.textContent = data.points;
  gridEl.innerHTML = '';

  shopItems.forEach((item) => {
    const owned = data.owned.includes(item.id);
    const equipped = data.equipped === item.id;
    const card = document.createElement('article');
    card.className = `shop-item theme-preview theme-${item.id}`;
    card.innerHTML = `<h3>${item.name}</h3><p>${item.description}</p><p class="shop-price">${item.cost === 0 ? 'FREE' : `${item.cost} POINTS`}</p>`;
    const button = document.createElement('button');
    button.className = 'reset-btn';
    button.textContent = equipped ? 'EQUIPPED' : owned ? 'EQUIP' : 'BUY';
    button.disabled = equipped;
    button.addEventListener('click', () => {
      const latest = PixelPartyShop.load();
      if (!latest.owned.includes(item.id)) {
        if (latest.points < item.cost) {
          messageEl.textContent = `You need ${item.cost - latest.points} more point(s).`;
          return;
        }
        latest.points -= item.cost;
        latest.owned.push(item.id);
      }
      latest.equipped = item.id;
      PixelPartyShop.save(latest);
      PixelPartyShop.applyTheme(item.id);
      messageEl.textContent = `${item.name} is now equipped.`;
      renderShop();
    });
    card.appendChild(button);
    gridEl.appendChild(card);
  });
}

renderShop();
