/* ======================================================= */
/* lista encadeada manual (node e linkedlist)               */
/* ======================================================= */
'use strict';

class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  // INSERÇÃO
  append(data) {
    const node = new Node(data);
    if (!this.tail) { this.head = node; this.tail = node; }
    else { this.tail.next = node; this.tail = node; }
    this.size++;
    return node; 
  }

  // REMOÇÃO
  removeHead() {
    if (!this.head) return null;
    const data = this.head.data;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.size--;
    return data;
  }

  // BUSCA (peek nos N primeiros)
  peekN(n) {
    const arr = [];
    let cur = this.head, i = 0;
    while (cur && i < n) { arr.push(cur.data); cur = cur.next; i++; }
    return arr;
  }

  toArray() {
    const arr = [];
    let cur = this.head;
    while (cur) { arr.push(cur.data); cur = cur.next; }
    return arr;
  }
  get length() { return this.size; }
}

 function bubbleSortRanking(arr) {
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i].modules < arr[i + 1].modules) {
        const tmp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = tmp;
        swapped = true;
      }
    }
  } while (swapped);
  return arr;
}
/* ======================================================= */
/* configurações do jogo                                    */
/* ======================================================= */
const AVATAR_CONFIG = {
  helmets: [
    { id: 'alien', name: 'Alien' },
    { id: 'space', name: 'Space' },
    { id: 'messi pescador', name: 'Messi' },
    { id: 'chacal', name: 'Chacal' },
    { id: 'mergulho', name: 'Mergulho' },
    { id: 'samurai', name: 'Samurai' },
    { id: 'capacete de prata', name: 'Prata' }
  ],
  colors: [
    { id: 'preto', hex: '#1a1a1a' },
    { id: 'azul', hex: '#2196f3' },
    { id: 'verde', hex: '#4caf50' },
    { id: 'vermelho', hex: '#f44336' },
    { id: 'cinza', hex: '#9e9e9e' },
    { id: 'prata', hex: '#e0e0e0' },
    { id: 'laranja', hex: '#ff9800' }
  ]
};

const DIFFICULTIES = {
  easy:   { label: 'FÁCIL',   expFreq: .08, bhFreq: .03, energyDrain: .28, expDmg: 25, timerSec: 12 },
  medium: { label: 'MÉDIO',   expFreq: .17, bhFreq: .07, energyDrain: .65, expDmg: 45, timerSec:  8 },
  hard:   { label: 'DIFÍCIL', expFreq: .27, bhFreq: .13, energyDrain: 1.1, expDmg: 70, timerSec:  5 },
};

const MODULE_DEFS = {
  NORMAL:           { emoji: '🧱', label: 'Normal',           desc: 'Plataforma segura.',          color: '#2a3f60' },
  EXPLOSIVE:        { emoji: '💥', label: 'Módulo Explosivo',  desc: 'Faça um SUPER PULO!',          color: '#ff1744' },
  ENERGY_NORMAL:    { emoji: '🔋', label: 'Bateria Normal',    desc: '+25 energia',                  color: '#00e676', rarity: 'normal',    rl: 'NORMAL'    },
  ENERGY_RARE:      { emoji: '🔋', label: 'Bateria Rara',      desc: '+40 energia • % salto duplo',  color: '#448aff', rarity: 'rare',      rl: 'RARA'      },
  ENERGY_EPIC:      { emoji: '🔋', label: 'Bateria Épica',     desc: '+55 energia • super duplo',    color: '#e040fb', rarity: 'epic',      rl: 'ÉPICA'     },
  ENERGY_LEGENDARY: { emoji: '🔋', label: 'Bateria Lendária',  desc: '+80 energia • SUPER DUPLO!',   color: '#ffd700', rarity: 'legendary', rl: 'LENDÁRIA'  },
  SHIELD_NORMAL:    { emoji: '🛡', label: 'Escudo Normal',     desc: 'Imunidade temporária (5s)',    color: '#ffd700', rarity: 'normal',    rl: 'NORMAL'    },
  SHIELD_RARE:      { emoji: '🛡', label: 'Escudo Raro',       desc: 'Imunidade (10s) ou garantida', color: '#448aff', rarity: 'rare',      rl: 'RARO'      },
  SHIELD_EPIC:      { emoji: '🛡', label: 'Escudo Épico',      desc: 'Imunidade total garantida!',   color: '#e040fb', rarity: 'epic',      rl: 'ÉPICO'     },
  BLACK_HOLE:       { emoji: '🌀', label: 'Buraco Negro',      desc: 'FIM INSTANTÂNEO!',             color: '#9b59b6' },
  TURBO:            { emoji: '🚀', label: 'Módulo Turbo',      desc: 'Avança 3 módulos!',            color: '#ff9f43' },
  CHEST:            { emoji: '📦', label: 'Baú Espacial',      desc: 'Roleta de recompensas!',       color: '#ffd700' },
};

/* ======================================================= */
/* estado global do jogo                                    */
/* ======================================================= */
let player = { name: 'ASTRO-01', color: '#e0e0e0', colorName: 'prata', helmet: 'space', difficulty: 'easy' };
let gs = null;
let timerHandle = null;
let drainHandle = null;
let ranking = [];
try { ranking = JSON.parse(localStorage.getItem('astroRanking') || '[]'); } catch (_) {}

/* ======================================================= */
 /* construção do fundo espacial (com planetas e cometa)     */
 /* ======================================================= */
 function buildSpaceBg() {
   const bg = document.getElementById('space-bg');
   if (!bg) return;
   bg.innerHTML = '';
 
   // Nebulosas (igual ao novo código)
   const nebulaColors = ['#2a3f6088', '#3b2e5e88', '#1a4a3a88', '#1e2a5a88', '#2a2a4a88'];
   nebulaColors.forEach((c, i) => {
     const el = document.createElement('div');
     el.className = 'nebula';
     el.style.cssText = `width:${220 + i * 80}px;height:${160 + i * 60}px;
       left:${[5, 60, 30, 75, 15][i]}%;top:${[10, 20, 60, 70, 85][i]}%;
       background:${c};--dur:${14 + i * 3}s;animation-delay:${i * 2}s;`;
     bg.appendChild(el);
   });
 
   // Estrelas (igual ao novo código)
   for (let i = 0; i < 220; i++) {
     const el = document.createElement('div');
     el.className = 'star';
     const sz = Math.random() < .03 ? 3 : Math.random() < .1 ? 2 : 1;
     const col = Math.random() < .25 ? '#4fc3f7' : Math.random() < .15 ? '#ffd700' : '#fff';
     el.style.cssText = `width:${sz}px;height:${sz}px;
       left:${Math.random() * 100}%;top:${Math.random() * 100}%;
       background:${col};opacity:${.2 + Math.random() * .6};
       --dur:${1.5 + Math.random() * 4}s;`;
     bg.appendChild(el);
   }
 
   // Planeta: defina os caminhos reais das imagens do seu projeto
  const IMG_JUPITER = 'img/jupiter.png';
  const IMG_SATURNO = 'img/saturno.png';
  const IMG_TERRA   = 'img/terra.png';
  const IMG_MARTE   = 'img/marte.png';
  const IMG_URANO   = 'img/urano.png';
  const IMG_LUA     = 'img/lua.png';
  const IMG_SOL     = 'img/sol.png';

   const planetConfigs = [
     { src: IMG_JUPITER,  size: 90,  left: 82, top: 8,  dur: 38 },
     { src: IMG_SATURNO,  size: 75,  left: 5,  top: 18, dur: 44 },
     { src: IMG_TERRA,    size: 55,  left: 70, top: 70, dur: 50 },
     { src: IMG_MARTE,    size: 40,  left: 15, top: 72, dur: 35 },
     { src: IMG_URANO,    size: 35,  left: 90, top: 55, dur: 60 },
     { src: IMG_LUA,      size: 28,  left: 42, top: 85, dur: 55 },
     { src: IMG_SOL,      size: 70,  left: 3,  top: 72, dur: 70 },
   ];
   planetConfigs.forEach((p, i) => {
     const el = document.createElement('img');
     el.className = 'bg-planet';
     el.src = p.src;
     el.style.cssText = `width:${p.size}px;height:${p.size}px;
       left:${p.left}%;top:${p.top}%;
       object-fit:contain;opacity:.55;
       --dur:${p.dur}s;animation-delay:${i * 4}s;
       filter:drop-shadow(0 0 ${p.size * .15}px #4fc3f766);`;
     bg.appendChild(el);
   });
 
   // Cometa
   const IMG_COMETA = 'img/cometa.png';
   const spawnComet = () => {
     const el = document.createElement('img');
     el.className = 'bg-comet';
     el.src = IMG_COMETA;
     const sz = 50 + Math.random() * 60;
     const topPos = 5 + Math.random() * 55;
     const startX = window.innerWidth + 120;
     const travelX = window.innerWidth + 300;
     const travelY = travelX * 0.22;
     el.style.cssText = `width:${sz}px;height:auto;
       position:absolute;top:${topPos}%;left:0px;
       transform:rotate(215deg) translate(${startX}px,0);
       background:none;`;
     bg.appendChild(el);
     requestAnimationFrame(() => {
       requestAnimationFrame(() => {
         el.style.transition = `transform 18s linear, opacity 18s linear`;
         el.style.transform = `rotate(215deg) translate(${startX - travelX}px, ${travelY}px)`;
         el.style.opacity = '0.85';
       });
     });
     setTimeout(() => { el.style.opacity = '0'; }, 16000);
     setTimeout(() => el.remove(), 18200);
     setTimeout(spawnComet, 18000 + Math.random() * 14000);
   };
   setTimeout(spawnComet, 3000);
 }

/* ======================================================= */
/* configuração da tela de personalização (setup)           */
/* ======================================================= */
function buildSetupUI() {
  const helmetCont = document.getElementById('helmet-grid');
  const colorCont = document.getElementById('color-row');

  // Gerar Círculos de Capacetes
  if (helmetCont) {
    helmetCont.innerHTML = AVATAR_CONFIG.helmets.map(h => `
      <div class="helmet-circle ${player.helmet === h.id ? 'selected' : ''}" 
           onclick="selectHelmet('${h.id}')" data-helmet="${h.id}" title="${h.name}">
        <img src="avatar/icons/${h.id}.png" alt="${h.name}" onerror="this.src='https://via.placeholder.com/35'">
      </div>
    `).join('');
  }

  // Gerar Círculos de Cores
  if (colorCont) {
    colorCont.innerHTML = AVATAR_CONFIG.colors.map(c => `
      <div class="color-dot ${player.colorName === c.id ? 'selected' : ''}" 
           onclick="selectColor('${c.id}', '${c.hex}')" 
           style="background-color: ${c.hex}" data-color="${c.id}" title="${c.id}">
      </div>
    `).join('');
  }

  // Configurar cliques nas opções de dificuldade
  document.querySelectorAll('.diff-opt[data-diff]').forEach(opt => {
    opt.onclick = () => {
      document.querySelectorAll('.diff-opt[data-diff]').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      player.difficulty = opt.dataset.diff;
    };
  });
  
  updateAvatarPreview();
}

function selectHelmet(id) {
  player.helmet = id;
  document.querySelectorAll('.helmet-circle').forEach(el => 
    el.classList.toggle('selected', el.dataset.helmet === id));
  updateAvatarPreview();
}

function selectColor(id, hex) {
  player.colorName = id;
  player.color = hex;
  document.querySelectorAll('.color-dot').forEach(el => 
    el.classList.toggle('selected', el.dataset.color === id));
  updateAvatarPreview();
}

function updateAvatarPreview() {
  const img = document.getElementById('avatar-preview');
  if (!img) return;
  const path = `avatar/${player.helmet}/${player.colorName}.png`;
  img.src = path;
  
  if (!window.playerImg) window.playerImg = new Image();
  window.playerImg.src = path;
}

/* ======================================================= */
/* geração de módulos (distribuição conforme dificuldade)   */
/* ======================================================= */
function randomModuleType(diff) {
  const d = DIFFICULTIES[diff];
  const r = Math.random();
  const sr = Math.random();

  if (r < d.bhFreq)                         return 'BLACK_HOLE';
  if (r < d.bhFreq + d.expFreq)             return 'EXPLOSIVE';
  if (r < d.bhFreq + d.expFreq + .05)       return 'CHEST';
  if (r < d.bhFreq + d.expFreq + .10)       return 'TURBO';
  if (r < d.bhFreq + d.expFreq + .20) {
    if (sr < .50) return 'SHIELD_NORMAL';
    if (sr < .80) return 'SHIELD_RARE';
    return 'SHIELD_EPIC';
  }
  if (r < d.bhFreq + d.expFreq + .40) {
    if (sr < .45) return 'ENERGY_NORMAL';
    if (sr < .75) return 'ENERGY_RARE';
    if (sr < .92) return 'ENERGY_EPIC';
    return 'ENERGY_LEGENDARY';
  }
  return 'NORMAL';
}

function makeModule(diff) {
  return { type: randomModuleType(diff), visited: false, outcome: null };
}

/* ======================================================= */
/* renderização da fila de módulos (lista encadeada)        */
/* ======================================================= */
function renderQueue() {
  if (!gs) return;
  const visible = gs.modules.peekN(4);
  const qEl = document.getElementById('module-queue');
  qEl.innerHTML = '';

  visible.forEach((m, idx) => {
    const def = MODULE_DEFS[m.type];
    const isCur = idx === 0;
    const isFloat = m.type.startsWith('ENERGY') || m.type.startsWith('SHIELD') ||
                    m.type === 'CHEST' || m.type === 'TURBO';
    const rarityBadge = def.rarity
      ? `<span class="rbadge rb-${def.rarity}">${def.rl}</span>` : '';
    const qClass = isCur ? 'current' : `q${Math.min(idx, 3)}`;
    const floatClass = isFloat && !isCur ? 'float-ud' : '';

    const div = document.createElement('div');
    div.className = `mod-block t-${m.type} ${qClass}`;
    div.innerHTML = `
      <span class="cur-tag">▶ ATUAL</span>
      <div class="mod-icon"><span class="${floatClass}">${def.emoji}</span></div>
      <div class="mod-body">
        <div class="mod-name">${def.label}${rarityBadge}</div>
        <div class="mod-desc">${def.desc}</div>
      </div>`;
    qEl.appendChild(div);
  });
}

/* ======================================================= */
/* início do jogo (MODO 1)                                  */
/* ======================================================= */

  function startGame() {
  const nameInput = document.getElementById('player-name');
  if (nameInput) player.name = (nameInput.value.trim() || 'ASTRO-01').toUpperCase();

  // música 
  const m1 = document.getElementById('audio-game1');
  if (m1) { m1.currentTime = 0; m1.volume = 0.4; m1.play().catch(()=>{}); }

  gs = {
    modules: new LinkedList(),  // fila principal do jogo
    history: new LinkedList(),  // histórico da partida
    energy:   100,
    shield:   0,
    shieldRarity: null,
    stats: {
      total: 0, expAvoided: 0, expHit: 0, energyCollected: 0,
      shieldUsed: 0, superJumps: 0, ultraJumps: 0, nearDeath: 0,
      normalJumps: 0, doubleJumps: 0,
    },
    startTime: Date.now(),
    alive: true,
    timerSec: DIFFICULTIES[player.difficulty].timerSec,
    timerLeft: DIFFICULTIES[player.difficulty].timerSec,
  };

  // Preenche a fila inicial com 14 módulos
  for (let i = 0; i < 14; i++) 
    gs.modules.append(makeModule(player.difficulty));

  const gameAstro = document.getElementById('game-astronaut');
  if (gameAstro) {
    const path = `avatar/${player.helmet}/${player.colorName}.png`;
    gameAstro.innerHTML = `<img src="${path}" style="width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 0 10px rgba(255,255,255,0.2));" />`;
  }

  const diffLabel = DIFFICULTIES[player.difficulty].label;
  const _s = (id, v) => { const e = document.getElementById(id); if(e) e.textContent = v; };
  _s('game-difficulty-badge', diffLabel);
  _s('hud-diff', 'DIFIC.: ' + diffLabel);
  _s('hud-shield', '🛡 INATIVO');
  
  const shieldBadge = document.getElementById('game-shield-badge');
  if (shieldBadge) shieldBadge.style.display = 'none';

  showScreen('screen-game');
  renderQueue();
  updateHUD();
  startTimer();
  startEnergyDrain();
}

/* ======================================================= */
/* gerenciamento do timer                                   */
/* ======================================================= */
function startTimer() {
  clearInterval(timerHandle);
  gs.timerLeft = gs.timerSec;
  renderTimer();
  timerHandle = setInterval(() => {
    if (!gs || !gs.alive) { clearInterval(timerHandle); return; }
    gs.timerLeft--;
    renderTimer();
    if (gs.timerLeft <= 0) {
      clearInterval(timerHandle);
      showMsg('Tempo esgotado! Salto automático!', '#ff9800');
      doAction('jump');
    }
  }, 1000);
}

function renderTimer() {
  const numEl  = document.getElementById('timer-num');
  const ringEl = document.getElementById('ring-fill');
  if (!numEl || !ringEl) return;
  const pct   = gs.timerLeft / gs.timerSec;
  const circ  = 2 * Math.PI * 25;
  ringEl.style.strokeDashoffset = circ * (1 - pct);
  ringEl.style.stroke = pct > .5 ? '#4fc3f7' : pct > .25 ? '#ff9800' : '#ff1744';
  numEl.textContent  = gs.timerLeft;
  numEl.style.color  = pct > .5 ? '#fff' : pct > .25 ? '#ff9800' : '#ff1744';
}

/* ======================================================= */
/* drenagem contínua de energia                             */
/* ======================================================= */
function startEnergyDrain() {
  if (!gs || !gs.alive) return;
  const d = DIFFICULTIES[player.difficulty];
  gs.energy = Math.max(0, gs.energy - d.energyDrain);
  updateEnergyUI();

  if (gs.energy <= 0) {
    if (gs.shield > 0) {
      gs.stats.nearDeath++;
      gs.energy = 20;
      gs.shield = 0; gs.shieldRarity = null;
      updateShieldUI();
      showMsg('Energia zerada! Escudo absorveu!', '#ffd700');
    } else {
      endGame('Energia esgotada no espaço!');
      return;
    }
  }
  drainHandle = setTimeout(startEnergyDrain, 500);
}

function updateEnergyUI() {
  const fill = document.getElementById('energy-fill');
  const pct  = document.getElementById('energy-pct');
  if (!fill || !gs) return;
  const e = Math.max(0, Math.round(gs.energy));
  fill.style.width = e + '%';
  fill.style.background = e < 25 ? '#ff1744' : e < 50 ? '#ff9f43' : '#4fc3f7';
  fill.style.boxShadow  = e < 25 ? '0 0 6px #ff1744' : e < 50 ? '0 0 6px #ff9f43' : '0 0 6px #4fc3f7';
  if (pct) pct.textContent = e + '%';
  const segs = document.querySelectorAll('#vital-segs .dossier-seg');
  const vitalLabel = document.getElementById('vital-label');
  const active = e > 75 ? 4 : e > 50 ? 3 : e > 25 ? 2 : 1;
  segs.forEach((s, i) => s.classList.toggle('off', i >= active));
  if (vitalLabel) vitalLabel.textContent = e > 75 ? 'NOMINAL' : e > 50 ? 'ESTÁVEL' : e > 25 ? 'CRÍTICO' : 'PERIGO';
}

function updateShieldUI() {
  const badge = document.getElementById('game-shield-badge');
  if (!badge || !gs) return;
  if (gs.shield > 0) {
    badge.style.display = 'flex';
    badge.className = 'dossier-shield' +
      (gs.shieldRarity === 'rare' ? ' rare' : gs.shieldRarity === 'epic' ? ' epic' : '');
  } else {
    badge.style.display = 'none';
  }
  const shEl = document.getElementById('hud-shield');
  if (shEl) shEl.textContent = gs.shield > 0 ? `🛡 ${Math.ceil(gs.shield)}s` : '🛡 INATIVO';
}

function updateHUD() {
  if (!gs) return;
  document.getElementById('hud-modules').textContent = gs.stats.total;
  document.getElementById('hud-time').textContent    = Math.floor((Date.now() - gs.startTime) / 1000) + 's';
  document.getElementById('hud-avoided').textContent = gs.stats.expAvoided;
  document.getElementById('hud-jumps').textContent   = gs.stats.normalJumps + gs.stats.doubleJumps;
  document.getElementById('hud-super').textContent   = gs.stats.superJumps;
}

/* ======================================================= */
/* ações do jogador (saltos)                               */
/* ======================================================= */
function doAction(type) {
  if (!gs || !gs.alive) return;
  clearInterval(timerHandle);

  const m = gs.modules.head?.data;
  if (!m) return;

  gs.stats.total++;
  gs.history.append({ type: m.type, outcome: null });
  const histNode = gs.history.tail;

  animateCard(type);

  setTimeout(() => processModule(m, type, histNode), 320);
}

function animateCard(type) {
  const card = document.getElementById('game-card');
  card.classList.remove('do-jump', 'do-double', 'do-hit', 'do-explode');
  void card.offsetWidth;
  if (type === 'jump')   { card.classList.add('do-jump');   gs.stats.normalJumps++; }
  if (type === 'double') { card.classList.add('do-double'); gs.stats.doubleJumps++; }
  if (type === 'super')  { card.classList.add('do-double'); gs.stats.superJumps++;  }
}

function processModule(m, action, histNode) {
  if (!gs || !gs.alive) return;
  const outcome = resolveModule(m, action);
  if (histNode) histNode.data.outcome = outcome;

  gs.modules.removeHead();
  while (gs.modules.length < 14) gs.modules.append(makeModule(player.difficulty));

  renderQueue();
  updateHUD();
  if (gs.alive) startTimer();
}

/* ======================================================= */
/* resolução do módulo atual (lógica principal)             */
/* ======================================================= */
function resolveModule(m, action) {
  const diff = DIFFICULTIES[player.difficulty];

  switch (true) {

    case m.type === 'NORMAL':
      showMsg('Módulo seguro ✓', '#4fc3f7');
      return 'ok';

    case m.type === 'EXPLOSIVE': {
      if (action === 'super') {
        gs.stats.expAvoided++;
        gs.energy = Math.max(0, gs.energy - 12);
        updateEnergyUI();
        showMsg('💥 Explosivo evitado! Super Pulo! ✓', '#00e676');
        return 'evitado';
      }
      if (gs.shield > 0) {
        gs.stats.nearDeath++;
        gs.shield = 0; gs.shieldRarity = null;
        updateShieldUI();
        showMsg('💥 Escudo absorveu a explosão!', '#ffd700');
        return 'escudo';
      }
      triggerExplosion();
      gs.energy -= diff.expDmg;
      gs.stats.expHit++;
      const card = document.getElementById('game-card');
      card.classList.remove('do-explode'); void card.offsetWidth;
      card.classList.add('do-explode');
      showMsg(`💥 ATINGIDO! -${diff.expDmg} energia!`, '#ff1744');
      updateEnergyUI();
      if (gs.energy <= 0) { setTimeout(() => endGame('Destruído por explosão!'), 900); }
      return 'atingido';
    }

    case m.type.startsWith('ENERGY_'): {
      const gains = { ENERGY_NORMAL: 25, ENERGY_RARE: 40, ENERGY_EPIC: 55, ENERGY_LEGENDARY: 80 };
      const gain  = gains[m.type] || 25;
      gs.energy   = Math.min(100, gs.energy + gain);
      gs.stats.energyCollected++;
      updateEnergyUI();
      const msgs = {
        ENERGY_NORMAL:    ['🔋 Bateria Normal! +25 energia',            '#00e676'],
        ENERGY_RARE:      ['🔵 Bateria Rara! +40 energia',              '#448aff'],
        ENERGY_EPIC:      ['💜 Bateria Épica! +55 energia',             '#e040fb'],
        ENERGY_LEGENDARY: ['🌟 BATERIA LENDÁRIA! +80 energia!',         '#ffd700'],
      };
      const [txt, col] = msgs[m.type] || msgs.ENERGY_NORMAL;
      showMsg(txt, col);
      return 'coletado';
    }

    case m.type.startsWith('SHIELD_'): {
      const durs  = { SHIELD_NORMAL: 5, SHIELD_RARE: 10, SHIELD_EPIC: 9999 };
      const rars  = { SHIELD_NORMAL: 'normal', SHIELD_RARE: 'rare', SHIELD_EPIC: 'epic' };
      gs.shield       = durs[m.type] || 5;
      gs.shieldRarity = rars[m.type] || 'normal';
      gs.stats.shieldUsed++;
      updateShieldUI();
      const msgs = {
        SHIELD_NORMAL: ['🛡 Escudo Normal! 5s de proteção.',    '#ffd700'],
        SHIELD_RARE:   ['🔵 Escudo Raro! 10s de proteção!',     '#448aff'],
        SHIELD_EPIC:   ['💜 Escudo Épico! IMUNIDADE TOTAL!',    '#e040fb'],
      };
      const [txt, col] = msgs[m.type] || msgs.SHIELD_NORMAL;
      showMsg(txt, col);
      return 'escudo-ativado';
    }

    case m.type === 'BLACK_HOLE': {
      if (gs.shield > 0 && gs.shieldRarity === 'epic') {
        gs.shield = 0; gs.shieldRarity = null;
        updateShieldUI();
        gs.stats.nearDeath++;
        showMsg('🌀 Buraco Negro! Escudo épico te salvou!', '#e040fb');
        return 'escudo';
      }
      triggerBlackHole();
      return 'sugado';
    }

    case m.type === 'TURBO': {
      gs.stats.ultraJumps++;
      triggerTurbo();
      for (let i = 0; i < 3; i++) {
        if (gs.modules.head) {
          gs.stats.total++;
          gs.history.append({ type: gs.modules.head.data.type, outcome: 'turbo-skip' });
          gs.modules.removeHead();
          while (gs.modules.length < 14) gs.modules.append(makeModule(player.difficulty));
        }
      }
      return 'turbo';
    }

    case m.type === 'CHEST': {
      triggerChest();
      return 'bau';
    }

    default:
      return 'ok';
  }
}

/* ======================================================= */
/* efeitos visuais (explosão, buraco negro, turbo, baú)     */
/* ======================================================= */
function showMsg(txt, color = '#fff') {
  const el = document.getElementById('msg-popup');
  el.textContent   = txt;
  el.style.color   = color;
  el.style.borderColor = color + '44';
  el.classList.add('show');
  clearTimeout(window._msgT);
  window._msgT = setTimeout(() => el.classList.remove('show'), 2400);
}

function triggerExplosion() {
  const fx = document.getElementById('fx-explosion');
  fx.innerHTML = `
    <div class="exp-ring" style="position:absolute;top:50%;left:50%;width:80px;height:80px;
      border:3px solid #ff6d00;animation-delay:0s;"></div>
    <div class="exp-ring" style="position:absolute;top:50%;left:50%;width:50px;height:50px;
      border:3px solid #ff1744;animation-delay:.15s;"></div>
    <div class="exp-ring" style="position:absolute;top:50%;left:50%;width:30px;height:30px;
      border:3px solid #ffd700;animation-delay:.3s;"></div>`;
  fx.classList.add('open');
  setTimeout(() => fx.classList.remove('open'), 1200);
}

function triggerBlackHole() {
  if (!gs) return;
  clearInterval(timerHandle);
  clearTimeout(drainHandle);
  gs.alive = false;

  const fx = document.getElementById('fx-blackhole');
  fx.classList.add('open');
  const txt = document.getElementById('bh-text');
  const seq = ['GRAVIDADE IRRESISTÍVEL...', 'SUGADO PELO BURACO NEGRO...', 'ADEUS, ASTRONAUTA...', 'FIM DA MISSÃO.'];
  let i = 0;
  const interval = setInterval(() => {
    txt.textContent = seq[Math.min(i, seq.length - 1)];
    i++;
    if (i > seq.length) {
      clearInterval(interval);
      setTimeout(() => {
        fx.classList.remove('open');
        endGame('Sugado por um buraco negro!');
      }, 700);
    }
  }, 1100);
}

function triggerTurbo() {
  const fx = document.getElementById('fx-turbo');
  const inner = document.getElementById('turbo-inner');
  const path = `avatar/${player.helmet}/${player.colorName}.png`;
  
  inner.innerHTML = `<img src="${path}" style="width:120px;height:120px;object-fit:contain;filter:drop-shadow(0 0 15px #ff9f43);"/>` +
    `<div style="font-family:'Orbitron',monospace;font-size:.8rem;letter-spacing:.2em;color:#ffd700;margin-top:.5rem;">🚀 TURBO! +3</div>`;
  fx.classList.add('open');
  setTimeout(() => fx.classList.remove('open'), 2500);
}

const ROULETTE_PRIZES = [
  { emoji: '⚡', label: 'Bateria Épica',  fn: () => { gs.energy = Math.min(100, gs.energy + 55); gs.stats.energyCollected++; updateEnergyUI(); } },
  { emoji: '🛡', label: 'Escudo Épico',   fn: () => { gs.shield = 9999; gs.shieldRarity = 'epic'; gs.stats.shieldUsed++; updateShieldUI(); } },
  { emoji: '🚀', label: 'Ultra Salto',    fn: () => { gs.stats.ultraJumps++; } },
  { emoji: '🌟', label: 'Bateria Lend.',  fn: () => { gs.energy = 100; gs.stats.energyCollected++; updateEnergyUI(); } },
  { emoji: '🛡', label: 'Escudo Raro',    fn: () => { gs.shield = Math.max(gs.shield, 10); gs.shieldRarity = 'rare'; gs.stats.shieldUsed++; updateShieldUI(); } },
  { emoji: '⚡', label: 'Bateria Rara',   fn: () => { gs.energy = Math.min(100, gs.energy + 40); gs.stats.energyCollected++; updateEnergyUI(); } },
  { emoji: '🎯', label: 'Sorte++',        fn: () => { showMsg('🎯 Sorte aumentada!', '#ffd700'); } },
];

function triggerChest() {
  const fx = document.getElementById('fx-chest');
  const strip = document.getElementById('roulette-strip');
  const result = document.getElementById('chest-result');
  result.textContent = '';

  const all = [...ROULETTE_PRIZES, ...ROULETTE_PRIZES, ...ROULETTE_PRIZES];
  strip.innerHTML = all.map(p =>
    `<div class="roulette-item">${p.emoji}<span>${p.label}</span></div>`
  ).join('');

  fx.classList.add('open');
  const target = Math.floor(Math.random() * ROULETTE_PRIZES.length);
  const finalIdx = ROULETTE_PRIZES.length + target;
  const itemW = 72;
  let pos = 0;

  const step = () => {
    pos += 22;
    strip.style.transform = `translateX(-${pos}px)`;
    const cur = Math.floor(pos / itemW);
    if (cur >= finalIdx) {
      strip.style.transform = `translateX(-${finalIdx * itemW - 74}px)`;
      const won = ROULETTE_PRIZES[target];
      result.innerHTML = `<span style="color:#ffd700">${won.emoji} ${won.label}!</span>`;
      won.fn();
      setTimeout(() => {
        fx.classList.remove('open');
        showMsg(`📦 BAÚ: ${won.emoji} ${won.label}!`, '#ffd700');
      }, 2000);
      return;
    }
    const speed = pos < finalIdx * itemW * .7 ? 14 : pos < finalIdx * itemW * .9 ? 25 : 45;
    setTimeout(step, speed);
  };
  setTimeout(step, 300);
}

/* ======================================================= */
/* encerramento da partida e ranking                       */
/* ======================================================= */
function doQuit() {
  if (gs && gs.alive) endGame('Encerrou manualmente');
}

function endGame(reason) {
  if (!gs) return;
  gs.alive = false;
  clearInterval(timerHandle);
  clearTimeout(drainHandle);

  const m1 = document.getElementById('audio-game1');
  if (m1) { m1.pause(); m1.currentTime = 0; }

  const elapsed = Math.floor((Date.now() - gs.startTime) / 1000);

  const entry = {
    name: player.name, color: player.color,
    modules: gs.stats.total, time: elapsed,
    difficulty: DIFFICULTIES[player.difficulty].label,
    date: new Date().toLocaleDateString('pt-BR'),
  };
  ranking.push(entry);
  bubbleSortRanking(ranking);
  ranking = ranking.slice(0, 20);
  try { localStorage.setItem('astroRanking', JSON.stringify(ranking)); } catch (_) {}

  const isGameOver = !reason.includes('manual');
  document.getElementById('end-title').textContent = isGameOver ? '💀 GAME OVER' : '✓ MISSÃO ENCERRADA';
  document.getElementById('end-reason').textContent = reason.toUpperCase();

  const s = gs.stats;
  const items = [
    ['MÓDULOS PERCORRIDOS', s.total],
    ['EXPLOSIVOS EVITADOS', s.expAvoided],
    ['EXPLOSIVOS ATINGIDO', s.expHit],
    ['ENERGIA COLETADA',    s.energyCollected],
    ['ESCUDOS USADOS',      s.shieldUsed],
    ['TEMPO TOTAL',         elapsed + 's'],
    ['SUPER PULOS',         s.superJumps],
    ['ULTRA SALTOS',        s.ultraJumps],
    ['QUASE MORREU',        s.nearDeath],
    ['SALTOS NORMAIS',      s.normalJumps],
  ];
  document.getElementById('end-stats').innerHTML = items.map(([l, v]) =>
    `<div class="stat-card">
      <div class="sc-lbl">${l}</div>
      <div class="sc-val">${v}</div>
    </div>`
  ).join('');

  const hist = gs.history.toArray();
  
  document.getElementById('end-history').innerHTML = hist.map((h, i) => {
    const def = MODULE_DEFS[h.type];
    const oc  = h.outcome;
    const bg  = oc === 'atingido'       ? '#2a0505' :
                oc === 'evitado'        ? '#052a0a' :
                oc === 'coletado'       ? '#052a14' :
                oc === 'escudo-ativado' ? '#1a1300' :
                oc === 'escudo'         ? '#1a1000' : '#050d1a';
    return `<div class="hist-chip" style="background:${bg};border-color:${def.color}55"
      title="${def.label}: ${oc || 'ok'}">${def.emoji}</div>`;
  }).join('');

  showScreen('screen-end');
}

/* ======================================================= */
/* ranking (tabela)                                        */
/* ======================================================= */
function buildRanking() {
  const tbody = document.getElementById('rank-body');
  if (!ranking.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#12264a;padding:2rem;font-size:.75rem;">Nenhuma partida registrada ainda</td></tr>`;
    return;
  }
  tbody.innerHTML = ranking.slice(0, 10).map((r, i) => `
    <tr class="${r.name === player.name ? 'me' : ''}">
      <td class="rank-num">#${i + 1}</td>
      <td>
        <span class="rank-dot" style="background:${r.color}"></span>
        ${r.name}
      </td>
      <td>${r.modules}</td>
      <td>${r.time}s</td>
      <td style="font-size:.62rem;color:var(--dim)">${r.difficulty || '—'}</td>
    </tr>
  `).join('');
}

/* ======================================================= */
/* navegação entre telas                                   */
/* ======================================================= */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'screen-rank')  buildRanking();
  if (id === 'screen-setup') buildSetupUI();
}

/* ======================================================= */
/* teclado                                                */
/* ======================================================= */
document.addEventListener('keydown', e => {
  if (!gs || !gs.alive) return;
  if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); doAction('jump'); }
  if (e.key === 'd' || e.key === 'D') doAction('double');
  if (e.key === 's' || e.key === 'S') doAction('super');
  if (e.key === 'q' || e.key === 'Q') doQuit();
});

/* ======================================================= */
/* inicialização                                           */
/* ======================================================= */
window.addEventListener('DOMContentLoaded', () => {
  buildSpaceBg();
  buildSetupUI();
});