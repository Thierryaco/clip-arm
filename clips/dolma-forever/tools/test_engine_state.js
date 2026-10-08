const fs = require('fs'), vm = require('vm');
const dir = process.env.CLIP_DIR || (__dirname + '/../');
const fs0 = require('fs');
if (!fs0.existsSync(dir + 'core/lyrics-data.js') || !fs0.existsSync(dir + 'core/audio-analysis.js')) {
  console.error('Données absentes : lance d\'abord python3 tools/sync.py (il faut audio/song.mp3 et audio/transcript.json).');
  process.exit(2);
}
const ctx = { window: {} }; ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(dir + 'core/lyrics-data.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync(dir + 'core/audio-analysis.js', 'utf8'), ctx);
const D = ctx.window.LYRICS_DATA, A = ctx.window.AUDIO_ANALYSIS;
const E = require(dir + 'core/engine-state.js');
const assert = require('assert');
// 1) déterminisme : même t => même état
const s1 = JSON.stringify(E.stateAt(100.1, D, A)), s2 = JSON.stringify(E.stateAt(100.1, D, A));
assert.strictEqual(s1, s2);
// 2) ligne et section aux instants clés (vérité terrain du test : L05 à 46.0, refrain 1 à 77.0)
let st = E.stateAt(46.5, D, A); assert.strictEqual(st.line.id, 'L05'); assert.strictEqual(st.section.id, 'verse_1');
st = E.stateAt(77.2, D, A); assert.strictEqual(st.line.id, 'L10'); assert.strictEqual(st.section.id, 'chorus_1');
assert.strictEqual(st.word, 'Oh');
// 3) mot actif : 'dolma' de L10 après 'oh' (ouverture à 77.0, dolma à 77.42)
st = E.stateAt(77.6, D, A); assert.strictEqual(st.word, 'dolma,');
// 4) beat : phase dans [0,1), index croissant
const b1 = E.beatAt(A, 10.0), b2 = E.beatAt(A, 10.5);
assert.ok(b1.phase >= 0 && b1.phase < 1); assert.ok(b2.index >= b1.index);
// 5) début de chanson : pas de ligne active avant L01 ; L01 commence à 15 s
assert.strictEqual(E.stateAt(0.5, D, A).line, null);
// 6) échos après la dernière ligne chantée restent associés à l'outro
st = E.stateAt(205.5, D, A); assert.strictEqual(st.line.id, 'E01'); assert.strictEqual(st.line.echo, true);
// 7) bandes : 16 valeurs entre 0 et 1
const bands = E.stateAt(60, D, A).bands; assert.strictEqual(bands.length, 16); bands.forEach(v => assert.ok(v >= 0 && v <= 1));
// 8) chaque ligne a des mots ordonnés
D.lines.forEach(l => { for (let k = 1; k < l.words.length; k++) assert.ok(l.words[k][1] >= l.words[k-1][1]); });
console.log('engine-state : tous les tests passent (' + D.lines.length + ' lignes, ' + A.beats.length + ' beats)');
