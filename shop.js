const shopItems = [
  { id: 'classic', kind: 'theme', value: 'classic', name: 'Classic Neon', cost: 0, description: 'The original green arcade glow.' },
  { id: 'sunset', kind: 'theme', value: 'sunset', name: 'Pixel Sunset', cost: 3, description: 'Warm pink and orange after-hours colors.' },
  { id: 'ice', kind: 'theme', value: 'ice', name: 'Ice Arcade', cost: 5, description: 'Cool blue tones with a frosty glow.' },
  { id: 'galaxy', kind: 'theme', value: 'galaxy', name: 'Galaxy Mode', cost: 8, description: 'Deep purple with bright cosmic accents.' },
  { id: 'snake-green', kind: 'snakeColor', value: 'green', name: 'Neon Snake', cost: 0, description: 'The original bright green snake.' },
  { id: 'snake-blue', kind: 'snakeColor', value: 'blue', name: 'Blue Snake', cost: 2, description: 'A cool electric-blue snake.' },
  { id: 'snake-pink', kind: 'snakeColor', value: 'pink', name: 'Pink Snake', cost: 4, description: 'A bright bubblegum-pink snake.' },
  { id: 'food-pixel', kind: 'snakeFood', value: 'pixel', name: 'Pixel Food', cost: 0, description: 'The classic red food block.' },
  { id: 'food-apple', kind: 'snakeFood', value: 'apple', name: 'Apple Food', cost: 2, description: 'Feed your snake a tiny apple.' },
  { id: 'food-cherry', kind: 'snakeFood', value: 'cherry', name: 'Cherry Food', cost: 3, description: 'Replace food with juicy cherries.' },
  { id: 'food-star', kind: 'snakeFood', value: 'star', name: 'Star Food', cost: 5, description: 'Chase glowing stars around the board.' }
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
    const selectedValue = item.kind === 'theme' ? data.equipped : data[item.kind];
    const equipped = selectedValue === item.value;
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
      if (item.kind === 'theme') latest.equipped = item.value;
      else latest[item.kind] = item.value;
      PixelPartyShop.save(latest);
      if (item.kind === 'theme') PixelPartyShop.applyTheme(item.value);
      messageEl.textContent = `${item.name} is now equipped.`;
      renderShop();
    });
    card.appendChild(button);
    gridEl.appendChild(card);
  });
}

renderShop();
