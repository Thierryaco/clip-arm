// Livre de recettes : renderAt(t) met à jour le DOM pour l'instant t, et seulement t.
// Même t => même image. Aucun Date.now, Math.random, timer ni transition : ce qui bouge est calculé à partir de
// l'état (EngineState.stateAt) et de t.
// Pages construites ici : couverture (intro) et page « Dolma » (couplet 1). Les autres pages arrivent ensuite.
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
  const sectionById = Object.fromEntries(LD.sections.map((s) => [s.id, s]));

  // ---------- construction (une seule fois)
  const pageCover = make('section', 'page', stage);
  const coverIll = make('img', 'cover-ill', pageCover); coverIll.src = '../assets/plats/cover_tonir.jpg';
  make('div', 'fold', pageCover);
  const coverTitle = make('div', 'cover-title', pageCover);
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
  const karaokeTag = make('div', 'karaoke-tag', karaoke, 'Chanté :');
  const karaokeText = make('div', 'hand', karaoke); karaokeText.__for = null;

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
    // ingrédients : cochés quand la ligne qui les nomme a commencé
    let lastChecked = -1;
    ingredients.forEach((it, i) => {
      const on = t >= lineById[it.line].start;
      setCls(it.node, 'off', !on);
      setCls(it.box, 'on', on);
      if (on) lastChecked = i;
    });
    // le dernier coché « pulse » sur le temps fort
    ingredients.forEach((it, i) => setCls(it.node, 'pop', i === lastChecked && st.beat.phase < 0.25));

    // personnage : bouche ouverte quand la voix est forte, clignement déterministe sinon
    const blink = (t % 3.7) < 0.14;
    const mouthOpen = st.voice > 0.35;
    setSrc(cookImg, blink ? '../assets/cuisiniere/yeux_fermes.jpg'
      : mouthOpen ? '../assets/cuisiniere/bouche_ouverte.jpg'
      : '../assets/cuisiniere/reference.jpg');

    // karaoké : ligne chantée en cours
    const l = st.line;
    if (l && !l.echo && lineById[l.id].section === 'verse_1' && l.inside) {
      updateHand(karaokeText, lineById[l.id], st.wordIndex);
    } else {
      clearHand(karaokeText);
    }
  }

  function show(node, on) { setCls(node, 'hidden', !on); }

  function renderAt(t) {
    const st = S.stateAt(t, LD, AA);
    const sec = st.section.id;
    // la couverture couvre aussi le temps avant la première section (sectionAt renvoie null)
    const isCover = sec === 'intro' || sec === null;
    show(pageCover, isCover);
    show(pageDolma, sec === 'verse_1');
    show(pageFallback, !isCover && sec !== 'verse_1');
    if (isCover) renderCover(st, t);
    if (sec === 'verse_1') renderDolma(st, t);
    return st;
  }

  window.BOOK = { renderAt };
})();
