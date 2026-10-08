// Teste core/engine-state.js sur les données générées par tools/sync.py.
// Les assertions sont tirées des temps réels de timings (pas de valeurs codées en dur) :
// le test reste valable quand les temps sont corrigés.
const fs = require('fs'), vm = require('vm'), path = require('path');
const assert = require('assert');

const dir = process.env.CLIP_DIR || path.join(__dirname, '..');
const need = ['core/lyrics-data.js', 'core/audio-analysis.js'].map((f) => path.join(dir, f));
if (!need.every((f) => fs.existsSync(f))) {
  console.error("Données absentes : lance d'abord python3 tools/sync.py (il faut audio/song.mp3 et audio/transcript.json).");
  process.exit(2);
}

const ctx = { window: {} };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(need[0], 'utf8'), ctx);
vm.runInContext(fs.readFileSync(need[1], 'utf8'), ctx);
const D = ctx.window.LYRICS_DATA, A = ctx.window.AUDIO_ANALYSIS;
const E = require(path.join(dir, 'core/engine-state.js'));

const line = (id) => D.lines.find((l) => l.id === id);

// 1) déterminisme : même t => même état
assert.strictEqual(JSON.stringify(E.stateAt(100.1, D, A)), JSON.stringify(E.stateAt(100.1, D, A)));

// 2) chaque ligne : à son début (+ 50 ms), c'est bien elle qui est active et son premier mot est actif
for (const l of D.lines) {
  const st = E.stateAt(l.start + 0.05, D, A);
  assert.strictEqual(st.line.id, l.id, `ligne active à ${l.start} : attendu ${l.id}, obtenu ${st.line && st.line.id}`);
  assert.strictEqual(st.wordIndex, 0, `premier mot de ${l.id}`);
}

// 3) avant la première ligne : aucune ligne active
assert.strictEqual(E.stateAt(0.5, D, A).line, null);

// 4) section : la section d'une ligne est celle de la ligne
for (const l of D.lines) {
  const st = E.stateAt(l.start + 0.05, D, A);
  assert.strictEqual(st.section.id, l.section, `section de ${l.id}`);
}

// 5) mots : ordre croissant et dans la ligne
for (const l of D.lines) {
  for (let k = 0; k < l.words.length; k++) {
    assert.ok(l.words[k][2] >= l.words[k][1], `${l.id} mot ${k} : fin < début`);
    if (k > 0) assert.ok(l.words[k][1] >= l.words[k - 1][1], `${l.id} mot ${k} : ordre`);
  }
}

// 6) beats : phase dans [0, 1), index croissant
const b1 = E.beatAt(A, 10.0), b2 = E.beatAt(A, 10.5);
assert.ok(b1.phase >= 0 && b1.phase < 1);
assert.ok(b2.index >= b1.index);

// 7) bandes : 16 valeurs dans [0, 1]
const bands = E.stateAt(60, D, A).bands;
assert.strictEqual(bands.length, 16);
bands.forEach((v) => assert.ok(v >= 0 && v <= 1));

// 8) l'écho est bien marqué comme écho
const e = D.lines.find((l) => l.echo);
if (e) assert.strictEqual(E.stateAt(e.start + 0.05, D, A).line.echo, true);

console.log(`engine-state : tous les tests passent (${D.lines.length} lignes, ${A.beats.length} beats)`);
