/* ASTRO RUNNER — MODO 2                                   */

'use strict';

class Node2 {
  constructor(data) {
    this.data = data;
    this.next = null; // ponteiro para o próximo nó
  }
}

class LinkedList2 {
  constructor() {
    this.head = null; // primeiro nó da lista
    this.tail = null; // último nó da lista (para inserção O(1))
    this.size = 0;
  }

  /* INSERÇÃO — adiciona um novo nó no final da lista */
  push(data) {
    const n = new Node2(data);
    if (!this.tail) {
      this.head = n;
      this.tail = n;
    } else {
      this.tail.next = n;
      this.tail = n;
    }
    this.size++;
  }

  /* PERCURSO — converte a lista para array para iteração */
  toArray() {
    const resultado = [];
    let atual = this.head;
    while (atual) {
      resultado.push(atual.data);
      atual = atual.next;
    }
    return resultado;
  }

  /* BUSCA — percorre nó a nó procurando um elemento */
  find(predicado) {
    let atual = this.head;
    while (atual) {
      if (predicado(atual.data)) return atual.data;
      atual = atual.next;
    }
    return null;
  }

  /* ALTERAÇÃO — localiza e modifica um nó existente */
  updateWhere(predicado, transformacao) {
    let atual = this.head;
    while (atual) {
      if (predicado(atual.data)) {
        transformacao(atual.data);
        return true;
      }
      atual = atual.next;
    }
    return false;
  }

  /* remove nós que atendam à condição, percorrendo a lista sem usar filter() nativo */
  removeWhere(condicaoRemover) {
    let atual = this.head;
    let anterior = null;
    while (atual) {
      if (condicaoRemover(atual.data)) {
        if (anterior) anterior.next = atual.next;
        else          this.head     = atual.next;
        if (atual === this.tail) this.tail = anterior;
        this.size--;
        atual = anterior ? anterior.next : this.head;
      } else {
        anterior = atual;
        atual    = atual.next;
      }
    }
  }

  get length() { return this.size; }
}

/*  IMAGENS DO MODO 2 */

/* Mapa: id do capacete da tela de setup */
const G2_HELMET_FOLDER = {
  'alien':             'alien 2',
  'space':             'space 2',
  'messi pescador':    'messi pescador 2',
  'chacal':            'chacal 2',
  'mergulho':          'mergulho 2',
  'samurai':           'samurai 2',
  'capacete de prata': 'capacete de prata 2',
};

/* Retorna o caminho da imagem do avatar conforme configuração do jogador */
function g2AvatarPath() {
  const pasta = G2_HELMET_FOLDER[player.helmet] || 'alien 2';
  const cor   = player.colorName || 'prata';
  return `avatar/${pasta}/${cor}.png`;
}

/* Objeto com todas as imagens do modo 2 */
const G2_IMG = {
  astro:      new Image(),
  corredor:   new Image(), 
  plataforma: new Image(), 
  buraco:     new Image(), 
  bau:        new Image(),
  foguete:    new Image(),
  bateria:    new Image(),
  escudo:     new Image(),
  sorte:      new Image(),
  alerta:     new Image(), 
};

/* Carrega as imagens — adapte os nomes de arquivo conforme seu projeto */
G2_IMG.corredor.src   = 'img/corredor.png';
G2_IMG.plataforma.src = 'img/modulo estacao.png';
G2_IMG.buraco.src     = 'img/buraco negro.png';
G2_IMG.bau.src        = 'img/bau.png';
G2_IMG.foguete.src    = 'img/foguete.png';
G2_IMG.bateria.src    = 'img/bateria.png';
G2_IMG.escudo.src     = 'img/escudo.png';
G2_IMG.sorte.src      = 'img/sorte.png';
G2_IMG.alerta.src     = 'img/alerta.png';

/* rochas espaciais que passam ao fundo sem interação */
G2_IMG.rocha      = new Image();
G2_IMG.rochaFundo = new Image();
G2_IMG.rocha.src      = 'img/rocha_espacial.png';
G2_IMG.rochaFundo.src = 'img/rocha_espacial_fundo.png';

/* CONSTANTES DE FÍSICA E CONFIGURAÇÃO */
const G2C = {
  GRAVITY:        0.52,   // gravidade por frame
  JUMP_VY:       -13.5,   // velocidade do pulo simples
  DOUBLE_JUMP_VY:-11.0,   // velocidade do pulo duplo
  SCROLL_BASE:    3.2,    // velocidade base de scroll (fuga)
  GROUND_H:       55,     // altura da faixa do chão
  TILE_W:         48,     // largura dos tiles do corredor
};

/* Configurações de dificuldade */
const G2_DIFF = {
  easy:   { label: 'FÁCIL',   scrollMult: 0.85, hazardChance: 0.30, drain: 0.022 },
  medium: { label: 'MÉDIO',   scrollMult: 1.10, hazardChance: 0.50, drain: 0.045 },
  hard:   { label: 'DIFÍCIL', scrollMult: 1.45, hazardChance: 0.72, drain: 0.080 },
};

/* ESTADO GLOBAL DO MODO 2 */

let g2State  = null; // objeto com todo o estado da partida
let g2AnimId = null; // id do requestAnimationFrame
let g2Canvas = null; // elemento canvas
let g2Ctx    = null; // contexto 2D do canvas

/* INICIALIZAÇÃO DO MODO 2 - Configura canvas, lê dados do jogador, popula as listas
   encadeadas e inicia o loop de jogo. */

function initMode2() {

  /* --- ativa a tela do modo 2 --- */
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  document.getElementById('screen-game2').classList.add('active');

  /* --- configura o canvas --- */
  g2Canvas        = document.getElementById('canvas-game2');
  g2Ctx           = g2Canvas.getContext('2d');
  g2Canvas.width  = g2Canvas.parentElement.clientWidth || window.innerWidth;
  g2Canvas.height = Math.min(window.innerHeight * 0.82, 580);
  window.removeEventListener('resize', g2ResizeCanvas);
  window.addEventListener('resize', g2ResizeCanvas);

  /* --- áudio: para modo 1 e inicia modo 2 --- */
  var m1 = document.getElementById('audio-game1');
  if (m1) { m1.pause(); m1.currentTime = 0; }
  var m2 = document.getElementById('audio-game2');
  if (m2) { m2.currentTime = 0; m2.volume = 0.4; m2.play().catch(function(){}); }

  /* --- lê configurações do jogador (objeto global do game.js) --- */
  var pName   = (player.name       || 'ASTRO-01').toUpperCase();
  var pColor  =  player.color      || '#4fc3f7';
  var pHelmet =  player.helmet     || 'space';
  var pDiff   =  player.difficulty || 'easy';
  var dcfg    =  G2_DIFF[pDiff]    || G2_DIFF.easy;

  var W      = g2Canvas.width;
  var H      = g2Canvas.height;
  var groundY = H - G2C.GROUND_H; // posição Y do chão

  /* --- LISTA ENCADEADA: plataformas (módulos da estação) --- */
  var platforms = new LinkedList2();
  var nextX = 280;
  for (var i = 0; i < 22; i++) {
    nextX = g2GerarModulo(platforms, nextX, groundY, dcfg);
  }

  /* --- LISTA ENCADEADA: itens sobre as plataformas --- */
  var items = new LinkedList2();
  g2PopularItens(items, platforms.toArray(), dcfg);

  /* --- elementos decorativos do cenário de estação espacial --- */
  var tubulacoes  = g2ConstruirTubulacoes(W, H);
  var lampadas    = g2ConstruirLampadas(W, H);
  var detritos    = g2ConstruirDetritos(W, H);
  var rochasFundo = g2ConstruirRochasFundo(W, H); // rochas decorativas ao fundo

  /* --- estado principal do jogo --- */
  g2State = {

    /* jogador */
    player: {
      name:        pName,
      color:       pColor,
      helmet:      pHelmet,
      x: 170,      y: groundY - 72,
      w: 44,       h: 70,
      vx: 0,       vy: 0,
      onGround:    false,
      jumpsLeft:   2,
      hasTurbo:    false,
      hasShield:   false,
      shieldTimer:  0,
      shieldColor:  '#4fc3f7', // cor do escudo atual (muda conforme raridade)
      shieldRarity: 'normal',  // raridade do escudo ativo
      energy:      100,
      luck:        1.0,
      alive:       true,
      facingRight: true,
      animTick:    0,
      batteryGlow: 0,
      fireTimer:   0,
    },

    /* estado do baú */
    chestActive: false,
    chestTimer:  0,
    chestIndex:  0,
    chestItems:  ['battery', 'shield', 'turbo', 'battery', 'sorte'],

    /* mundo */
    diff:       pDiff,
    dcfg:       dcfg,
    scroll:     G2C.SCROLL_BASE * dcfg.scrollMult,
    cam:        0,
    platforms:  platforms,  // LinkedList2 — módulos da estação
    items:      items,      // LinkedList2 — itens e obstáculos
    tubulacoes:  tubulacoes,
    lampadas:    lampadas,
    detritos:    detritos,
    rochasFundo: rochasFundo, // rochas decorativas ao fundo (sem colisão)
    particles:  [],         // partículas de pulo (array simples — só visual)

    /* LISTA ENCADEADA: histórico de itens coletados */
    history: new LinkedList2(),

    /* estatísticas da partida */
    stats: {
      modules:   0,
      jumps:     0,
      energy:    0,
      shields:   0,
      startTime: Date.now(),
      time:      0,
    },

    /* controle */
    keys:        {},
    jumpPressed: false,
    tick:        0,
    paused:      false,
    groundY:     groundY,
    W:           W,
    H:           H,
  };

  /* --- eventos de teclado --- */
  g2State._onKeyDown = function(e) {
    if (!g2State) return;
    g2State.keys[e.code] = true;
    if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && !g2State.jumpPressed) {
      e.preventDefault();
      g2State.jumpPressed = true;
      tryJump2();
    }
    if (e.code === 'KeyP' || e.code === 'Escape') togglePause2();
  };

  g2State._onKeyUp = function(e) {
    if (!g2State) return;
    g2State.keys[e.code] = false;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      g2State.jumpPressed = false;
    }
  };

  document.addEventListener('keydown', g2State._onKeyDown);
  document.addEventListener('keyup',   g2State._onKeyUp);

  /* --- botões da interface --- */
  var btnPause = document.getElementById('btn-g2-pause');
  var btnQuit  = document.getElementById('btn-g2-quit');
  if (btnPause) btnPause.onclick = function() { togglePause2(); };
  if (btnQuit)  btnQuit.onclick  = function() { g2EndGame('Encerrou manualmente', true); };

  /* --- inicia o loop de animação --- */
  if (g2AnimId) cancelAnimationFrame(g2AnimId);
  g2Loop();
}

/* Redimensiona o canvas quando a janela muda de tamanho */
function g2ResizeCanvas() {
  if (!g2Canvas) return;
  var parent = g2Canvas.parentElement;
  g2Canvas.width  = parent ? parent.clientWidth : window.innerWidth;
  g2Canvas.height = Math.min(Math.round(window.innerHeight * 0.80), 570);
}

/* GERAÇÃO DO MUNDO — Módulos da Estação Espacial
   Os módulos são plataformas metálicas da estação em colapso.
   Inseridos na LinkedList2 conforme o jogador avança.*/

/* Gera um novo módulo e insere na lista. Retorna o X do próximo. */
function g2GerarModulo(lista, inicioX, groundY, dcfg) {

  /* tamanhos variados de módulos — passarelas e plataformas da estação */
  var tamanhos = [
    { w: 70,  h: 18 },  // passarela estreita
    { w: 110, h: 18 },  // módulo médio
    { w: 150, h: 18 },  // módulo grande
    { w: 55,  h: 18 },  // plataforma pequena — desafio de precisão
    { w: 190, h: 18 },  // corredor longo
  ];
  var sz = tamanhos[Math.floor(Math.random() * tamanhos.length)];

  /* SEMPRE elevado — o jogador deve pular para subir em cima.
     Varia entre passarelas baixas, médias e altas para criar
     dinamismo vertical sem nunca colar no chão do corredor. */
  var nivelAleatorio = Math.random();
  var y;
  if (nivelAleatorio < 0.40) {
    /* nível baixo — logo acima do chão, fácil de alcançar */
    y = groundY - sz.h - 55 - Math.random() * 40;
  } else if (nivelAleatorio < 0.75) {
    /* nível médio — requer pulo simples ou corrida */
    y = groundY - sz.h - 110 - Math.random() * 60;
  } else {
    /* nível alto — requer pulo duplo */
    y = groundY - sz.h - 185 - Math.random() * 60;
  }

  lista.push({
    x:          inicioX,
    y:          y,
    w:          sz.w,
    h:          sz.h,
    danificado: Math.random() < 0.28,
  });

  /* espaço entre módulos — mais curto para mais plataformas na tela */
  var espaco = 45 + Math.random() * 75;
  return inicioX + sz.w + espaco;
}

/* Popula itens sobre as plataformas — 80% de chance por plataforma,
   plataformas longas podem ter 2 itens para aumentar a densidade */
function g2PopularItens(listaItens, plataformas, dcfg, sorte) {
  for (var i = 0; i < plataformas.length; i++) {
    var plat = plataformas[i];
    if (Math.random() > 0.80) continue; // 80% de chance de ter item

    var ix = plat.x + plat.w / 2 - 14;
    var iy = plat.y - 36;
    g2SpawnItem(listaItens, ix, iy, dcfg, sorte);

    /* plataformas longas podem ter um segundo item */
    if (plat.w >= 110 && Math.random() < 0.50) {
      var ix2 = plat.x + plat.w * 0.75 - 14;
      g2SpawnItem(listaItens, ix2, iy, dcfg, sorte);
    }
  }
}

/* Cria um item e insere na lista de itens.
   Distribuição: muito mais fogo e buracos negros,
   bateria e baú bem mais raros. */
function g2SpawnItem(lista, x, y, dcfg, sorte) {
  var r    = Math.random();
  var tipo;
  /* sorte (padrão 1.0) aumenta o espaço de battery e chest proporcionalmente */
  var multiplicadorSorte = sorte || 1.0;
  var bonusBateria = 0.10 * multiplicadorSorte; // base 10%, cresce com sorte
  var bonusBau     = 0.04 * multiplicadorSorte; // base  4%, cresce com sorte

  if      (r < dcfg.hazardChance * 0.38) tipo = 'fire';
  else if (r < dcfg.hazardChance * 0.60) tipo = 'blackhole';
  else if (r < dcfg.hazardChance * 0.78) tipo = 'shield';
  else if (r < dcfg.hazardChance * 0.88) tipo = 'turbo';
  else if (r < dcfg.hazardChance + bonusBateria) tipo = 'battery';
  else if (r < dcfg.hazardChance + bonusBateria + bonusBau) tipo = 'chest';
  else return;

  lista.push({
    x:         x,
    y:         y,
    type:      tipo,
    collected: false,
    phase:     Math.random() * Math.PI * 2,
  });
}

/* GERAÇÃO DO CENÁRIO DE FUNDO */

/* Tubulações no fundo — pipes horizontais e verticais da estação */
function g2ConstruirTubulacoes(W, H) {
  var lista = [];
  for (var i = 0; i < 12; i++) {
    /* alterna entre tubulação horizontal (no teto) e vertical (nas paredes) */
    var horizontal = Math.random() < 0.6;
    lista.push({
      x:          Math.random() * W * 2.5,
      y:          horizontal
                    ? 8 + Math.random() * (H * 0.25)   // teto/topo
                    : Math.random() * H * 0.8,          // lateral
      w:          horizontal ? 80 + Math.random() * 160 : 12,
      h:          horizontal ? 12 : 60 + Math.random() * 100,
      horizontal: horizontal,
      scrollSp:   0.20 + Math.random() * 0.35,          // parallax mais lento
      cor:        Math.random() < 0.5 ? '#1a2d4a' : '#0d1f38',
      danificada: Math.random() < 0.25,                  // tubulação quebrada
    });
  }
  return lista;
}

/* Lâmpadas de emergência piscando — reforçam o alerta de colapso */
function g2ConstruirLampadas(W, H) {
  var lista = [];
  for (var i = 0; i < 8; i++) {
    lista.push({
      x:       100 + Math.random() * W * 2,
      y:       10 + Math.random() * 30,    // presas no teto
      scrollSp: 0.15 + Math.random() * 0.25,
      fase:    Math.random() * Math.PI * 2, // fase para piscar dessincronizado
      cor:     Math.random() < 0.7 ? '#ff1744' : '#ff9800', // vermelho ou laranja
    });
  }
  return lista;
}

/* Detritos voando — parafusos, chapas metálicas soltas */
function g2ConstruirDetritos(W, H) {
  var lista = [];
  for (var i = 0; i < 40; i++) {
    lista.push({
      x:      Math.random() * W,
      y:      Math.random() * H * 0.85,
      r:      1 + Math.random() * 3,           // tamanho do detrito
      velX:   -(1.0 + Math.random() * 2.2),    // move para a esquerda (fuga)
      velY:   (Math.random() - 0.5) * 0.8,     // leve variação vertical
      angulo: Math.random() * Math.PI * 2,
      giro:   (Math.random() - 0.5) * 0.08,    // velocidade de rotação
      op:     0.15 + Math.random() * 0.35,
    });
  }
  return lista;
}

/* ROCHAS ESPACIAIS DE FUNDO */

/* Cria lista de rochas */
function g2ConstruirRochasFundo(W, H) {
  var lista = [];
  for (var i = 0; i < 9; i++) {
    /* tamanho menor — ficam claramente ao fundo */
    var tamanho = 28 + Math.random() * 55;
    lista.push({
      x:        Math.random() * W * 2.0,
      y:        30 + Math.random() * (H * 0.68),
      tamanho:  tamanho,
      scrollSp: 0.05 + Math.random() * 0.10, // 5-15% da vel. do mundo
      angulo:   Math.random() * Math.PI * 2,
      giro:     (Math.random() - 0.5) * 0.004, // rotação lenta e visível
      op:       0.10 + Math.random() * 0.14,   // bem transparente
      imgIdx:   i % 2,                          // 0=rocha_espacial, 1=rocha_espacial_fundo
      yMin:     30,
      yRange:   H * 0.62,
    });
  }
  return lista;
}

/* Atualiza posição e rotação das rochas de fundo */
function g2AtualizarRochasFundo(rochas, scroll, W) {
  for (var i = 0; i < rochas.length; i++) {
    var r = rochas[i];
    r.x      -= scroll * r.scrollSp;
    r.angulo += r.giro;
    if (r.x < -r.tamanho) {
      r.x = W + r.tamanho;
      r.y = r.yMin + Math.random() * r.yRange;
    }
  }
}

/* Desenha as rochas decorativas — usa as duas imagens alternando */
function g2DesenharRochasFundo(ctx, rochas) {
  for (var i = 0; i < rochas.length; i++) {
    var r   = rochas[i];
    /* escolhe a imagem conforme imgIdx */
    var img = r.imgIdx === 0 ? G2_IMG.rocha : G2_IMG.rochaFundo;
    ctx.save();
    ctx.globalAlpha = r.op;
    ctx.translate(r.x, r.y);
    ctx.rotate(r.angulo);
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, -r.tamanho / 2, -r.tamanho / 2, r.tamanho, r.tamanho);
    } else {
      /* fallback geométrico enquanto imagem carrega */
      ctx.fillStyle = r.imgIdx === 0 ? '#7a6a50' : '#5a5a5a';
      ctx.beginPath();
      ctx.arc(0, 0, r.tamanho / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

/*LOOP PRINCIPAL */

function g2Loop() {
  if (!g2State) return;
  if (!g2State.paused && g2State.player.alive) g2Update();
  
  // Só redesenha se não estiver com o baú aberto
  if (!g2State.chestActive) g2Draw();
  
  cancelAnimationFrame(g2AnimId); 
  g2AnimId = requestAnimationFrame(g2Loop);
}

/* UPDATE — Lógica de jogo por frame*/

function g2Update() {
  var st = g2State;
  var p  = st.player;
  var W  = st.W;
  var H  = st.H;

  st.tick++;

  /* --- pausa se o baú estiver aberto --- */
  if (st.chestActive) return;

  /* --- scroll automático — o mundo se move para simular a fuga --- */
  st.cam += st.scroll;

  /* --- input de movimento horizontal --- */
  var esquerda = st.keys['ArrowLeft']  || st.keys['KeyA'];
  var direita  = st.keys['ArrowRight'] || st.keys['KeyD'];

  if (esquerda)      { p.vx = -2.5; p.facingRight = false; }
  else if (direita)  { p.vx =  2.5; p.facingRight = true;  }
  else               { p.vx *= 0.80; }

  /* --- física --- */
  p.vy += G2C.GRAVITY;
  p.x  += p.vx;
  p.y  += p.vy;

  /* --- limites horizontais da tela --- */
  if (p.x < 60)             p.x = 60;
  if (p.x > W - p.w - 60)  p.x = W - p.w - 60;

  /* --- colisão com o chão da estação --- */
  p.onGround = false;
  if (p.y + p.h >= st.groundY) {
    p.y         = st.groundY - p.h;
    p.vy        = 0;
    p.onGround  = true;
    p.jumpsLeft = 2;
  }

  /* --- colisão com módulos/plataformas (percorre a lista encadeada) --- */
  var curModulo = st.platforms.head;
  while (curModulo) {
    var plat = curModulo.data;
    var px   = plat.x - st.cam;

    /* ignora módulos fora da tela */
    if (px + plat.w >= -60 && px <= W + 60) {
      var topoModulo = plat.y;
      var rodapeAnt  = (p.y - p.vy) + p.h;
      var rodapeCur  = p.y + p.h;

      if (p.vy >= 0 &&
          rodapeAnt <= topoModulo + 5 &&
          rodapeCur >= topoModulo &&
          p.x + p.w > px + plat.w * 0.05 &&
          p.x       < px + plat.w * 0.95) {
        p.y         = topoModulo - p.h;
        p.vy        = 0;
        p.onGround  = true;
        p.jumpsLeft = 2;
      }
    }
    curModulo = curModulo.next;
  }

  /* --- verifica queda no vácuo --- */
  if (p.y > H + 100) {
    g2EndGame('Caiu no vácuo espacial!');
    return;
  }

  /* --- coleta de itens (percorre a lista encadeada) --- */
  var tamanhoItem = 30;
  var curItem = st.items.head;
  while (curItem) {
    var item = curItem.data;
    if (!item.collected) {
      var ix = item.x - st.cam;
      var iy = item.y + Math.sin(st.tick * 0.05 + item.phase) * 6;
      if (p.x < ix + tamanhoItem && p.x + p.w > ix &&
          p.y < iy + tamanhoItem && p.y + p.h > iy) {
        g2CollectItem(item);
      }
    }
    curItem = curItem.next;
  }

  /* --- gera mais módulos à frente conforme o jogador avança --- */
  var ultimoModulo = st.platforms.tail ? st.platforms.tail.data : null;
  if (ultimoModulo && ultimoModulo.x - st.cam < W * 2.6) {
    var nx = ultimoModulo.x + ultimoModulo.w;
    for (var i = 0; i < 6; i++) {
      nx = g2GerarModulo(st.platforms, nx, st.groundY, st.dcfg);
    }

    /* popula itens nos 6 novos módulos */
    var todosModulos = st.platforms.toArray();
    var novosModulos = [];
    for (var j = todosModulos.length - 6; j < todosModulos.length; j++) {
      novosModulos.push(todosModulos[j]);
    }
    g2PopularItens(st.items, novosModulos, st.dcfg, p.luck);
    st.stats.modules += 6;

    /* REMOÇÃO DIRETA NA LISTA — remove módulos e itens muito atrás da câmera
       sem usar filter() nativo — usa o método removeWhere da LinkedList2 */
    var corte = st.cam - 400;
    st.platforms.removeWhere(function(m) { return m.x + m.w <= corte; });
    st.items.removeWhere(function(it)    { return it.x      <= corte; });
  }

  /* --- decaimento do escudo --- */
  if (p.hasShield) {
    p.shieldTimer -= 1 / 60;
    if (p.shieldTimer <= 0) {
      p.hasShield  = false;
      p.shieldTimer = 0;
    }
  }

  /* --- decaimento do brilho da bateria --- */
  if (p.batteryGlow > 0) p.batteryGlow--;

  /* --- dreno contínuo de energia (suit de vida do astronauta) --- */
  p.energy = Math.max(0, p.energy - st.dcfg.drain);
  if (p.energy <= 0) {
    g2EndGame('Energia do traje esgotada!');
    return;
  }

  /* --- atualiza tempo --- */
  st.stats.time = Math.floor((Date.now() - st.stats.startTime) / 1000);

  /* --- animação do personagem --- */
  p.animTick++;

  /* --- atualiza detritos voando (cenário de colapso) --- */
  for (var d = 0; d < st.detritos.length; d++) {
    var det = st.detritos[d];
    det.x      += det.velX;
    det.y      += det.velY;
    det.angulo += det.giro;
    /* reposiciona detritos que saíram da tela pela esquerda */
    if (det.x < -20) {
      det.x = W + 20;
      det.y = Math.random() * st.groundY * 0.90;
    }
  }

  /* --- atualiza tubulações de fundo (parallax) --- */
  for (var t = 0; t < st.tubulacoes.length; t++) {
    st.tubulacoes[t].x -= st.scroll * st.tubulacoes[t].scrollSp;
    if (st.tubulacoes[t].x < -250) {
      st.tubulacoes[t].x = W + 250;
    }
  }

  /* --- atualiza lâmpadas de fundo (parallax) --- */
  for (var l = 0; l < st.lampadas.length; l++) {
    st.lampadas[l].x -= st.scroll * st.lampadas[l].scrollSp;
    if (st.lampadas[l].x < -30) {
      st.lampadas[l].x = W + 30;
    }
  }

  /* --- atualiza rochas decorativas de fundo (parallax lento + rotação) --- */
  g2AtualizarRochasFundo(st.rochasFundo, st.scroll, W);

  /* --- partículas de pulo: física manual --- */
  if (!Array.isArray(st.particles)) st.particles = [];
  for (var pt = 0; pt < st.particles.length; pt++) {
    st.particles[pt].x    += st.particles[pt].vx;
    st.particles[pt].y    += st.particles[pt].vy;
    st.particles[pt].vy   += 0.12;
    st.particles[pt].life -= 0.04;
  }
  /* remove partículas mortas — array simples, só visual, não é dado de jogo */
  var particulasVivas = [];
  for (var pv = 0; pv < st.particles.length; pv++) {
    if (st.particles[pv].life > 0) particulasVivas.push(st.particles[pv]);
  }
  st.particles = particulasVivas;
}

/* PULO */

function tryJump2() {
  if (!g2State || !g2State.player.alive || g2State.paused) return;
  var p = g2State.player;

  if (p.jumpsLeft > 0) {
    var eDuploPulo = !p.onGround;
    p.vy        = eDuploPulo ? G2C.DOUBLE_JUMP_VY : G2C.JUMP_VY;
    p.jumpsLeft--;
    p.onGround  = false;
    g2State.stats.jumps++;
    g2SpawnJumpParticles(p.x + p.w / 2, p.y + p.h);
  }
}

/* Cria partículas visuais no pulo */
function g2SpawnJumpParticles(x, y) {
  for (var i = 0; i < 8; i++) {
    g2State.particles.push({
      x:    x,
      y:    y,
      vx:   (Math.random() - 0.5) * 5,
      vy:  -Math.random() * 3 - 0.5,
      life: 1,
      color: g2State.player.color,
    });
  }
}

/* PAUSA */

function togglePause2() {
  if (!g2State) return;
  g2State.paused = !g2State.paused;
  var btn = document.getElementById('btn-g2-pause');
  if (btn) btn.textContent = g2State.paused ? '▶ RETOMAR' : '⏸ PAUSAR';
}

/* COLETA DE ITENS - Registra na lista encadeada de histórico (INSERÇÃO manual) */

function g2CollectItem(item) {
  /* ALTERAÇÃO direta no nó da lista — usa updateWhere */
  g2State.items.updateWhere(
    function(i) { return i === item; },
    function(i) { i.collected = true; }
  );

  var p  = g2State.player;
  var st = g2State;

  /* INSERÇÃO no histórico — lista encadeada */
  st.history.push({ type: item.type, tick: st.tick });

  switch (item.type) {

    case 'chest':
      st.chestActive = true;
      abrirRoletaHTML();
      break;

    case 'bau_aberto':
      var recomp = item.recompensa;
      if (recomp.id === 'bateria') {
        var ganho = recomp.rarity === 'rara'     ? 50 :
                    recomp.rarity === 'epica'    ? 70 :
                    recomp.rarity === 'lendaria' ? 100 : 30;
        p.energy      = Math.min(100, p.energy + ganho);
        p.batteryGlow = 60;
        g2ShowMsg('🔋 BATERIA ' + recomp.desc.toUpperCase() + '! +' + ganho + ' energia', recomp.color);

      } else if (recomp.id === 'escudo') {
        p.hasShield   = true;
        p.shieldRarity = recomp.rarity;
        p.shieldColor  = recomp.color; // guarda a cor para desenhar com a raridade certa
        p.shieldTimer  = recomp.rarity === 'normal' ? 6 :
                         recomp.rarity === 'rara'   ? 12 : 25;
        st.stats.shields++;
        g2ShowMsg('🛡 ESCUDO ' + recomp.desc.toUpperCase() + '! ' + p.shieldTimer + 's', recomp.color);

      } else if (recomp.id === 'turbo') {
        p.hasTurbo  = true;
        p.vy        = G2C.JUMP_VY * 1.4; // impulso consistente com turbo do mapa
        g2ShowMsg('🚀 PROPULSÃO ' + recomp.desc.toUpperCase() + '!', recomp.color);

      } else if (recomp.id === 'sorte') {
        var ganhoSorte = 0.6;
        p.luck = (p.luck || 1) + ganhoSorte;
        /* sorte aumenta a chance de itens bons no mapa — exibe a % atual */
        var pctSorte = Math.round((p.luck - 1) * 100);
        g2ShowMsg('🍀 SORTE +' + pctSorte + '%! Mais itens favoráveis no mapa!', recomp.color);
      }
      break;

    case 'battery':
      p.energy      = Math.min(100, p.energy + 30);
      p.batteryGlow = 60;
      st.stats.energy++;
      g2ShowMsg('🔋 +30 ENERGIA DO TRAJE!', '#00e676');
      break;

    case 'turbo':
      p.hasTurbo = true;
      p.vy       = G2C.JUMP_VY * 1.6;
      g2ShowMsg('🚀 PROPULSÃO ATIVADA!', '#ff9f43');
      break;

    case 'shield':
      p.hasShield    = true;
      p.shieldTimer  = 8;
      p.shieldRarity = 'normal';
      p.shieldColor  = '#4fc3f7';
      st.stats.shields++;
      g2ShowMsg('🛡 ESCUDO NORMAL! 8s de proteção total!', '#4fc3f7');
      break;

    case 'fire':
      if (p.hasShield) {
        /* escudo ativo — bloqueia completamente, não consome e não causa dano */
        p.fireTimer = 30; // efeito visual leve mas não causa dano
        g2ShowMsg('🛡️ ESCUDO ATIVO — Proteção contra incêndio!', '#4fc3f7');
      } else {
        p.energy    = Math.max(0, p.energy - 25);
        p.fireTimer = 90;
        g2ShowMsg('🔥 INCÊNDIO! -25 ENERGIA!', '#ff1744');
        if (p.energy <= 0) g2EndGame('Traje destruído pelo incêndio!');
      }
      break;

    case 'blackhole':
      if (p.hasShield) {
        /* escudo ativo — bloqueia buraco negro sem consumir */
        g2ShowMsg('🌀 ESCUDO ATIVO — Proteção contra buraco negro!', '#4fc3f7');
      } else {
        g2EndGame('Sugado pelo vácuo espacial!');
      }
      break;
  }
}

/* ROLETA DO BAÚ — Geração de recompensa com raridade */

function gerarRecompensaBau(multiplicadorSorte) {
  var tipos     = ['bateria', 'escudo', 'turbo', 'sorte'];
  var sorteado  = tipos[Math.floor(Math.random() * tipos.length)];

  /* itens sem raridade */
  if (sorteado === 'turbo') {
    return { id: 'turbo', rarity: 'unico', color: '#ff9f43', desc: 'Único' };
  }
  if (sorteado === 'sorte') {
    return { id: 'sorte', rarity: 'unico', color: '#9b59b6', desc: 'Especial' };
  }

  /* itens com raridade — influenciados pela sorte do jogador */
  var raridade  = 'normal';
  var cor       = '#00e676';
  var descricao = 'Normal';

  var rand            = Math.random();
  var chanceLendaria  = 0.05 * multiplicadorSorte;
  var chanceEpica     = 0.15 * multiplicadorSorte;
  var chanceRara      = 0.40 * multiplicadorSorte;

  if (rand < chanceLendaria) {
    raridade  = 'lendaria';
    cor       = '#ffd700';
    descricao = sorteado === 'bateria' ? 'Lendária' : 'Lendário';
  } else if (rand < chanceEpica) {
    raridade  = 'epica';
    cor       = '#9b59b6';
    descricao = sorteado === 'bateria' ? 'Épica' : 'Épico';
  } else if (rand < chanceRara) {
    raridade  = 'rara';
    cor       = '#4fc3f7';
    descricao = sorteado === 'bateria' ? 'Rara' : 'Raro';
  }

  return { id: sorteado, rarity: raridade, color: cor, desc: descricao };
}

function abrirRoletaHTML() {
  var overlay    = document.getElementById('chest-overlay');
  var track      = document.getElementById('chest-track');
  var resultText = document.getElementById('chest-result-text');
  var btn        = document.getElementById('chest-btn-claim');

  overlay.classList.remove('chest-hidden');
  resultText.style.opacity = '0';
  btn.disabled = true;

  var imgMap   = { bateria: 'img/bateria.png', escudo: 'img/escudo.png', turbo: 'img/foguete.png', sorte: 'img/sorte.png' };
  var labelMap = { bateria: 'Bateria',     escudo: 'Escudo',     turbo: 'Propulsão',   sorte: 'Sorte'    };

  track.innerHTML = '';
  track.style.transition = 'none';
  track.style.transform  = 'translateX(0px)';

  var sorteAtual      = g2State.player.luck || 1;
  var recompensaFinal = gerarRecompensaBau(sorteAtual);
  var indiceVencedor  = 20;

  /* gera deck embaralhado: todos os 4 itens em ordem aleatória, repete até ter 25 */
  var tipos = ['bateria', 'escudo', 'turbo', 'sorte'];
  function embaralhar(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  var deck = [];
  while (deck.length < 25) {
    deck = deck.concat(embaralhar(tipos));
  }

  for (var i = 0; i < 25; i++) {
    var it;
    if (i === indiceVencedor) {
      it = recompensaFinal;
    } else {
      /* usa o tipo do deck mas sorteia a raridade normalmente */
      var tipoForcado = deck[i];
      do { it = gerarRecompensaBau(sorteAtual); } while (it.id !== tipoForcado);
    }
    var div = document.createElement('div');
    div.className  = 'chest-item-box';
    div.style.border = '2px solid ' + it.color + '55';
    div.innerHTML = '<img src="' + imgMap[it.id] + '" style="width:40px;height:40px;object-fit:contain;filter:drop-shadow(0 0 5px ' + it.color + ');border-radius:4px;" />' +
                    '<div class="chest-name" style="color:' + it.color + ';text-align:center;">' + labelMap[it.id] + '<br><span style="font-size:9px;">' + it.desc.toUpperCase() + '</span></div>';
    track.appendChild(div);
  }

  track.getBoundingClientRect();
  var deslocamento = indiceVencedor * 105;
  track.style.transition = 'transform 3.5s cubic-bezier(0.15, 0.85, 0.35, 1)';
  track.style.transform  = 'translateX(-' + deslocamento + 'px)';

  setTimeout(function() {
    track.children[indiceVencedor].classList.add('winner-highlight');
    track.children[indiceVencedor].style.boxShadow = '0 0 25px ' + recompensaFinal.color + '88';
    resultText.innerHTML = '✅ ' + labelMap[recompensaFinal.id] + ' <strong>' + recompensaFinal.desc + '</strong>!';
    resultText.style.color   = recompensaFinal.color;
    resultText.style.opacity = '1';
    btn.disabled = false;
    btn.onclick = function() {
      overlay.classList.add('chest-hidden');
      g2State.chestActive = false;
      g2CollectItem({ type: 'bau_aberto', recompensa: recompensaFinal, collected: false, phase: 0 });
    };
  }, 3600);
}

/* MENSAGEM FLUTUANTE */

function g2ShowMsg(texto, cor) {
  var el = document.getElementById('g2-msg');
  if (!el) return;
  el.textContent       = texto;
  el.style.color       = cor;
  el.style.borderColor = cor + '55';
  el.classList.add('show');
  clearTimeout(window._g2MsgTimer);
  window._g2MsgTimer = setTimeout(function() { el.classList.remove('show'); }, 2400);
}

/* DRAW — Renderização do frame completo Ordem de desenho: fundo, estrutura, módulos, itens,partículas,jogador,HUD */

function g2Draw() {
  if (!g2Ctx || !g2Canvas || !g2State) return;
  var ctx = g2Ctx;
  var st  = g2State;
  var W   = st.W;
  var H   = st.H;
  var t   = st.tick;

  ctx.clearRect(0, 0, W, H);

  /* --- fundo: interior metálico da estação espacial --- */
  g2DesenharFundo(ctx, W, H, t);

  /* --- rochas espaciais passando ao fundo (parallax, sem interação) --- */
  g2DesenharRochasFundo(ctx, st.rochasFundo);

  /* --- tubulações e estrutura no fundo (parallax lento) --- */
  g2DesenharTubulacoes(ctx, st.tubulacoes, t);

  /* --- lâmpadas de emergência piscando no teto --- */
  g2DesenharLampadas(ctx, st.lampadas, t);

  /* --- detritos voando (colapso da estação) --- */
  g2DesenharDetritos(ctx, st.detritos);

  /* --- chão: corredor metálico da estação --- */
  g2DesenharChao(ctx, W, H, st.cam, t, st.groundY);

  /* --- módulos/plataformas da estação (percorre a lista encadeada) --- */
  var curMod = st.platforms.head;
  while (curMod) {
    var plat = curMod.data;
    var px   = plat.x - st.cam;
    if (px + plat.w >= -60 && px <= W + 60) {
      g2DesenharModulo(ctx, px, plat.y, plat.w, plat.h, plat.danificado);
    }
    curMod = curMod.next;
  }

  /* --- itens sobre as plataformas (percorre a lista encadeada) --- */
  var curIt = st.items.head;
  while (curIt) {
    var item = curIt.data;
    if (!item.collected) {
      var ix = item.x - st.cam;
      if (ix >= -50 && ix <= W + 50) {
        var iy = item.y + Math.sin(t * 0.05 + item.phase) * 6;
        g2DrawItem(ctx, ix, iy, item.type, t);
      }
    }
    curIt = curIt.next;
  }

  /* --- partículas de pulo --- */
  for (var i = 0; i < st.particles.length; i++) {
    var pt = st.particles[i];
    ctx.globalAlpha = Math.max(0, pt.life);
    ctx.fillStyle   = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, Math.max(0, 3 * pt.life), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* --- jogador --- */
  g2DrawPlayer(ctx, st.player, st.cam, t);

  /* --- borda neon do canvas --- */
  ctx.save();
  ctx.strokeStyle = '#4fc3f733';
  ctx.lineWidth   = 2;
  ctx.shadowBlur  = 14;
  ctx.shadowColor = '#4fc3f744';
  ctx.strokeRect(1, 1, W - 2, H - 2);
  ctx.shadowBlur  = 0;
  ctx.restore();

  /* --- HUD (informações do jogador) --- */
  g2DrawHUD(ctx, W, H, st.player, st);

  /* --- tela de pausa --- */
  if (st.paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.70)';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.font      = 'bold 26px Orbitron, monospace';
    ctx.fillStyle = '#4fc3f7';
    ctx.textAlign = 'center';
    ctx.shadowBlur  = 18;
    ctx.shadowColor = '#4fc3f7';
    ctx.fillText('⏸  PAUSADO', W / 2, H / 2 - 8);
    ctx.font      = '11px Orbitron, monospace';
    ctx.fillStyle = '#5a6899';
    ctx.shadowBlur = 0;
    ctx.fillText('Pressione P para continuar', W / 2, H / 2 + 22);
    ctx.textAlign = 'left';
    ctx.restore();
  }
}

/* FUNÇÕES DE DESENHO DO CENÁRIO */

/* Fundo interno da estação espacial — paredes metálicas escuras */
function g2DesenharFundo(ctx, W, H, t) {
  /* gradiente de parede metálica — mais escuro no topo, levemente azulado */
  var grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0,    '#060c18');
  grad.addColorStop(0.4,  '#091525');
  grad.addColorStop(1,    '#0c1e30');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  /* grade metálica no fundo — reforça a estética de interior de estação */
  ctx.save();
  ctx.strokeStyle = '#0d1f35';
  ctx.lineWidth   = 1;
  ctx.globalAlpha = 0.5;

  /* linhas horizontais — painéis da parede */
  for (var ly = 60; ly < H - 60; ly += 55) {
    ctx.beginPath();
    ctx.moveTo(0, ly);
    ctx.lineTo(W, ly);
    ctx.stroke();
  }
  /* linhas verticais — colunas estruturais */
  for (var lx = 0; lx < W; lx += 120) {
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, H);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* Tubulações no fundo — pipes da estação com parallax */
function g2DesenharTubulacoes(ctx, tubulacoes, t) {
  for (var i = 0; i < tubulacoes.length; i++) {
    var tb = tubulacoes[i];
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle   = tb.cor;

    /* corpo da tubulação */
    ctx.fillRect(tb.x, tb.y, tb.w, tb.h);

    /* borda metálica */
    ctx.strokeStyle = '#2a3f5f';
    ctx.lineWidth   = 1;
    ctx.strokeRect(tb.x, tb.y, tb.w, tb.h);

    /* parafusos nas extremidades */
    ctx.fillStyle = '#1a2d44';
    ctx.beginPath();
    ctx.arc(tb.x + 6, tb.y + tb.h / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tb.x + tb.w - 6, tb.y + tb.h / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    /* vapor/fumaça se danificada */
    if (tb.danificada) {
      ctx.globalAlpha = 0.15 + 0.1 * Math.sin(t * 0.05 + i);
      ctx.fillStyle   = '#aaaaaa';
      ctx.beginPath();
      ctx.arc(tb.x + tb.w / 2, tb.y - 8, 8 + Math.sin(t * 0.08) * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

/* Lâmpadas de emergência no teto — piscam em vermelho/laranja */
function g2DesenharLampadas(ctx, lampadas, t) {
  for (var i = 0; i < lampadas.length; i++) {
    var lp    = lampadas[i];
    /* piscar com frequência variada por lâmpada */
    var brilho = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.04 + lp.fase));

    ctx.save();

    /* haste da lâmpada */
    ctx.fillStyle   = '#1a2a3a';
    ctx.fillRect(lp.x - 2, lp.y, 4, 14);

    /* globo da lâmpada */
    ctx.globalAlpha = brilho;
    ctx.fillStyle   = lp.cor;
    ctx.shadowBlur  = 20 * brilho;
    ctx.shadowColor = lp.cor;
    ctx.beginPath();
    ctx.arc(lp.x, lp.y + 18, 7, 0, Math.PI * 2);
    ctx.fill();

    /* halo de luz no chão/parede */
    if (brilho > 0.6) {
      ctx.globalAlpha = (brilho - 0.6) * 0.15;
      var halo = ctx.createRadialGradient(lp.x, lp.y + 18, 0, lp.x, lp.y + 18, 60);
      halo.addColorStop(0,   lp.cor);
      halo.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(lp.x - 60, lp.y, 120, 120);
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 0;
    ctx.restore();
  }
}

/* Detritos voando — parafusos e fragmentos metálicos */
function g2DesenharDetritos(ctx, detritos) {
  for (var i = 0; i < detritos.length; i++) {
    var d = detritos[i];
    ctx.save();
    ctx.globalAlpha = d.op;
    ctx.translate(d.x, d.y);
    ctx.rotate(d.angulo);
    /* detritos maiores são chapas, menores são parafusos */
    if (d.r > 2.5) {
      ctx.fillStyle = '#2a3a4a';
      ctx.fillRect(-d.r, -d.r * 0.5, d.r * 2, d.r);
    } else {
      ctx.fillStyle = '#3a4a5a';
      ctx.beginPath();
      ctx.arc(0, 0, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

/* Chão: corredor metálico da estação espacial */
function g2DesenharChao(ctx, W, H, cam, t, groundY) {
  /* faixa do chão — metal escuro */
  var gradChao = ctx.createLinearGradient(0, groundY, 0, H);
  gradChao.addColorStop(0, '#0e1e32');
  gradChao.addColorStop(1, '#060e1a');
  ctx.fillStyle = gradChao;
  ctx.fillRect(0, groundY, W, H - groundY);

  /* linha neon no topo do chão — borda da plataforma da estação */
  ctx.save();
  ctx.strokeStyle = '#4fc3f7';
  ctx.lineWidth   = 2;
  ctx.shadowBlur  = 10;
  ctx.shadowColor = '#4fc3f755';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(W, groundY);
  ctx.stroke();
  ctx.restore();

  /* tiles metálicos do corredor — alternados para dar textura */
  var tw    = G2C.TILE_W;
  var inicio = Math.floor(cam / tw);
  for (var i = inicio - 1; i < inicio + Math.ceil(W / tw) + 2; i++) {
    var tx = i * tw - cam;
    ctx.fillStyle = (i % 2 === 0) ? '#0e1e32' : '#091525';
    ctx.fillRect(tx, groundY + 3, tw - 1, 18);
    /* parafuso central do tile */
    ctx.fillStyle = '#1a3050';
    ctx.fillRect(tx + tw / 2 - 2, groundY + 10, 4, 4);
    /* ranhura lateral — detalhes metálicos */
    ctx.fillStyle = '#071020';
    ctx.fillRect(tx, groundY + 3, 2, 18);
  }
}

/* Módulo/plataforma da estação espacial */
function g2DesenharModulo(ctx, x, y, w, h, danificado) {
  ctx.save();

  /* corpo do módulo — painel metálico */
  var gradMod = ctx.createLinearGradient(x, y, x, y + h);
  gradMod.addColorStop(0,   danificado ? '#2a1a0a' : '#1a2d4a');
  gradMod.addColorStop(0.5, danificado ? '#1a1008' : '#0f1e32');
  gradMod.addColorStop(1,   danificado ? '#100a04' : '#080f1a');
  ctx.fillStyle = gradMod;
  ctx.fillRect(x, y, w, h);

  /* borda superior brilhante — topo do módulo onde o jogador pisa */
  ctx.fillStyle   = danificado ? '#ff6600' : '#4fc3f7';
  ctx.shadowBlur  = danificado ? 6 : 8;
  ctx.shadowColor = danificado ? '#ff440044' : '#4fc3f755';
  ctx.fillRect(x, y, w, 2);
  ctx.shadowBlur = 0;

  /* bordas laterais metálicas */
  ctx.fillStyle = '#0a1828';
  ctx.fillRect(x,         y, 3,  h);
  ctx.fillRect(x + w - 3, y, 3,  h);

  /* parafusos nos cantos */
  ctx.fillStyle = '#2a3f5a';
  ctx.beginPath(); ctx.arc(x + 6,     y + h / 2, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + w - 6, y + h / 2, 3, 0, Math.PI * 2); ctx.fill();

  /* indicador visual de módulo danificado */
  if (danificado) {
    ctx.fillStyle   = '#ff4400';
    ctx.globalAlpha = 0.4;
    ctx.fillRect(x + w * 0.3, y, w * 0.4, h);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

/* DESENHO DE ITENS E OBSTÁCULOS NO MAPA */

function g2DrawItem(ctx, x, y, tipo, t) {
  var S      = 30;
  var pulso  = 0.82 + 0.18 * Math.sin(t * 0.10);

  ctx.save();
  ctx.translate(x + S / 2, y + S / 2);

  if (tipo === 'blackhole') {
    ctx.rotate(t * 0.038);
    ctx.shadowBlur  = 28;
    ctx.shadowColor = '#9b59b6';
    if (G2_IMG.buraco.complete && G2_IMG.buraco.naturalWidth > 0) {
      ctx.drawImage(G2_IMG.buraco, -S * 1.3, -S * 1.3, S * 2.6, S * 2.6);
    } else {
      ctx.fillStyle = '#9b59b6';
      ctx.beginPath();
      ctx.arc(0, 0, S * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (tipo === 'chest') {
    ctx.scale(pulso, pulso);
    ctx.shadowBlur  = 20;
    ctx.shadowColor = '#ffd700';
    if (G2_IMG.bau.complete && G2_IMG.bau.naturalWidth > 0) {
      ctx.drawImage(G2_IMG.bau, -S, -S, S * 2, S * 2);
    } else {
      ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('📦', 0, 0);
    }

  } else if (tipo === 'fire') {
    /* incêndio — perigo na estação espacial */
    ctx.scale(pulso, pulso);
    ctx.shadowBlur  = 15;
    ctx.shadowColor = '#ff1744';
    ctx.font = '28px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🔥', 0, 0);

  } else if (tipo === 'battery') {
    ctx.scale(pulso, pulso);
    ctx.shadowBlur  = 15;
    ctx.shadowColor = '#00e676';
    if (G2_IMG.bateria.complete && G2_IMG.bateria.naturalWidth > 0) {
      ctx.drawImage(G2_IMG.bateria, -S * 0.8, -S * 0.8, S * 1.6, S * 1.6);
    } else {
      ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🔋', 0, 0);
    }

  } else if (tipo === 'shield') {
    ctx.scale(pulso, pulso);
    ctx.shadowBlur  = 15;
    ctx.shadowColor = '#4fc3f7';
    if (G2_IMG.escudo.complete && G2_IMG.escudo.naturalWidth > 0) {
      ctx.drawImage(G2_IMG.escudo, -S * 0.8, -S * 0.8, S * 1.6, S * 1.6);
    } else {
      ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🛡️', 0, 0);
    }

  } else if (tipo === 'turbo') {
    ctx.scale(pulso, pulso);
    ctx.shadowBlur  = 15;
    ctx.shadowColor = '#ff9f43';
    if (G2_IMG.foguete.complete && G2_IMG.foguete.naturalWidth > 0) {
      ctx.drawImage(G2_IMG.foguete, -S * 0.8, -S * 0.8, S * 1.6, S * 1.6);
    } else {
      ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🚀', 0, 0);
    }
  }

  ctx.restore();
}

/* DESENHO DO JOGADOR (astronauta + efeitos) */

function g2DrawPlayer(ctx, p, cam, t) {
  var sx = p.x;
  var sy = p.y;

  /* atualiza imagem do avatar conforme configuração atual */
  G2_IMG.astro.src = g2AvatarPath();

  ctx.save();

  /* espelha o sprite quando o astronauta vai para a esquerda */
  if (!p.facingRight) {
    ctx.translate(sx + p.w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(sx + p.w / 2), 0);
  }

  /* leve balanço quando está no chão (respiração) */
  var balanço = p.onGround ? Math.sin(t * 0.20) * 1.5 : 0;

  if (G2_IMG.astro.complete && G2_IMG.astro.naturalWidth > 0) {
    ctx.drawImage(G2_IMG.astro, sx - 8, sy + balanço - 8, p.w + 18, p.h + 12);
  } else {
    /* fallback: retângulo colorido enquanto a imagem carrega */
    ctx.fillStyle = p.color;
    ctx.fillRect(sx, sy, p.w, p.h);
  }

  ctx.restore();

  /* --- chama do jetpack ao subir --- */
  if (!p.onGround && p.vy < 0) {
    ctx.save();
    var fx     = sx + p.w / 2;
    var fy     = sy + p.h + 4;
    var alturaChama = 12 + Math.random() * 8;
    var gradChama = ctx.createRadialGradient(fx, fy, 0, fx, fy, alturaChama);
    gradChama.addColorStop(0,   '#ffffff');
    gradChama.addColorStop(0.3, '#ff9f43');
    gradChama.addColorStop(1,   'rgba(255,100,0,0)');
    ctx.fillStyle = gradChama;
    ctx.beginPath();
    ctx.ellipse(fx, fy + alturaChama * 0.4, 5, alturaChama, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* --- contorno verde ao coletar bateria --- */
  if (p.batteryGlow > 0) {
    ctx.save();
    var alpha = p.batteryGlow / 60;
    ctx.strokeStyle = 'rgba(0, 230, 118, ' + alpha + ')';
    ctx.lineWidth   = 3;
    ctx.shadowBlur  = 22;
    ctx.shadowColor = '#00e676';
    ctx.beginPath();
    ctx.ellipse(sx + p.w / 2, sy + p.h / 2, p.w * 0.88, p.h * 0.60, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /* --- escudo ao redor do astronauta — cor muda conforme raridade --- */
  if (p.hasShield) {
    var corEscudo = p.shieldColor || '#4fc3f7'; // verde=normal, azul=raro, roxo=épico
    ctx.save();
    var pulsoEscudo = 0.60 + 0.40 * Math.sin(t * 0.12);
    ctx.strokeStyle = corEscudo.replace(')', ', ' + pulsoEscudo + ')').replace('rgb', 'rgba');
    /* fallback caso shieldColor já seja hex */
    ctx.globalAlpha = pulsoEscudo;
    ctx.strokeStyle = corEscudo;
    ctx.lineWidth   = 3 + (p.shieldRarity === 'epic' ? 2 : 0);
    ctx.shadowBlur  = 20;
    ctx.shadowColor = corEscudo;
    ctx.beginPath();
    ctx.ellipse(sx + p.w / 2, sy + p.h / 2, p.w * 0.92, p.h * 0.64, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /* --- chamas no traje ao pegar incêndio --- */
  if (p.fireTimer > 0) {
    p.fireTimer--;
    var alphaFogo = Math.min(1, p.fireTimer / 30);
    for (var i = 0; i < 5; i++) {
      var ffx  = sx + 4 + Math.random() * (p.w - 8);
      var ffy  = sy + Math.random() * p.h;
      var ffh  = 8 + Math.random() * 14;
      var gradFogo = ctx.createLinearGradient(ffx, ffy, ffx, ffy - ffh);
      gradFogo.addColorStop(0,   'rgba(255, 50, 0, '       + alphaFogo       + ')');
      gradFogo.addColorStop(0.5, 'rgba(255, 160, 0, '      + alphaFogo * 0.7 + ')');
      gradFogo.addColorStop(1,   'rgba(255, 220, 0, 0)');
      ctx.fillStyle = gradFogo;
      ctx.beginPath();
      ctx.ellipse(ffx, ffy - ffh * 0.4, 4 + Math.random() * 3, ffh, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/* HUD — Informações do jogador durante o jogo*/

function g2DrawHUD(ctx, W, H, p, st) {
  ctx.save();

  /* fundo semitransparente do HUD */
  ctx.fillStyle = 'rgba(1,2,10,0.88)';
  ctx.fillRect(0, 0, W, 46);
  ctx.strokeStyle = '#1a2358';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(0, 46);
  ctx.lineTo(W, 46);
  ctx.stroke();

  ctx.font         = '10px Orbitron, monospace';
  ctx.textBaseline = 'middle';

  /* nome do jogador */
  ctx.fillStyle   = p.color;
  ctx.shadowBlur  = 8;
  ctx.shadowColor = p.color;
  ctx.fillText('ASTRONAUTA: ' + p.name, 14, 13);
  ctx.shadowBlur  = 0;

  /* energia do traje */
  var corEnergia = p.energy > 50 ? '#4fc3f7' : p.energy > 25 ? '#ff9f43' : '#ff1744';
  ctx.fillStyle  = corEnergia;
  ctx.fillText('TRAJE: ' + Math.round(p.energy) + '%', 14, 31);

  /* barra de energia */
  var bx = 148, by = 26, bw = 88, bh = 7;
  ctx.fillStyle = '#0d1a3a';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle   = corEnergia;
  ctx.shadowBlur  = 5;
  ctx.shadowColor = corEnergia;
  ctx.fillRect(bx, by, bw * (p.energy / 100), bh);
  ctx.shadowBlur = 0;

  /* módulos e tempo */
  ctx.fillStyle = '#c8d8ff';
  ctx.fillText('MÓDULOS: ' + st.stats.modules, 262, 13);
  ctx.fillStyle = '#5a6899';
  ctx.fillText('TEMPO: '   + st.stats.time + 's', 262, 31);

  /* lado direito: propulsão e sorte */
  ctx.textAlign = 'right';
  ctx.fillStyle   = p.hasTurbo ? '#ff9f43' : '#5a6899';
  if (p.hasTurbo) { ctx.shadowBlur = 8; ctx.shadowColor = '#ff9f43'; }
  ctx.fillText('PROPULSÃO: ' + (p.hasTurbo ? 'ON' : 'OFF'), W - 14, 13);
  ctx.shadowBlur = 0;

  if (p.luck > 1) {
    ctx.fillStyle = '#9b59b6';
    ctx.fillText('🍀 Sorte x' + p.luck.toFixed(1), W - 14, 31);
  }

  /* timer do escudo */
  if (p.hasShield) {
    ctx.fillStyle   = '#4fc3f7';
    ctx.shadowBlur  = 10;
    ctx.shadowColor = '#4fc3f7';
    ctx.fillText('🛡 ' + Math.ceil(p.shieldTimer) + 's', W - 120, 22);
    ctx.shadowBlur = 0;
  }

  ctx.textAlign = 'left';
  ctx.restore();
}

/* FIM DE JOGO */

function g2EndGame(motivo, manual) {
  if (!g2State || !g2State.player.alive) return;
  g2State.player.alive = false;

  if (g2AnimId) { cancelAnimationFrame(g2AnimId); g2AnimId = null; }

  /* remove listeners de teclado */
  if (g2State._onKeyDown) document.removeEventListener('keydown', g2State._onKeyDown);
  if (g2State._onKeyUp)   document.removeEventListener('keyup',   g2State._onKeyUp);

  var tempoTotal = Math.floor((Date.now() - g2State.stats.startTime) / 1000);

  /* salva no ranking e ordena com Bubble Sort manual */
  var entrada = {
    name:       g2State.player.name,
    color:      g2State.player.color,
    modules:    g2State.stats.modules,
    time:       tempoTotal,
    difficulty: G2_DIFF[g2State.diff] ? G2_DIFF[g2State.diff].label : '—',
    date:       new Date().toLocaleDateString('pt-BR'),
    mode:       'MODO 2',
  };
  ranking.push(entrada);
  bubbleSortRanking(ranking);
  ranking = ranking.slice(0, 20);
  try { localStorage.setItem('astroRanking', JSON.stringify(ranking)); } catch(e) {}

  /* preenche tela de game over */
  var encerouManual = manual || motivo.toLowerCase().indexOf('manual') >= 0;
  var tituloEl = document.getElementById('g2-end-title');
  if (tituloEl) tituloEl.textContent = encerouManual ? '✓ MISSÃO ENCERRADA' : '💀 GAME OVER';

  var motivoEl = document.getElementById('g2-end-reason');
  if (motivoEl) motivoEl.textContent = motivo.toUpperCase();

  var statsEl = document.getElementById('g2-end-stats');
  if (statsEl) {
    var itens = [
      ['MÓDULOS PERCORRIDOS', g2State.stats.modules],
      ['SALTOS',              g2State.stats.jumps],
      ['ENERGIA COLETADA',    g2State.stats.energy],
      ['ESCUDOS USADOS',      g2State.stats.shields],
      ['TEMPO TOTAL',         tempoTotal + 's'],
      ['DIFICULDADE',         G2_DIFF[g2State.diff] ? G2_DIFF[g2State.diff].label : '—'],
    ];
    var htmlStats = '';
    for (var i = 0; i < itens.length; i++) {
      htmlStats += '<div class="stat-card"><div class="stat-card-label">' + itens[i][0] + '</div><div class="stat-card-val">' + itens[i][1] + '</div></div>';
    }
    statsEl.innerHTML = htmlStats;
  }

  /* histórico de itens coletados — lido da lista encadeada */
  var infoTipo = {
    battery:   { emoji: '🔋', color: '#00e676' },
    turbo:     { emoji: '🚀', color: '#ff9f43' },
    shield:    { emoji: '🛡️', color: '#ffd700' },
    chest:     { emoji: '📦', color: '#ffd700' },
    fire:      { emoji: '🔥', color: '#ff1744' },
    blackhole: { emoji: '🌀', color: '#9b59b6' },
  };
  var histEl = document.getElementById('g2-end-history');
  if (histEl) {
    var historico = g2State.history.toArray(); // PERCURSO da lista encadeada
    if (historico.length > 0) {
      var htmlHist = '';
      for (var h = 0; h < historico.length; h++) {
        var info = infoTipo[historico[h].type] || { emoji: '?', color: '#5a6899' };
        htmlHist += '<div class="hist-chip" style="border-color:' + info.color + '55" title="' + historico[h].type + '">' + info.emoji + '</div>';
      }
      histEl.innerHTML = htmlHist;
    } else {
      histEl.innerHTML = '<span style="color:#5a6899;font-size:.75rem;">Nenhum item coletado</span>';
    }
  }

  /* botões da tela de fim */
  var btnRank   = document.getElementById('g2-btn-rank');
  var btnReplay = document.getElementById('g2-btn-replay');
  var btnMenu   = document.getElementById('g2-btn-menu');
  if (btnRank)   btnRank.onclick   = function() { showScreen('screen-rank');  };
  if (btnReplay) btnReplay.onclick = function() { showScreen('screen-setup'); };
  if (btnMenu)   btnMenu.onclick   = function() { showScreen('screen-menu');  };

  g2State = null;
  showScreen('screen-game2-end');

  /* para música */
  var m2 = document.getElementById('audio-game2');
  if (m2) { m2.pause(); m2.currentTime = 0; }
}