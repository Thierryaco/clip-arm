// Livre de recettes : renderAt(t) met à jour le DOM pour l'instant t, et seulement t.
// Même t => même image. Aucun Date.now, Math.random, timer ni transition : ce qui bouge est calculé à partir de
// l'état (EngineState.stateAt) et de t.
// Pages : couverture (intro), « Dolma » (couplet 1), puis une page par section via buildRecipePage
// (lavash, menu, kefta, souvenirs, fête, fin, reprise). Titres et numéros de page : provisoires, à valider.
(function () {
  'use strict';

  const S = window.EngineState;
  const LD = window.LYRICS_DATA;
  const AA = window.AUDIO_ANALYSIS;
  const stage = document.getElementById('book');

  // ---------- helpers DOM : on n'écrit que si la valeur change
  function setText(node, value) {
    if (node.__t !== value) { node.textContent = value; node.__t = value; }
  }
  function setCls(node, cls, on) {
    if (node.__c === undefined) node.__c = {};
    if (node.__c[cls] !== !!on) { node.classList.toggle(cls, !!on); node.__c[cls] = !!on; }
  }
  function setStyle(node, prop, value) {
    if (node.__s === undefined) node.__s = {};
    if (node.__s[prop] !== value) { node.style[prop] = value; node.__s[prop] = value; }
  }
  function setSrc(img, src) {
    if (img.__src !== src) { img.src = src; img.__src = src; }
  }
  function make(tag, cls, parent, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  const lineById = Object.fromEntries(LD.lines.map((l) => [l.id, l]));

  // ---------- construction (une seule fois)
  const pageCover = make('section', 'page', stage);
  const coverIll = make('img', 'cover-ill', pageCover); coverIll.src = '../assets/plats/cover_tonir.jpg';
  make('div', 'fold', pageCover);
  const coverTitle = make('div', 'cover-title', pageCover);
  make('div', 'arm-cover', pageCover, 'Հայաստան · Խոհարան');
  make('div', 'kicker', coverTitle, 'Livre de cuisine');
  make('div', 'big', coverTitle, 'Dolma Forever');
  make('div', 'sub', coverTitle, 'recettes de famille, à partager');
  const stamp = make('div', 'stamp', pageCover, 'DOLMA FOREVER');
  const coverHand = make('div', 'hand abs', pageCover); coverHand.__for = null;
  coverHand.style.left = '960px'; coverHand.style.right = '120px'; coverHand.style.bottom = '20px';
  coverHand.style.textAlign = 'center'; coverHand.style.fontSize = '52px';

  const pageDolma = make('section', 'page hidden', stage);
  make('div', 'fold', pageDolma);
  make('div', 'hdr', pageDolma, 'Dolma');
  make('div', 'arm-sub', pageDolma, 'Տոլմա');
  make('div', 'hdr-num', pageDolma, 'p. 2');
  const dolmaIll = make('img', 'dolma-ill', pageDolma); dolmaIll.src = '../assets/plats/dolma.jpg';
  make('div', 'ing-title', pageDolma, 'Ce qu’il faut :');
  const ingredients = [
    { text: 'Feuilles de vigne tendres', line: 'L02', top: 260 },
    { text: 'Riz parfumé', line: 'L04', top: 380 },
    { text: 'Viande hachée', line: 'L04', top: 480 },
    { text: 'Herbes qui dansent', line: 'L04', top: 580 },
  ].map((it) => {
    const row = make('div', 'ing off', pageDolma);
    setStyle(row, 'top', it.top + 'px');
    make('span', 'box', row);
    row.appendChild(document.createTextNode(it.text));
    return { ...it, node: row, box: row.querySelector('.box') };
  });
  const cookTape = make('div', 'cook-tape', pageDolma);
  const cook = make('div', 'cook', pageDolma);
  const cookImg = make('img', '', cook); cookImg.src = '../assets/cuisiniere/reference.jpg';
  const karaoke = make('div', 'karaoke', pageDolma);
  make('div', 'karaoke-tag', karaoke, 'Chanté :');
  const karaokeText = make('div', 'hand', karaoke); karaokeText.__for = null;

  // Pages de recettes : une par section. img : illustration (null = pas d'illustration),
  // cols : 1 ou 2 colonnes pour la liste, cook : cuisinière présente ou non.
  const RECIPE_PAGES = {
    verse_2_lavash: { title: 'Lavash', arm: 'Լավաշ', num: 'p. 3', img: '../assets/plats/lavash.jpg', label: 'Étapes :' },
    chorus_1: { title: 'Menu', arm: 'Ճաշացանկ', num: 'p. 4', img: '../assets/plats/menu.jpg', label: 'Au menu :' },
    verse_3: { title: 'Kefta', arm: 'Քյուֆթա', num: 'p. 5', img: '../assets/plats/kefta.jpg', label: 'Pour la sauce :' },
    bridge: { title: 'Souvenirs', arm: 'Հիշողություններ', num: 'p. 6', img: '../assets/plats/souvenirs.jpg', pos: '30% 85%', label: 'Au séchoir :' },
    chorus_2: { title: 'Fête', arm: 'Խնջույք', num: 'p. 7', img: '../assets/plats/fete.jpg', label: 'À table :' },
    outro: { title: 'Fin de la recette', arm: 'Բարի ախորժակ', num: 'p. 8', img: '../assets/plats/fin.jpg', label: 'Dernière bouchée :' },
    outro_reprise: { title: 'Encore !', arm: 'Կրկին', num: 'p. 9', img: null, cols: 2, cook: false },
  };

  function buildRecipePage(secId, cfg) {
    const lines = LD.lines.filter((l) => l.section === secId && !l.echo);
    const page = make('section', 'page hidden', stage);
    make('div', 'fold', page);
    make('div', 'hdr', page, cfg.title);
    make('div', 'arm-sub', page, cfg.arm);
    make('div', 'hdr-num', page, cfg.num);
    if (cfg.img) {
      const ill = make('img', 'recipe-ill', page); ill.src = cfg.img;
      if (cfg.pos) ill.style.objectPosition = cfg.pos;
    }
    const cols = cfg.cols || 1;
    const left = cfg.img ? 720 : 110;
    const width = cfg.img ? 520 : 1000;
    if (cfg.label) {
      const lab = make('div', 'label', page, cfg.label);
      setStyle(lab, 'left', left + 'px'); setStyle(lab, 'top', '160px');
    }
    // Mise en page : hauteur de chaque ligne estimée à partir de sa longueur (Caveat ≈ 0,42 em par caractère),
    // puis empilement vertical par colonne. Une ligne qui passe à la ligne suivante ne chevauche pas la suivante.
    const fontPx = cols === 2 ? 32 : (cfg.img && lines.length >= 4 ? 36 : 46);
    const lineH = Math.round(fontPx * 1.2);
    const boxW = 62; // case + marge
    const textW = (cols === 2 ? 640 : width) - boxW;
    const top0 = cfg.label ? 230 : 200;
    const colY = Array(cols).fill(top0);
    const perCol = Math.ceil(lines.length / cols);
    const items = lines.map((ln, i) => {
      const c = cols === 2 ? Math.floor(i / perCol) : 0;
      const nl = Math.max(1, Math.ceil(ln.text.length * fontPx * 0.42 / textW));
      const row = make('div', 'ing off', page);
      setStyle(row, 'left', (cols === 2 ? 110 + c * 690 : left) + 'px');
      setStyle(row, 'top', colY[c] + 'px');
      setStyle(row, 'width', (cols === 2 ? 640 : width) + 'px');
      setStyle(row, 'fontSize', fontPx + 'px');
      setStyle(row, 'lineHeight', lineH + 'px');
      make('span', 'box', row);
      row.appendChild(document.createTextNode(ln.text));
      colY[c] += nl * lineH + 26;
      return { line: ln, node: row, box: row.querySelector('.box') };
    });
    let cookImg = null;
    if (cfg.cook !== false) {
      make('div', 'cook-tape', page);
      const ck = make('div', 'cook', page);
      cookImg = make('img', '', ck); cookImg.src = '../assets/cuisiniere/reference.jpg';
    }
    const kara = make('div', 'karaoke', page);
    make('div', 'karaoke-tag', kara, 'Chanté :');
    const kText = make('div', 'hand', kara); kText.__for = null;
    return { sec: secId, page, items, cookImg, kText };
  }

  const recipes = Object.entries(RECIPE_PAGES).map(([secId, cfg]) => buildRecipePage(secId, cfg));

  const pageFallback = make('section', 'page hidden', stage);
  make('div', 'fallback', pageFallback, 'Page à venir');

  // ---------- rendu
  // Karaoké : un span par mot, reconstruit seulement quand la ligne change (un jeu de spans par zone de texte)
  function buildHand(container, line) {
    container.textContent = '';
    container.__spans = line.words.map(([w], k) => {
      const sp = make('span', 'w todo', container, w);
      if (k < line.words.length - 1) container.appendChild(document.createTextNode(' '));
      return sp;
    });
    container.__for = line.id;
  }
  function updateHand(container, line, wordIndex) {
    if (container.__for !== line.id) buildHand(container, line);
    container.__spans.forEach((sp, k) => {
      setCls(sp, 'done', k < wordIndex);
      setCls(sp, 'now', k === wordIndex);
      setCls(sp, 'todo', k > wordIndex);
    });
  }
  function clearHand(container) {
    if (container.__for !== null) { container.textContent = ''; container.__for = null; }
  }

  // personnage : bouche ouverte quand la voix est forte, clignement déterministe sinon
  function updateCook(img, st, t) {
    if (!img) return;
    const blink = (t % 3.7) < 0.14;
    const mouthOpen = st.voice > 0.35;
    setSrc(img, blink ? '../assets/cuisiniere/yeux_fermes.jpg'
      : mouthOpen ? '../assets/cuisiniere/bouche_ouverte.jpg'
      : '../assets/cuisiniere/reference.jpg');
  }

  // liste : une case par ligne, cochée quand la ligne a commencé ; la dernière cochée « pulse » sur le temps fort
  function updateItems(items, st, t) {
    let lastChecked = -1;
    items.forEach((it, i) => {
      const on = t >= it.line.start;
      setCls(it.node, 'off', !on);
      setCls(it.box, 'on', on);
      if (on) lastChecked = i;
    });
    items.forEach((it, i) => setCls(it.node, 'pop', i === lastChecked && st.beat.phase < 0.25));
  }

  function renderCover(st, t) {
    const l1 = lineById['L01'];
    const tl = t - l1.start; // temps depuis le début de la ligne d'ouverture
    // tampon : apparaît sur le temps fort qui suit le début de la ligne, puis reste
    const beatScale = 1 + 0.05 * Math.max(0, 1 - st.beat.phase * 4);
    setStyle(stamp, 'opacity', tl >= 0 ? 0.88 : 0);
    setStyle(stamp, 'transform', `rotate(-6deg) scale(${tl >= 0 ? beatScale : 1})`);
    if (st.line && st.line.id === 'L01' && st.line.inside) {
      updateHand(coverHand, l1, st.wordIndex);
    } else {
      clearHand(coverHand);
    }
  }

  function renderDolma(st, t) {
    ingredients.forEach((it) => {
      const on = t >= lineById[it.line].start;
      setCls(it.node, 'off', !on);
      setCls(it.box, 'on', on);
    });
    let lastChecked = -1;
    ingredients.forEach((it, i) => { if (t >= lineById[it.line].start) lastChecked = i; });
    ingredients.forEach((it, i) => setCls(it.node, 'pop', i === lastChecked && st.beat.phase < 0.25));
    updateCook(cookImg, st, t);
    const l = st.line;
    if (l && !l.echo && lineById[l.id].section === 'verse_1' && l.inside) {
      updateHand(karaokeText, lineById[l.id], st.wordIndex);
    } else {
      clearHand(karaokeText);
    }
  }

  function renderRecipe(R, st, t) {
    updateItems(R.items, st, t);
    updateCook(R.cookImg, st, t);
    const l = st.line;
    if (l && l.inside && lineById[l.id].section === R.sec) {
      updateHand(R.kText, lineById[l.id], st.wordIndex);
    } else {
      clearHand(R.kText);
    }
  }

  function show(node, on) { setCls(node, 'hidden', !on); }

  function renderAt(t) {
    const st = S.stateAt(t, LD, AA);
    const sec = st.section ? st.section.id : null;
    // la couverture couvre aussi le temps avant la première section (sectionAt renvoie null)
    const isCover = sec === 'intro' || sec === null;
    show(pageCover, isCover);
    show(pageDolma, sec === 'verse_1');
    recipes.forEach((R) => show(R.page, sec === R.sec));
    show(pageFallback, !isCover && sec !== 'verse_1' && !RECIPE_PAGES[sec]);
    if (isCover) renderCover(st, t);
    if (sec === 'verse_1') renderDolma(st, t);
    recipes.forEach((R) => { if (sec === R.sec) renderRecipe(R, st, t); });
    return st;
  }

  window.BOOK = { renderAt };
})();
