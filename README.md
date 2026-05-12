#  Astro Runner — Fuga em uma Estação Espacial em Colapso

## Instituto Federal de Pernambuco (IFPE) - Campus Igarassu

Curso Superior em **Tecnologia em Sistemas para Internet (TSI)**
- **Disciplina:** Algoritmos e Estrutura de Dados
- **Professor:** Milton Secundino
- **Semestre:** 2026.1

---

## Sobre o Projeto

**Astro Runner** é um jogo desenvolvido como projeto prático da disciplina de Algoritmos e Estrutura de Dados, com foco na implementação manual de **listas encadeadas** e **pilhas** aplicadas diretamente à mecânica de um jogo.

O jogador controla um astronauta fugindo de uma estação espacial em colapso, saltando entre módulos com eventos variados — explosões, buracos negros, baterias, escudos e turbos — enquanto gerencia energia e sobrevive o maior tempo possível.

O projeto foi desenvolvido inteiramente em **HTML, CSS e JavaScript puro**, sem frameworks ou bibliotecas externas. Todas as estruturas de dados foram implementadas manualmente, com nós, ponteiros e operações explícitas de inserção, remoção, busca e ordenação.

---

## Modos de Jogo

### Modo 1 — Estratégia por Cartas
O jogador visualiza uma fila de módulos e decide como agir: salto normal, salto duplo ou super pulo. A fila de módulos é gerenciada por uma lista encadeada simples com operações de inserção no final e remoção na cabeça (FIFO).

### Modo 2 — Fuga 2D (Canvas)
Plataforma side-scroller onde o astronauta corre automaticamente pelo cenário. Plataformas, itens e o histórico de coletas são armazenados em listas encadeadas, com geração e remoção dinâmica de nós durante o jogo.

---

## Foco Técnico — Estruturas de Dados

Todo o armazenamento dos dados principais do jogo foi implementado **manualmente**, sem uso de arrays nativos ou coleções da linguagem para as estruturas centrais.

### Lista Encadeada Simples (`LinkedList` / `LinkedList2`)

```javascript
class Node {
  constructor(data) {
    this.data = data;
    this.next = null; // ponteiro manual para o próximo nó
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }
  append(data) { ... }   // inserção no final
  removeHead()  { ... }  // remoção da cabeça (FIFO)
  peekN(n)      { ... }  // busca dos N primeiros nós
  toArray()     { ... }  // percurso completo da lista
}
```

### Onde as listas são usadas

| Estrutura | Dado armazenado | Operações realizadas |
|---|---|---|
| `gs.modules` | Fila de módulos do Modo 1 | Inserção, remoção FIFO, leitura dos N primeiros |
| `gs.history` | Histórico de módulos visitados (Modo 1) | Inserção, percurso para exibição |
| `g2State.platforms` | Plataformas geradas no Modo 2 | Inserção dinâmica, remoção direta de nós antigos |
| `g2State.items` | Itens espalhados no mapa (Modo 2) | Inserção, remoção direta de nós, coleta |
| `g2State.history` | Histórico de itens coletados (Modo 2) | Inserção, percurso para tela de fim |

### Remoção direta de nós (sem `.filter()` nativo)

```javascript
// Remoção de plataformas antigas diretamente na lista encadeada
let curP = st.platforms.head;
let prevP = null;
while (curP) {
  if (curP.data.x + curP.data.w <= cutoff) {
    if (prevP) prevP.next = curP.next;
    else st.platforms.head = curP.next;
    if (curP === st.platforms.tail) st.platforms.tail = prevP;
    st.platforms.size--;
    curP = prevP ? prevP.next : st.platforms.head;
  } else {
    prevP = curP;
    curP = curP.next;
  }
}
```

### Ordenação manual do Ranking (Bubble Sort)

```javascript
function bubbleSortRanking(arr) {
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i].modules < arr[i + 1].modules) {
        const tmp  = arr[i];
        arr[i]     = arr[i + 1];
        arr[i + 1] = tmp;
        swapped    = true;
      }
    }
  } while (swapped);
  return arr;
}
```

---

## Orientação a Objetos

O projeto aplica OO de forma explícita em todas as camadas:

| Classe | Responsabilidade |
|---|---|
| `Node` | Representa um nó da lista encadeada com dado e ponteiro |
| `LinkedList` | Gerencia a lista: cabeça, cauda, tamanho e operações |
| `Node2` / `LinkedList2` | Versão equivalente utilizada no Modo 2 |
| `RepairGame` | Encapsula todo o estado e lógica do Modo 1 |
| `AstroRunner` | Encapsula todo o estado e lógica do Modo 2 |

Cada classe encapsula seus próprios dados e expõe apenas os métodos necessários para interação externa — aplicando os princípios de **encapsulamento**, **construtores** e **reutilização** de código.

---

## Sistema de Ranking

O ranking armazena as 20 melhores pontuações, ordenadas pela quantidade de módulos percorridos usando **Bubble Sort implementado manualmente**. A persistência entre sessões é feita via `localStorage`.

A pontuação é calculada pela classe `RepairGame` através do método `calculateScore()`:
- +10 pontos por módulo percorrido
- Bônus de tempo: quanto mais rápido, maior a pontuação

---

## Estrutura de Arquivos

```
/
├── index.html          # Estrutura principal e telas do jogo
├── style.css           # Estilização geral e animações
├── game.js             # Lógica do Modo 1 (cartas) + LinkedList + RepairGame
├── game2.js            # Lógica do Modo 2 (canvas 2D) + LinkedList2 + AstroRunner
├── avatar/             # Sprites do astronauta (capacetes e cores)
├── *.png               # Assets visuais (planetas, rochas, itens, fundo)
└── README.md
```

---

## 🛠 Tecnologias Utilizadas

<div align="left">
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white&style=for-the-badge" height="32" alt="html5" />
  <img width="12" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white&style=for-the-badge" height="32" alt="css3" />
  <img width="12" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black&style=for-the-badge" height="32" alt="javascript" />
  <img width="12" />
  <img src="https://img.shields.io/badge/Canvas API-000000?logo=html5&logoColor=white&style=for-the-badge" height="32" alt="canvas" />
  <img width="12" />
  <img src="https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white&style=for-the-badge" height="32" alt="github" />
  <img width="12" />
  <img src="https://img.shields.io/badge/Visual Studio Code-007ACC?logo=visualstudiocode&logoColor=white&style=for-the-badge" height="32" alt="vscode" />
</div>

---