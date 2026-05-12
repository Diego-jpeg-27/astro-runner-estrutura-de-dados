/* ======================================================= */
/* ASTRO RUNNER — MODO 2                                   */
/* Plataforma 2D com Canvas                                */
/* Integrado ao projeto principal (game.js + index.html)   */
/* ======================================================= */
'use strict';

/* ============================================================
   LISTA ENCADEADA (estrutura de dados do Modo 2)
   ============================================================ */

class Node2 {
  constructor(data) { 
    this.data = data; 
    this.next = null; }
}

class LinkedList2 {
  constructor() { this.head = null; this.tail = null; this.size = 0; }

  push(data) {
    const n = new Node2(data);
    if (!this.tail) { this.head = n; this.tail = n; }
    else            { this.tail.next = n; this.tail = n; }
    this.size++;
  }

  toArray() {
    const a = []; let c = this.head;
    while (c) { a.push(c.data); c = c.next; }
    return a;
  }

  // BUSCA — find percorre nó a nó
  find(predicate) {
    let cur = this.head;
    while (cur) {
      if (predicate(cur.data)) return cur.data;
      cur = cur.next;
    }
    return null;
  }

  // ALTERAÇÃO — updateWhere localiza e modifica
  updateWhere(predicate, transform) {
    let cur = this.head;
    while (cur) {
      if (predicate(cur.data)) { transform(cur.data); return true; }
      cur = cur.next;
    }
    return false;
  }

  get length() { return this.size; }
}

/* ============================================================
   IMAGENS DO MODO 2
   Carregadas aqui — os arquivos devem estar na mesma pasta
   ============================================================ */

   /* Mapa: id do capacete (tela de setup) → pasta do modo 2 */
const G2_HELMET_FOLDER = {
  'alien':             'alien 2',
  'space':             'space 2',
  'messi pescador':    'messi pescador 2',
  'chacal':            'chacal 2',
  'mergulho':          'mergulho 2',
  'samurai':           'samurai 2',
  'capacete de prata': 'capacete de prata 2',
};

function g2AvatarPath() {
  const folder = G2_HELMET_FOLDER[player.helmet] || 'alien 2';
  const color  = player.colorName || 'prata';
  return `avatar/${folder}/${color}.png`;
}

const G2_IMG = {
  astro:      new Image(),
  rocha:      new Image(),
  rochaFundo: new Image(),
  buraco:     new Image(),
  bau:        new Image(), 
  foguete:    new Image(), 
  bateria:    new Image(), 
  escudo:     new Image(), 
  sorte:      new Image()  
};

G2_IMG.rocha.src      = 'rocha espacial.png';
G2_IMG.rochaFundo.src = 'rocha espacial fundo.png';
G2_IMG.buraco.src     = 'buraco negro.png';
G2_IMG.bau.src        = 'bau.png';
G2_IMG.foguete.src    = 'foguete.png';
G2_IMG.bateria.src    = 'bateria.png';
G2_IMG.escudo.src     = 'escudo.png';
G2_IMG.sorte.src      = 'sorte.png';


/* ============================================================
   CONSTANTES FÍSICAS E DE GAMEPLAY
   ============================================================ */
const G2C = {
  GRAVITY:       0.52,
  JUMP_VY:      -13.5,
  DOUBLE_JUMP_VY:-11.0,
  SCROLL_BASE:   2.5,
  GROUND_H:      55,    // altura da faixa do chão na tela
  TILE_W:        36,
};

const G2_DIFF = {
  easy:   { label:'FÁCIL',   scrollMult:0.80, hazardChance:0.16, drain:0.016 },
  medium: { label:'MÉDIO',   scrollMult:1.00, hazardChance:0.30, drain:0.036 },
  hard:   { label:'DIFÍCIL', scrollMult:1.30, hazardChance:0.48, drain:0.062 },
};

/* ============================================================
   ESTADO GLOBAL DO MODO 2
   ============================================================ */
let g2State    = null;
let g2AnimId   = null;
let g2Canvas   = null;
let g2Ctx      = null;

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
function initMode2() {
  /* --- tela --- */
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-game2').classList.add('active');

  g2Canvas = document.getElementById('canvas-game2');
  g2Ctx    = g2Canvas.getContext('2d');
  g2Canvas.width  = g2Canvas.parentElement.clientWidth || window.innerWidth;
  g2Canvas.height = Math.min(window.innerHeight * 0.82, 580);
  window.addEventListener('resize', g2ResizeCanvas);
 // ── para música do modo 1 se estiver tocando ──
  const m1 = document.getElementById('audio-game1');
  if (m1) { m1.pause(); m1.currentTime = 0; }

  // ── música modo 2 ──
  const m2 = document.getElementById('audio-game2');
  if (m2) { m2.currentTime = 0; m2.volume = 0.4; m2.play().catch(()=>{}); }

  /* --- lê configurações do jogador (objeto global do game.js) --- */
  const pName   = (player.name   || 'ASTRO-01').toUpperCase();
  const pColor  = player.color   || '#4fc3f7';
  const pHelmet = player.helmet  || 'standard';
  const pDiff   = player.difficulty || 'easy';
  const dcfg    = G2_DIFF[pDiff] || G2_DIFF.easy;

  const W = g2Canvas.width;
  const H = g2Canvas.height;
  const groundY = H - G2C.GROUND_H;  // Y onde começa o chão

  /* --- plataformas (rochas espaciais) iniciais --- */

  // Criação das listas ANTES do g2State
  const platforms = new LinkedList2();
  let nextPlatX = 280;
  for (let i = 0; i < 22; i++) {
    nextPlatX = g2GenPlatform(platforms, nextPlatX, groundY, dcfg);
  }

  /* --- itens sobre as plataformas --- */
  const items = new LinkedList2();
  g2SeedItems(items, platforms.toArray(), dcfg);

  /* --- rochas de fundo decorativas --- */
  const bgRocks = g2BuildBgRocks(W, H);

  /* --- estrelas --- */
  const stars = g2BuildStars(W, H);

  /* --- poeira espacial --- */
  const dust = g2BuildDust(W, H);

  /* --- estado principal --- */
 
  g2State = { 
  
  /* jogador */
  
    player: {
    name:      pName,
    color:     pColor,
    helmet:    pHelmet,
    x: 170, y: groundY - 72,
    w: 44,  h: 70,
    vx: 0,  vy: 0,
    onGround:   false,
    jumpsLeft:  2,
    hasTurbo:   false,
    hasShield:  false,
    shieldTimer:0,
    energy:     100,
    luck:       1.0,
    alive:      true,
    facingRight:true,
    animTick:   0,
  },
  /* estado do baú (roleta) */
  chestActive: false,
  chestTimer: 0,
  chestIndex: 0,
  chestItems: ['battery', 'shield', 'turbo', 'battery', 'sorte'],
  /* mundo */
  diff:      pDiff,
  dcfg,
  scroll:    G2C.SCROLL_BASE * dcfg.scrollMult,
  cam:       0,
  platforms,
  items,
  bgRocks,
  stars,
  dust,
  particles: [],
  history:   new LinkedList2(),
  /* stats */
  stats: {
    modules:  0,
    jumps:    0,
    energy:   0,
    shields:  0,
    startTime: Date.now(),
    time:     0,
  },
  keys: {},
  jumpPressed: false,
  tick: 0,
  paused: false,
  groundY,
  W, H,
};

  /* --- eventos de teclado --- */
  g2State._onKeyDown = (e) => {
    if (!g2State) return;
    g2State.keys[e.code] = true;
    if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && !g2State.jumpPressed) {
      e.preventDefault();
      g2State.jumpPressed = true;
      tryJump2();
    }
    if (e.code === 'KeyP' || e.code === 'Escape') togglePause2();
  };
  g2State._onKeyUp = (e) => {
    if (!g2State) return;
    g2State.keys[e.code] = false;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW')
      g2State.jumpPressed = false;
  };
  document.addEventListener('keydown', g2State._onKeyDown);
  document.addEventListener('keyup',   g2State._onKeyUp);

  /* --- botões da UI --- */
  const btnPause = document.getElementById('btn-g2-pause');
  const btnQuit  = document.getElementById('btn-g2-quit');
  if (btnPause) btnPause.onclick = togglePause2;
  if (btnQuit)  btnQuit.onclick  = () => g2EndGame('Encerrou manualmente', true);

  /* --- inicia loop --- */
  if (g2AnimId) cancelAnimationFrame(g2AnimId);
  g2Loop();
}

/* --- redimensiona canvas proporcionalmente --- */
function g2ResizeCanvas() {
  if (!g2Canvas) return;
  const parent = g2Canvas.parentElement;
  g2Canvas.width  = parent ? parent.clientWidth : window.innerWidth;
  g2Canvas.height = Math.min(Math.round(window.innerHeight * 0.80), 570);
}

/* ============================================================
   GERAÇÃO DE PLATAFORMAS (rochas espaciais)
   Retorna o X da próxima plataforma
   ============================================================ */
function g2GenPlatform(list, startX, groundY, dcfg) {
  /* varia tamanhos: pequenas, médias, grandes */
  const sizes = [
    { w: 62,  h: 52  },
    { w: 88,  h: 70  },
    { w: 115, h: 90  },
    { w: 50,  h: 42  },
    { w: 140, h: 108 },
  ];
  const sz = sizes[Math.floor(Math.random() * sizes.length)];

  /* posição vertical: chão ou flutuando */
  const onGround = Math.random() < 0.42;
  const y = onGround
    ? groundY - sz.h + 4
    : groundY - sz.h - 70 - Math.random() * 180;

  list.push({ x: startX, y, w: sz.w, h: sz.h });

  const gap = 55 + Math.random() * 105;
  return startX + sz.w + gap;
}

/* --- gera itens sobre as plataformas já existentes --- */
function g2SeedItems(itemsList, plats, dcfg) {
  for (const plat of plats) {
    if (Math.random() > 0.65) continue;
    const ix = plat.x + plat.w / 2 - 14;
    const iy = plat.y - 36;
    g2SpawnItem(itemsList, ix, iy, dcfg);
  }
}

function g2SpawnItem(list, x, y, dcfg) {
  const r = Math.random();
  let type;
  if      (r < dcfg.hazardChance * 0.22)  type = 'blackhole';
  else if (r < dcfg.hazardChance * 0.55)  type = 'fire';
  else if (r < dcfg.hazardChance * 0.68)  type = 'turbo';
  else if (r < dcfg.hazardChance * 0.80)  type = 'shield';
  else if (r < dcfg.hazardChance + 0.16)  type = 'battery';
  else if (r < dcfg.hazardChance + 0.20)  type = 'chest';
  else return;
  list.push({ x, y, type, collected: false, phase: Math.random() * Math.PI * 2 });
}

/* ============================================================
   ROCHAS DE FUNDO DECORATIVAS
   ============================================================ */
function g2BuildBgRocks(W, H) {
  const rocks = [];
  for (let i = 0; i < 9; i++) {
    rocks.push({
      x:        Math.random() * W * 2.5,
      y:        30 + Math.random() * (H * 0.65),
      scale:    0.18 + Math.random() * 0.28,   // menores que as plataformas
      scrollSp: 0.35 + Math.random() * 0.50,   // mais lentas (parallax)
      angle:    Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.006,
      opacity:  0.12 + Math.random() * 0.18,
    });
  }
  return rocks;
}

/* ============================================================
   ESTRELAS (parallax)
   ============================================================ */
function g2BuildStars(W, H) {
  const s = [];
  for (let i = 0; i < 200; i++) {
    s.push({
      x:   Math.random() * W * 3,
      y:   Math.random() * H,
      r:   Math.random() < 0.06 ? 2 : 1,
      sp:  0.05 + Math.random() * 0.22,
      op:  0.25 + Math.random() * 0.65,
    });
  }
  return s;
}

/* ============================================================
   POEIRA ESPACIAL (move-se CONTRA o sentido do scroll)
   ============================================================ */
function g2BuildDust(W, H) {
  const d = [];
  for (let i = 0; i < 55; i++) {
    d.push({
      x:    Math.random() * W,
      y:    Math.random() * H * 0.92,
      r:    0.8 + Math.random() * 2.2,
      speed:1.4 + Math.random() * 2.8,  // velocidade própria
      op:   0.08 + Math.random() * 0.22,
    });
  }
  return d;
}

/* ============================================================
   LOOP PRINCIPAL
   ============================================================ */
function g2Loop() {
  if (!g2State) return;
  if (!g2State.paused && g2State.player.alive) g2Update();
  g2Draw();
  g2AnimId = requestAnimationFrame(g2Loop);
}

/* ============================================================
   UPDATE
   ============================================================ */
  function g2Update() {
  const st = g2State;
  const p  = st.player;
  const W  = st.W;
  const H  = st.H;
  
  st.tick++; // IMPORTANTE: tem que estar aqui no topo!
  
  // SE O BAÚ ESTIVER ABERTO, CONGELA O JOGO INTEIRO
  if (st.chestActive) return;

  /* --- scroll automático do mundo --- */
  st.cam += st.scroll;
  
  // --- Lógica da Roleta do Baú ---
  if (st.chestActive) {
    st.chestTimer--; // Faz o tempo correr
    
    // Muda o ícone a cada 5 frames para dar efeito de giro
    if (st.tick % 5 === 0) {
      st.chestIndex = (st.chestIndex + 1) % st.chestItems.length;
    }

    // Quando o tempo acaba, entrega o prêmio e destrava o jogo
    if (st.chestTimer <= 0) {
      const finalItem = st.chestItems[st.chestIndex];
      st.chestActive = false; // DESPAUSA O JOGO
      
      // Chama a função de coleta para o item sorteado
      g2CollectItem({ type: finalItem, collected: false, phase: 0 });
    }
    return; // Enquanto o baú estiver ativo, não executa o resto (pausa o mundo)
  }

/* --- scroll automático do mundo --- */
  st.cam += st.scroll;

  /* --- input de movimento horizontal --- */
  const left  = st.keys['ArrowLeft']  || st.keys['KeyA'];
  const right = st.keys['ArrowRight'] || st.keys['KeyD'];

  const baseSpeed = st.scroll;
   if (left)       { p.vx = -2.5; p.facingRight = false; }
  else if (right) { p.vx =  2.5; p.facingRight = true;  }
  else            { p.vx *= 0.80; }

  /* --- física --- */
  p.vy += G2C.GRAVITY;
  p.x  += p.vx;
  p.y  += p.vy;

  /* --- limites da tela --- */
  const minX = st.cam + 60;
  const maxX = st.cam + W - p.w - 60;
  if (p.x < 60) p.x = 60;
  if (p.x > W - p.w - 60) p.x = W - p.w - 60;
  
  /* --- chão --- */
  p.onGround = false;
  if (p.y + p.h >= st.groundY) {
    p.y        = st.groundY - p.h;
    p.vy       = 0;
    p.onGround = true;
    p.jumpsLeft = 2; // ← Mudamos para sempre recarregar 2 pulos
  }

  /* --- colisão com plataformas (rochas) --- */
  for (const plat of st.platforms.toArray()) {
    const px = plat.x - st.cam;
    if (px + plat.w < -60 || px > W + 60) continue;

    const platTop  = plat.y + plat.h * 0.18;  
    const prevBot  = (p.y - p.vy) + p.h;
    const curBot   = p.y + p.h;

    if (p.vy >= 0 &&
        prevBot <= platTop + 5 &&
        curBot  >= platTop &&
        p.x + p.w > px + plat.w * 0.08 &&
        p.x        < px + plat.w * 0.92) {
      p.y        = platTop - p.h;
      p.vy       = 0;
      p.onGround = true;
      p.jumpsLeft = 2; // ← Mudamos para sempre recarregar 2 pulos na rocha também
    }
  }

  /* --- caiu no vácuo --- */
  if (p.y > H + 100) {
    g2EndGame('Caiu no vácuo espacial!');
    return;
  }

  /* --- coleta de itens --- */
  const IS = 30;
  for (const item of st.items.toArray()) {
    if (item.collected) continue;
    const ix = item.x - st.cam;
    const iy = item.y + Math.sin(st.tick * 0.05 + item.phase) * 6;
    if (p.x < ix + IS && p.x + p.w > ix &&
        p.y < iy + IS && p.y + p.h > iy) {
      g2CollectItem(item);
    }
  }

/* --- gera mais mundo à frente --- */
  const lastPlat = st.platforms.tail?.data;
  if (lastPlat && lastPlat.x - st.cam < W * 2.6) {
    let nx = lastPlat.x + lastPlat.w;
    for (let i = 0; i < 6; i++) {
      nx = g2GenPlatform(st.platforms, nx, st.groundY, st.dcfg);
    }
    const all = st.platforms.toArray();
    const recent = all.slice(-6);
    g2SeedItems(st.items, recent, st.dcfg);
    st.stats.modules += 6;

    /* remove entidades muito atrás da câmera - operação direta na lista */
    const cutoff = st.cam - 400;

    let curP = st.platforms.head;
    let prevP = null;
    while (curP) {
    if (curP.data.x + curP.data.w <= cutoff) {
    if (prevP) prevP.next = curP.next;      // desliga do nó anterior
    else       st.platforms.head = curP.next; // não há anterior: atualiza o head
    if (curP === st.platforms.tail)
      st.platforms.tail = prevP;            // atualiza o tail se necessário
    st.platforms.size--;
    curP = prevP ? prevP.next : st.platforms.head;
  } else {
    prevP = curP;
    curP  = curP.next;
  }
}

    let curI = st.items.head;
    let prevI = null;
    while (curI) {
      if (curI.data.x <= cutoff) {
        if (prevI) prevI.next = curI.next;
        else st.items.head = curI.next;
        if (curI === st.items.tail) st.items.tail = prevI;
        st.items.size--;
        curI = prevI ? prevI.next : st.items.head;
      } else {
        prevI = curI;
        curI = curI.next;
      }
    }
  }  

  /* --- shield decay --- */
  if (p.hasShield) {
    p.shieldTimer -= 1 / 60;
    if (p.shieldTimer <= 0) { p.hasShield = false; p.shieldTimer = 0; }
  }

  /* --- dreno de brilho da bateria --- */
  if (p.batteryGlow > 0) {
    p.batteryGlow--;
  }

  /* --- dreno de energia --- */
  p.energy = Math.max(0, p.energy - st.dcfg.drain);
  if (p.energy <= 0) { g2EndGame('Energia esgotada no espaço!'); return; }

  /* --- tempo --- */
  st.stats.time = Math.floor((Date.now() - st.stats.startTime) / 1000);

  /* --- animação do personagem --- */
  p.animTick++;

  /* --- poeira: move contra o scroll --- */
  for (const d of st.dust) {
    d.x -= d.speed + st.scroll * 0.55;
    if (d.x < -10) { d.x = W + 10; d.y = Math.random() * st.groundY * 0.92; }
  }

  /* --- rochas de fundo: scroll mais lento + rotação --- */
  for (const r of st.bgRocks) {
    r.x    -= st.scroll * r.scrollSp;
    r.angle += r.rotSpeed;
    if (r.x < -150) { r.x = W + 150; r.y = 30 + Math.random() * (st.groundY * 0.65); }
  }
/* --- partículas de pulo --- */
  // Trava de segurança: garante que particles seja sempre um array válido
  if (!Array.isArray(st.particles)) {
    st.particles = [];
  }

  // 1. Primeiro atualizamos a física das partículas
  for (const pt of st.particles) {
    pt.x  += pt.vx;
    pt.y  += pt.vy;
    pt.vy += 0.12;
    pt.life -= 0.04;
  }
  
  // 2. Depois removemos as que já desapareceram
  st.particles = st.particles.filter(pt => pt.life > 0);
}

/* ============================================================
   COLETA DE ITENS
   ============================================================ */
function g2CollectItem(item) {
  g2State.items.updateWhere(i => i === item, i => { i.collected = true; });
  const p  = g2State.player;
  const st = g2State;

  st.history.push({ type: item.type, tick: st.tick });

  switch (item.type) {
    case 'chest':
      st.chestActive = true; 
      abrirRoletaHTML(); 
      break;

    // === ITENS RECEBIDOS DO BAÚ ===
    case 'bau_aberto':
      let r = item.recompensa;
      if (r.id === 'bateria') {
        p.energy = Math.min(100, p.energy + (r.rarity==='rara'?50:r.rarity==='epica'?70:r.rarity==='lendaria'?100:30));
        p.batteryGlow = 60; // 60 frames = 1 segundo de brilho verde
        g2ShowMsg(`BATERIA ${r.desc.toUpperCase()}!`, r.color);
      } 
      else if (r.id === 'escudo') {
        p.hasShield = true;
        p.shieldTimer = (r.rarity==='normal'?6:r.rarity==='rara'?12:25);
        g2ShowMsg(`ESCUDO ${r.desc.toUpperCase()}!`, r.color);
      } 
      else if (r.id === 'turbo') {
        p.hasTurbo = true;
        p.vy = G2C.JUMP_VY * 0.7; // LANÇA O BONECO LÁ PARA CIMA (Super Pulo)
        g2ShowMsg('🚀 FOGUETE!', r.color);
      } 
      else if (r.id === 'sorte') {
        p.luck = (p.luck || 1) + 0.6; 
        g2ShowMsg('🍀 SORTE +', r.color);
      }
      break;

    // === ITENS SOLTOS NO MAPA ===
    case 'battery':
      p.energy = Math.min(100, p.energy + 30);
      p.batteryGlow = 60; // Ativa o contorno verde
      st.stats.energy++;
      g2ShowMsg('🔋 +30 ENERGIA!', '#00e676');
      break;

    case 'turbo':
      p.hasTurbo  = true;
      p.vy = G2C.JUMP_VY * 1.6; // LANÇA O BONECO LÁ PARA CIMA
      g2ShowMsg('🚀 FOGUETE!', '#ff9f43');
      break;

    case 'shield':
      p.hasShield   = true;
      p.shieldTimer = 8;
      st.stats.shields++;
      g2ShowMsg('🛡 ESCUDO 8s!', '#4fc3f7');
      break;

    // === INIMIGOS / OBSTÁCULOS ===
     case 'fire':
      if (p.hasShield) {
        p.hasShield = false; p.shieldTimer = 0;
        p.fireTimer = 90; // chamas mesmo com escudo (efeito visual)
        g2ShowMsg('🛡️ ESCUDO ABSORVEU!', '#4fc3f7');
      } else {
        p.energy = Math.max(0, p.energy - 25);
        p.fireTimer = 90; // 90 frames ≈ 1.5s de chamas no traje
        g2ShowMsg('🔥 DANO!', '#ff1744');
        if (p.energy <= 0) g2EndGame('Destruído pelo fogo!');
      }
      break;

    case 'blackhole':
      if (p.hasShield) {
        p.hasShield = false; p.shieldTimer = 0;
        g2ShowMsg('🌀 ESCUDO SALVOU!', '#4fc3f7');
      } else {
        g2EndGame('Sugado por um buraco negro!');
      }
      break;
  }
}

/* ============================================================
   MOTOR VISUAL DA ROLETA DO BAÚ (C/ IMAGENS, SORTE E RARIDADE)
   ============================================================ */
function gerarRecompensaBau(sorteMultiplicador) {
  const tipos = ['bateria', 'escudo', 'turbo', 'sorte'];
  const idSorteado = tipos[Math.floor(Math.random() * tipos.length)];

  // 1. ITENS SEM RARIDADE (Foguete e Sorte)
  if (idSorteado === 'turbo') {
    return { id: 'turbo', rarity: 'unico', color: '#ff9f43', desc: 'Item Único' };
  }
  if (idSorteado === 'sorte') {
    return { id: 'sorte', rarity: 'unico', color: '#9b59b6', desc: 'Especial' };
  }

  // 2. ITENS COM RARIDADE (Bateria e Escudo)
  let rarity = 'normal';
  let color = '#00e676'; 
  let nameDesc = 'Normal';

  // Sorteio de Raridade influenciado pela "Sorte" do jogador
  let rand = Math.random();
  let chanceLendaria = 0.05 * sorteMultiplicador;
  let chanceEpica    = 0.15 * sorteMultiplicador;
  let chanceRara     = 0.40 * sorteMultiplicador;

  if (rand < chanceLendaria) {
    rarity = 'lendaria'; color = '#ffd700'; nameDesc = 'Lendári' + (idSorteado==='bateria'?'a':'o');
  } else if (rand < chanceEpica) {
    rarity = 'epica'; color = '#9b59b6'; nameDesc = 'Épic' + (idSorteado==='bateria'?'a':'o');
  } else if (rand < chanceRara) {
    rarity = 'rara'; color = '#4fc3f7'; nameDesc = 'Rar' + (idSorteado==='bateria'?'a':'o');
  }

  return { id: idSorteado, rarity: rarity, color: color, desc: nameDesc };
}

function abrirRoletaHTML() {
  const overlay = document.getElementById('chest-overlay');
  const track = document.getElementById('chest-track');
  const resultText = document.getElementById('chest-result-text');
  const btn = document.getElementById('chest-btn-claim');

  overlay.classList.remove('chest-hidden');
  resultText.style.opacity = '0';
  btn.disabled = true;

  // Imagens reais em vez de emojis
  const imgMap = { bateria: 'bateria.png', escudo: 'escudo.png', turbo: 'foguete.png', sorte: 'sorte.png' };
  const titleMap = { bateria: 'Bateria', escudo: 'Escudo', turbo: 'Foguete', sorte: 'Sorte' };

  track.innerHTML = '';
  track.style.transition = 'none';
  track.style.transform = 'translateX(0px)';

  // Sorteia a recompensa REAL considerando a sorte do jogador
  const sorteAtual = g2State.player.luck || 1;
  const recompensaFinal = gerarRecompensaBau(sorteAtual);
  const winnerIndex = 20; 
  
  // Constrói o visual das caixinhas da roleta
  for (let i = 0; i < 25; i++) {
    let item = gerarRecompensaBau(sorteAtual);
    if (i === winnerIndex) item = recompensaFinal; // Garante o prêmio na parada

    const div = document.createElement('div');
    div.className = 'chest-item-box';
    div.style.border = `2px solid ${item.color}55`; // Borda com a cor da raridade
    
    div.innerHTML = `
      <img src="${imgMap[item.id]}" style="width:40px;height:40px;object-fit:contain;filter:drop-shadow(0 0 5px ${item.color}); border-radius:4px;" />
      <div class="chest-name" style="color:${item.color}; text-align:center;">
        ${titleMap[item.id]}<br><span style="font-size:9px;">${item.desc.toUpperCase()}</span>
      </div>
    `;
    track.appendChild(div);
  }

  track.getBoundingClientRect();
  const itemOffSet = 105;
  const targetX = winnerIndex * itemOffSet;

  track.style.transition = 'transform 3.5s cubic-bezier(0.15, 0.85, 0.35, 1)';
  track.style.transform = `translateX(-${targetX}px)`;

  setTimeout(() => {
    track.children[winnerIndex].classList.add('winner-highlight');
    track.children[winnerIndex].style.boxShadow = `0 0 25px ${recompensaFinal.color}88`;

    resultText.innerHTML = `✅ ${titleMap[recompensaFinal.id]} <strong>${recompensaFinal.desc}</strong>!`;
    resultText.style.color = recompensaFinal.color;
    resultText.style.opacity = '1';
    btn.disabled = false;

    btn.onclick = () => {
      overlay.classList.add('chest-hidden');
      g2State.chestActive = false;
      // Envia o prêmio complexo gerado para aplicar os atributos na gameplay
      g2CollectItem({ type: 'bau_aberto', recompensa: recompensaFinal, collected: false, phase: 0 });
    };
  }, 3600); 
}

/* ============================================================
   PULO
   ============================================================ */
function tryJump2() {
  if (!g2State || !g2State.player.alive || g2State.paused) return;
  const p = g2State.player;
  
  if (p.jumpsLeft > 0) {
    // Se ele não está no chão, significa que é o pulo duplo
    const isDouble = !p.onGround; 
    
    p.vy        = isDouble ? G2C.DOUBLE_JUMP_VY : G2C.JUMP_VY;
    p.jumpsLeft--;
    p.onGround  = false;
    g2State.stats.jumps++;
    g2SpawnJumpParticles(p.x + p.w / 2, p.y + p.h);
  }
}

function g2SpawnJumpParticles(x, y) {
  for (let i = 0; i < 8; i++) {
    g2State.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 5,
      vy: -Math.random() * 3 - 0.5,
      life: 1,
      color: g2State.player.color,
    });
  }
}

/* ============================================================
   PAUSA
   ============================================================ */
function togglePause2() {
  if (!g2State) return;
  g2State.paused = !g2State.paused;
  const btn = document.getElementById('btn-g2-pause');
  if (btn) btn.textContent = g2State.paused ? '▶ RETOMAR' : '⏸ PAUSAR';
}

/* ============================================================
   MENSAGEM FLUTUANTE
   ============================================================ */
function g2ShowMsg(txt, color) {
  const el = document.getElementById('g2-msg');
  if (!el) return;
  el.textContent      = txt;
  el.style.color      = color;
  el.style.borderColor = color + '55';
  el.classList.add('show');
  clearTimeout(window._g2MsgTimer);
  window._g2MsgTimer = setTimeout(() => el.classList.remove('show'), 2400);
}
/* ============================================================
   HUD (HEAD-UP DISPLAY) - BARRA SUPERIOR
   ============================================================ */
function g2DrawHUD(ctx, W, H, p, st) {
  ctx.save();

  /* fundo superior */
  ctx.fillStyle = 'rgba(1,2,10,0.88)';
  ctx.fillRect(0, 0, W, 46);
  ctx.strokeStyle = '#1a2358';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 46); ctx.lineTo(W, 46); ctx.stroke();

  ctx.font = '10px Orbitron, monospace';
  ctx.textBaseline = 'middle';

  /* nome do jogador */
  ctx.fillStyle = p.color;
  ctx.shadowBlur = 8; ctx.shadowColor = p.color;
  ctx.fillText('PLAYER: ' + p.name, 14, 13);
  ctx.shadowBlur = 0;

  /* energia */
  const ec = p.energy > 50 ? '#4fc3f7' : p.energy > 25 ? '#ff9f43' : '#ff1744';
  ctx.fillStyle = ec;
  ctx.fillText(`ENERGIA: ${Math.round(p.energy)}%`, 14, 31);

  /* barra de energia */
  const bx = 162, by = 26, bw = 88, bh = 7;
  ctx.fillStyle = '#0d1a3a';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = ec;
  ctx.shadowBlur = 5; ctx.shadowColor = ec;
  ctx.fillRect(bx, by, bw * (p.energy / 100), bh);
  ctx.shadowBlur = 0;

  /* módulos e tempo */
  ctx.fillStyle = '#c8d8ff';
  ctx.fillText(`MÓDULOS: ${st.stats.modules}`, 278, 13);
  ctx.fillStyle = '#5a6899';
  ctx.fillText(`TEMPO: ${st.stats.time}s`, 278, 31);

  /* Pulos e Sorte (Cantinho Direito) */
  ctx.textAlign = 'right';
  ctx.fillStyle = p.hasTurbo ? '#ff9f43' : '#5a6899';
  if (p.hasTurbo) { ctx.shadowBlur = 8; ctx.shadowColor = '#ff9f43'; }
  ctx.fillText(`Pulo Turbo: ${p.hasTurbo ? 'ON' : 'OFF'}`, W - 14, 13);
  ctx.shadowBlur = 0;

  // Mostra o multiplicador de sorte se for maior que 1
  if (p.luck > 1) {
    ctx.fillStyle = '#9b59b6'; // Roxo épico
    ctx.fillText(`🍀 Sorte x${p.luck.toFixed(1)}`, W - 14, 31);
  }

  /* escudo timer */
  if (p.hasShield) {
    ctx.fillStyle   = '#4fc3f7'; // Azul
    ctx.shadowBlur  = 10;
    ctx.shadowColor = '#4fc3f7';
    ctx.fillText(`🛡 ${Math.ceil(p.shieldTimer)}s`, W - 120, 22);
    ctx.shadowBlur = 0;
  }

  ctx.textAlign = 'left';
  ctx.restore();
}
/* ============================================================
   DRAW — FRAME COMPLETO
   ============================================================ */
function g2Draw() {
  if (!g2Ctx || !g2Canvas || !g2State) return;
  const ctx = g2Ctx;
  const st  = g2State;
  const W   = st.W;
  const H   = st.H;
  const t   = st.tick;

  ctx.clearRect(0, 0, W, H);

  /* ── fundo gradiente espacial ── */
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0,   '#010208');
  bgGrad.addColorStop(0.6, '#020a1f');
  bgGrad.addColorStop(1,   '#04101c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  /* ── estrelas (parallax, move com câmera) ── */
  for (const s of st.stars) {
    const sx = ((s.x - st.cam * s.sp) % W + W) % W;
    ctx.globalAlpha = s.op * (0.55 + 0.45 * Math.sin(t * 0.018 + s.x));
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* ── rochas de fundo (decorativas, giram, somem) ── */
  for (const r of st.bgRocks) {
    if (!G2_IMG.rochaFundo.complete) continue;
    const rw = 120 * r.scale;
    const rh = 120 * r.scale;
    ctx.save();
    ctx.globalAlpha = r.opacity ?? r.op ?? 0.15;
    ctx.translate(r.x, r.y);
    ctx.rotate(r.angle);
    ctx.drawImage(G2_IMG.rochaFundo, -rw / 2, -rh / 2, rw, rh);
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  /* ── poeira espacial (contra o scroll) ── */
  for (const d of st.dust) {
    ctx.globalAlpha = d.op;
    ctx.fillStyle = '#7090b0';
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* ── chão ── */
  g2DrawGround(ctx, W, H, st.cam, t, st.groundY);

  /* ── plataformas (rochas principais) ── */
  for (const plat of st.platforms.toArray()) {
    const px = plat.x - st.cam;
    if (px + plat.w < -60 || px > W + 60) continue;
    g2DrawRock(ctx, px, plat.y, plat.w, plat.h);
  }

  /* ── itens ── */
  for (const item of st.items.toArray()) {
    if (item.collected) continue;
    const ix = item.x - st.cam;
    if (ix < -50 || ix > W + 50) continue;
    const iy = item.y + Math.sin(t * 0.05 + item.phase) * 6;
    g2DrawItem(ctx, ix, iy, item.type, t);
  }

  /* ── partículas de pulo ── */
  for (const pt of st.particles) {
    ctx.globalAlpha = Math.max(0, pt.life);
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    // CORREÇÃO AQUI: adicionado Math.max para evitar erro de Negative Radius
    ctx.arc(pt.x, pt.y, Math.max(0, 3 * pt.life), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* ── jogador ── */
  g2DrawPlayer(ctx, st.player, st.cam, t);

  /* ── borda neon do canvas ── */
  ctx.save();
  ctx.strokeStyle = '#4fc3f733';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 14;
  ctx.shadowColor = '#4fc3f744';
  ctx.strokeRect(1, 1, W - 2, H - 2);
  ctx.shadowBlur = 0;
  ctx.restore();

  /* ── HUD ── */
  g2DrawHUD(ctx, W, H, st.player, st);

  /* ── tela de pausa ── */
  if (st.paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.70)';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.font = 'bold 26px Orbitron, monospace';
    ctx.fillStyle = '#4fc3f7';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 18; ctx.shadowColor = '#4fc3f7';
    ctx.fillText('⏸  PAUSADO', W / 2, H / 2 - 8);
    ctx.font = '11px Orbitron, monospace';
    ctx.fillStyle = '#5a6899';
    ctx.shadowBlur = 0;
    ctx.fillText('Pressione P para continuar', W / 2, H / 2 + 22);
    ctx.textAlign = 'left';
    ctx.restore();
  }

  /* ── Interface da Roleta (Baú) ── */
  if (st.chestActive) {
    // Escurece o fundo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, W, H);

    const boxW = 200, boxH = 150;
    const bx = W / 2 - boxW / 2;
    const by = H / 2 - boxH / 2;

    // Moldura da "Caixa Registradora"
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.strokeRect(bx, by, boxW, boxH);
    ctx.fillStyle = '#0a1a3a';
    ctx.fillRect(bx, by, boxW, boxH);

    // Texto de Título
    ctx.font = 'bold 16px Orbitron';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText('SORTEANDO...', W / 2, by + 30);

    // O Item girando (Emoji)
    const currentType = st.chestItems[st.chestIndex];
    const icons = { battery: '🔋', shield: '🛡️', turbo: '🚀' };
    
    ctx.font = '60px Arial';
    ctx.fillText(icons[currentType] || '❓', W / 2, by + boxH / 2 + 20);

    // Barra de progresso da animação
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(bx + 10, by + boxH - 20, (st.chestTimer / 120) * (boxW - 20), 5);
    
    ctx.textAlign = 'left'; // Reset
  }
}

/* ============================================================
   CHÃO TEXTURIZADO
   ============================================================ */
function g2DrawGround(ctx, W, H, cam, t, groundY) {
  /* faixa inferior */
  const gg = ctx.createLinearGradient(0, groundY, 0, H);
  gg.addColorStop(0, '#0c1830');
  gg.addColorStop(1, '#040c1c');
  ctx.fillStyle = gg;
  ctx.fillRect(0, groundY, W, H - groundY);

  /* linha neon */
  ctx.save();
  ctx.strokeStyle = '#4fc3f7';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#4fc3f755';
  ctx.beginPath();
  ctx.moveTo(0, groundY); ctx.lineTo(W, groundY);
  ctx.stroke();
  ctx.restore();

  /* tiles alternados */
  const tw = G2C.TILE_W;
  const st = Math.floor(cam / tw);
  for (let i = st - 1; i < st + Math.ceil(W / tw) + 2; i++) {
    const tx = i * tw - cam;
    ctx.fillStyle = i % 2 === 0 ? '#0c1830' : '#071020';
    ctx.fillRect(tx, groundY + 3, tw - 1, 16);
    ctx.fillStyle = '#182d58';
    ctx.fillRect(tx + tw / 2 - 2, groundY + 8, 4, 4);
  }
}

/* ============================================================
   ROCHA ESPACIAL (plataforma)
   ============================================================ */
function g2DrawRock(ctx, x, y, w, h) {
  if (!G2_IMG.rocha.complete) {
    /* fallback: retângulo enquanto a imagem não carrega */
    ctx.fillStyle = '#3a3020';
    ctx.fillRect(x, y, w, h);
    return;
  }
  ctx.save();
  ctx.shadowBlur  = 16;
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.drawImage(G2_IMG.rocha, x, y, w, h);
  ctx.restore();
}

/* ============================================================
   ITENS / HAZARDS NO MAPA
   ============================================================ */
function g2DrawItem(ctx, x, y, type, t) {
  const S = 30;
  const pulse = 0.82 + 0.18 * Math.sin(t * 0.10);

  ctx.save();
  ctx.translate(x + S / 2, y + S / 2);

  if (type === 'blackhole') {
    ctx.rotate(t * 0.038);
    ctx.shadowBlur  = 28;
    ctx.shadowColor = '#9b59b6';
    if (G2_IMG.buraco.complete) {
      ctx.drawImage(G2_IMG.buraco, -S * 1.3, -S * 1.3, S * 2.6, S * 2.6);
    } else {
      ctx.fillStyle = '#9b59b6';
      ctx.beginPath(); ctx.arc(0, 0, S * 0.7, 0, Math.PI * 2); ctx.fill();
    }
  } else if (type === 'chest') {
    // DESENHA O BAÚ
    ctx.scale(pulse, pulse);
    ctx.shadowBlur = 20; ctx.shadowColor = '#ffd700';
    if (G2_IMG.bau.complete) {
      ctx.drawImage(G2_IMG.bau, -S, -S, S*2, S*2);
    } else {
      ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('📦', 0, 0);
    }
  } else {
    // ITENS SOLTOS NO MAPA (Bateria, Escudo, Foguete, Fogo)
    ctx.scale(pulse, pulse);
    
    if (type === 'fire') {
      ctx.shadowBlur = 15; ctx.shadowColor = '#ff1744';
      ctx.font = '28px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🔥', 0, 0);
    } 
    else if (type === 'battery' && G2_IMG.bateria.complete) {
      ctx.shadowBlur = 15; ctx.shadowColor = '#00e676';
      ctx.drawImage(G2_IMG.bateria, -S*0.8, -S*0.8, S*1.6, S*1.6);
    } 
    else if (type === 'shield' && G2_IMG.escudo.complete) {
      ctx.shadowBlur = 15; ctx.shadowColor = '#4fc3f7';
      ctx.drawImage(G2_IMG.escudo, -S*0.8, -S*0.8, S*1.6, S*1.6);
    } 
    else if (type === 'turbo' && G2_IMG.foguete.complete) {
      ctx.shadowBlur = 15; ctx.shadowColor = '#ff9f43';
      ctx.drawImage(G2_IMG.foguete, -S*0.8, -S*0.8, S*1.6, S*1.6);
    } 
    else {
      // Caso a imagem ainda não tenha carregado, mostra o Emoji correspondente (e tira o ❓)
      ctx.shadowBlur = 15; ctx.shadowColor = '#ffffff';
      let ic = '❓';
      if (type === 'battery') ic = '🔋';
      if (type === 'shield') ic = '🛡️';
      if (type === 'turbo') ic = '🚀';
      ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic, 0, 0);
    }
  }

  ctx.restore();
}

/* ============================================================
   JOGADOR (usa imagem astro.png + efeitos)
   ============================================================ */
function g2DrawPlayer(ctx, p, cam, t) {
  const sx = p.x;
  const sy = p.y;

  ctx.save();

  G2_IMG.astro     = new Image();
G2_IMG.astro.src = g2AvatarPath();

  /* espelha quando vai para a esquerda */
  if (!p.facingRight) {
    ctx.translate(sx + p.w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(sx + p.w / 2), 0);
  }

  const bob = p.onGround ? Math.sin(t * 0.20) * 1.5 : 0;

  if (G2_IMG.astro.complete) {
    ctx.drawImage(G2_IMG.astro, sx - 8, sy + bob - 8, p.w + 18, p.h + 12);
  } else {
    /* fallback simples */
    ctx.fillStyle = p.color;
    ctx.fillRect(sx, sy, p.w, p.h);
  }

  ctx.restore();

  /* ── chama do jetpack ao pular ── */
  if (!p.onGround && p.vy < 0) {
    ctx.save();
    const fx  = sx + p.w / 2;
    const fy  = sy + p.h + 4;
    const flameH = 12 + Math.random() * 8;
    const fg  = ctx.createRadialGradient(fx, fy, 0, fx, fy, flameH);
    fg.addColorStop(0,   '#ffffff');
    fg.addColorStop(0.3, '#ff9f43');
    fg.addColorStop(1,   'rgba(255,100,0,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.ellipse(fx, fy + flameH * 0.4, 5, flameH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

   /* ── CONTORNO VERDE DA BATERIA  ── */
  if (p.batteryGlow > 0) {
    ctx.save();
    const alpha = p.batteryGlow / 60;
    ctx.strokeStyle = `rgba(0, 230, 118, ${alpha})`;
    ctx.lineWidth   = 3;
    ctx.shadowBlur  = 22;
    ctx.shadowColor = '#00e676';
    // Elipse que contorna o corpo do astronauta (igual ao escudo, mas verde)
    ctx.beginPath();
    ctx.ellipse(sx + p.w / 2, sy + p.h / 2, p.w * 0.88, p.h * 0.60, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /* ── escudo ao redor do jogador ── */
  if (p.hasShield) {
    ctx.save();
    const sp = 0.60 + 0.40 * Math.sin(t * 0.12);
    ctx.strokeStyle = `rgba(79, 195, 247, ${sp})`;
    ctx.lineWidth   = 3;
    ctx.shadowBlur  = 20;
    ctx.shadowColor = '#4fc3f7';
    ctx.beginPath();
    ctx.ellipse(sx + p.w / 2, sy + p.h / 2, p.w * 0.88, p.h * 0.60, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /* ── CHAMAS NO TRAJE (ao pegar fogo) ── */
  if (p.fireTimer > 0) {
    p.fireTimer--;
    const alpha = Math.min(1, p.fireTimer / 30); // fade out nos últimos 30 frames
    for (let i = 0; i < 5; i++) {
      const fx = sx + 4 + Math.random() * (p.w - 8);
      const fy = sy + Math.random() * p.h;
      const fh = 8 + Math.random() * 14;
      const fg = ctx.createLinearGradient(fx, fy, fx, fy - fh);
      fg.addColorStop(0,   `rgba(255, 50, 0, ${alpha})`);
      fg.addColorStop(0.5, `rgba(255, 160, 0, ${alpha * 0.7})`);
      fg.addColorStop(1,   `rgba(255, 220, 0, 0)`);
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.ellipse(fx, fy - fh * 0.4, 4 + Math.random() * 3, fh, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/* ============================================================
   HUD (HEAD-UP DISPLAY) - BARRA SUPERIOR
   ============================================================ */
function g2DrawHUD(ctx, W, H, p, st) {
  ctx.save();

  /* fundo superior */
  ctx.fillStyle = 'rgba(1,2,10,0.88)';
  ctx.fillRect(0, 0, W, 46);
  ctx.strokeStyle = '#1a2358';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 46); ctx.lineTo(W, 46); ctx.stroke();

  ctx.font = '10px Orbitron, monospace';
  ctx.textBaseline = 'middle';

  /* nome do jogador */
  ctx.fillStyle = p.color;
  ctx.shadowBlur = 8; ctx.shadowColor = p.color;
  ctx.fillText('PLAYER: ' + p.name, 14, 13);
  ctx.shadowBlur = 0;

  /* energia */
  const ec = p.energy > 50 ? '#4fc3f7' : p.energy > 25 ? '#ff9f43' : '#ff1744';
  ctx.fillStyle = ec;
  ctx.fillText(`ENERGIA: ${Math.round(p.energy)}%`, 14, 31);

  /* barra de energia */
  const bx = 162, by = 26, bw = 88, bh = 7;
  ctx.fillStyle = '#0d1a3a';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = ec;
  ctx.shadowBlur = 5; ctx.shadowColor = ec;
  ctx.fillRect(bx, by, bw * (p.energy / 100), bh);
  ctx.shadowBlur = 0;

  /* módulos e tempo */
  ctx.fillStyle = '#c8d8ff';
  ctx.fillText(`MÓDULOS: ${st.stats.modules}`, 278, 13);
  ctx.fillStyle = '#5a6899';
  ctx.fillText(`TEMPO: ${st.stats.time}s`, 278, 31);

  /* Pulos e Sorte (Cantinho Direito) */
  ctx.textAlign = 'right';
  ctx.fillStyle = p.hasTurbo ? '#ff9f43' : '#5a6899';
  if (p.hasTurbo) { ctx.shadowBlur = 8; ctx.shadowColor = '#ff9f43'; }
  ctx.fillText(`Pulo Turbo: ${p.hasTurbo ? 'ON' : 'OFF'}`, W - 14, 13);
  ctx.shadowBlur = 0;

  // Mostra o multiplicador de sorte se for maior que 1
  if (p.luck > 1) {
    ctx.fillStyle = '#9b59b6'; // Roxo épico
    ctx.fillText(`🍀 Sorte x${p.luck.toFixed(1)}`, W - 14, 31);
  }

  /* escudo timer */
  if (p.hasShield) {
    ctx.fillStyle   = '#4fc3f7'; // Azul
    ctx.shadowBlur  = 10;
    ctx.shadowColor = '#4fc3f7';
    ctx.fillText(`🛡 ${Math.ceil(p.shieldTimer)}s`, W - 120, 22);
    ctx.shadowBlur = 0;
  }

  ctx.textAlign = 'left';
  ctx.restore();
}
/* ============================================================
   FIM DE JOGO
   ============================================================ */
function g2EndGame(reason, manual) {
  if (!g2State || !g2State.player.alive) return;
  g2State.player.alive = false;

  if (g2AnimId) { cancelAnimationFrame(g2AnimId); g2AnimId = null; }

  /* remove listeners de teclado */
  if (g2State._onKeyDown) document.removeEventListener('keydown', g2State._onKeyDown);
  if (g2State._onKeyUp)   document.removeEventListener('keyup',   g2State._onKeyUp);

  const elapsed = Math.floor((Date.now() - g2State.stats.startTime) / 1000);

  /* salva no ranking compartilhado */
  // Entrada adicionada ao fim de cada partida
  const entry = {
    name:       g2State.player.name,
    color:      g2State.player.color,
    modules:    g2State.stats.modules,
    time:       elapsed,
    difficulty: G2_DIFF[g2State.diff]?.label || '—',
    date:       new Date().toLocaleDateString('pt-BR'),
    mode:       'MODO 2',
  };

  ranking.push(entry);
  // ordena por módulos percorridos
  bubbleSortRanking(ranking);   
  ranking = ranking.slice(0, 20);

  try { localStorage.setItem('astroRanking', JSON.stringify(ranking)); } catch (_) {}

  /* preenche tela de game over */
  const isManual = manual || reason.toLowerCase().includes('manual');
  const titleEl  = document.getElementById('g2-end-title');
  if (titleEl) titleEl.textContent = isManual ? '✓ MISSÃO ENCERRADA' : '💀 GAME OVER';

  const reasonEl = document.getElementById('g2-end-reason');
  if (reasonEl) reasonEl.textContent = reason.toUpperCase();

  const statsEl = document.getElementById('g2-end-stats');
  if (statsEl) {
    statsEl.innerHTML = [
      ['MÓDULOS PERCORRIDOS', g2State.stats.modules],
      ['SALTOS',              g2State.stats.jumps],
      ['ENERGIA COLETADA',    g2State.stats.energy],
      ['ESCUDOS USADOS',      g2State.stats.shields],
      ['TEMPO TOTAL',         elapsed + 's'],
      ['DIFICULDADE',         G2_DIFF[g2State.diff]?.label || '—'],
    ].map(([l, v]) => `
      <div class="stat-card">
        <div class="stat-card-label">${l}</div>
        <div class="stat-card-val">${v}</div>
      </div>`).join('');
  }

  /* histórico de itens coletados */
  const typeInfo = {
    battery:   { emoji: '🔋', color: '#00e676' },
    turbo:     { emoji: '🚀', color: '#ff9f43' },
    shield:    { emoji: '🛡️', color: '#ffd700' },
    chest:     { emoji: '📦', color: '#ffd700' },
    fire:      { emoji: '🔥', color: '#ff1744' },
    blackhole: { emoji: '🌀', color: '#9b59b6' },
  };
  const histEl = document.getElementById('g2-end-history');
  if (histEl) {
    const hist = g2State.history.toArray();
    histEl.innerHTML = hist.length
      ? hist.map(h => {
          const info = typeInfo[h.type] || { emoji: '?', color: '#5a6899' };
          return `<div class="hist-chip" style="border-color:${info.color}55" title="${h.type}">${info.emoji}</div>`;
        }).join('')
      : '<span style="color:#5a6899;font-size:.75rem;">Nenhum item coletado</span>';
  }

  /* botões da tela de fim */
  const btnRank   = document.getElementById('g2-btn-rank');
  const btnReplay = document.getElementById('g2-btn-replay');
  const btnMenu   = document.getElementById('g2-btn-menu');
  if (btnRank)   btnRank.onclick   = () => showScreen('screen-rank');
  if (btnReplay) btnReplay.onclick = () => showScreen('screen-setup');
  if (btnMenu)   btnMenu.onclick   = () => showScreen('screen-menu');

  g2State = null;
  showScreen('screen-game2-end');

  // para a música ao encerrar
  const m2 = document.getElementById('audio-game2');
  if (m2) { m2.pause(); m2.currentTime = 0; }
  
}