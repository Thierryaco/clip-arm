// État du clip à un instant t. Fonctions PURES : même t et mêmes données => même résultat.
// Ce module ne lit ni le temps réel, ni le DOM, ni le hasard. Il se charge dans le navigateur (window.EngineState)
// et dans Node (module.exports), ce qui permet de le tester sans navigateur.
//
// Données attendues :
//   LYRICS_DATA  (core/lyrics-data.js)  : lines[{id, section, text, echo, start, end, words:[[mot, début, fin]...]}], sections[]
//   AUDIO_ANALYSIS (core/audio-analysis.js) : {fps, duration, beats[], rms[], voice[], bass[], onset[], bands[16][]}
(function (root) {
  'use strict';

  // Dernier indice i tel que arr[i] <= t (recherche binaire). -1 si aucun.
  function lastLE(arr, key, t) {
    let lo = 0, hi = arr.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (arr[mid][key] <= t) { ans = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    return ans;
  }

  // Ligne active : celle qui contient t, sinon la dernière commencée (pour les fondus de sortie).
  function lineAt(data, t) {
    const i = lastLE(data.lines, 'start', t);
    if (i < 0) return { index: -1, line: null, inside: false };
    const line = data.lines[i];
    return { index: i, line, inside: t < line.end };
  }

  // Mot actif dans une ligne : indice du mot en cours, -1 avant le premier mot.
  function wordAt(line, t) {
    if (!line) return -1;
    let idx = -1;
    for (let k = 0; k < line.words.length; k++) {
      if (line.words[k][1] <= t) idx = k; else break;
    }
    return idx;
  }

  function sectionAt(data, t) {
    const secs = data.sections;
    const i = lastLE(secs, 'start', t);
    if (i < 0) return { index: -1, id: null, label: null, progress: 0 };
    const s = secs[i];
    const len = Math.max(1e-6, s.end - s.start);
    return { index: i, id: s.id, label: s.label, progress: Math.min(1, Math.max(0, (t - s.start) / len)) };
  }

  // Temps de beat : index du dernier beat passé, phase dans [0, 1) jusqu'au beat suivant, mesure (4 temps).
  function beatAt(analysis, t) {
    const b = analysis.beats;
    const i = lastLE(b.map((x, k) => ({ x, k })), 'x', t);
    if (i < 0) return { index: -1, phase: 0, bar: 0, beatInBar: 0 };
    const cur = b[i];
    const next = i + 1 < b.length ? b[i + 1] : cur + 60 / (analysis.tempo || 120);
    const phase = Math.min(0.999999, (t - cur) / Math.max(1e-6, next - cur));
    return { index: i, phase, bar: Math.floor(i / 4), beatInBar: i % 4 };
  }

  // Valeur d'une courbe à 30 i/s, au cadre le plus proche (pas d'interpolation : déterministe et simple).
  function feature(analysis, name, t) {
    const arr = analysis[name];
    if (!arr || !arr.length) return 0;
    const f = Math.min(arr.length - 1, Math.max(0, Math.round(t * analysis.fps)));
    return arr[f];
  }

  function bandsAt(analysis, t) {
    const f = Math.min(analysis.frames - 1, Math.max(0, Math.round(t * analysis.fps)));
    return analysis.bands.map((band) => band[Math.min(band.length - 1, f)]);
  }

  // État complet à l'instant t : c'est ce que le moteur de rendu lit pour dessiner une image.
  function stateAt(t, data, analysis) {
    const L = lineAt(data, t);
    const sec = sectionAt(data, t);
    const w = wordAt(L.line, t);
    return {
      t,
      section: sec,
      line: L.line ? { id: L.line.id, index: L.index, inside: L.inside, echo: !!L.line.echo, text: L.line.text } : null,
      wordIndex: w,
      word: L.line && w >= 0 ? L.line.words[w][0] : null,
      beat: beatAt(analysis, t),
      voice: feature(analysis, 'voice', t),
      bass: feature(analysis, 'bass', t),
      onset: feature(analysis, 'onset', t),
      rms: feature(analysis, 'rms', t),
      bands: bandsAt(analysis, t),
    };
  }

  const api = { lastLE, lineAt, wordAt, sectionAt, beatAt, feature, bandsAt, stateAt };
  root.EngineState = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
