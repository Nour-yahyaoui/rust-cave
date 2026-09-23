import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, StatusBar, BackHandler,
  Alert, Platform, StyleSheet, useWindowDimensions, KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { MODULES } from './src/data';

const KEY = 'rustcave:v1';
const C = {
  bg: '#120E0C', s1: '#1C1613', s2: '#271E19', line: '#3A2E27',
  rust: '#E8672C', amber: '#F2B04A', text: '#F4EDE6', mute: '#A69686',
  ok: '#6FCF8E', bad: '#EF6461',
};
const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });
// Room for the Android back/home/recents buttons (status bar is hidden).
const PAD_TOP = Platform.OS === 'android' ? 20 : 14;
const PAD_BOTTOM = Platform.OS === 'android' ? 52 : 30;

const LEVELS = ['Pebble', 'Cave Rat', 'Miner', 'Tunneler', 'Crab Apprentice', 'Rustacean', 'Cave Warden', 'Iron Forger', 'Actix Master'];
const LESSONS = MODULES.flatMap((m) => m.lessons.map((l) => ({ ...l, mod: m })));
const XP_LESSON = 100;
const XP_Q = 20;
const MAX_XP = LESSONS.length * XP_LESSON + LESSONS.reduce((a, l) => a + l.quiz.length, 0) * XP_Q;
const XP_LEVEL = Math.ceil(MAX_XP / (LEVELS.length - 1));
const norm = (s) => s.replace(/\s+/g, '').toLowerCase();

function Bar({ pct, color = C.rust, h = 8 }) {
  return (
    <View style={{ height: h, borderRadius: h, backgroundColor: C.s2, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(Math.min(1, pct) * 100)}%`, height: '100%', backgroundColor: color, borderRadius: h }} />
    </View>
  );
}

function Btn({ label, icon, onPress, kind = 'primary', disabled }) {
  const primary = kind === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        primary ? { backgroundColor: C.rust } : { backgroundColor: C.s2, borderWidth: 1, borderColor: C.line },
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 },
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={primary ? '#fff' : C.text} style={{ marginRight: 8 }} /> : null}
      <Text style={[s.btnTxt, !primary && { color: C.text }]}>{label}</Text>
    </Pressable>
  );
}

function Code({ text }) {
  return (
    <View style={s.code}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Text style={s.codeTxt} selectable>{text}</Text>
      </ScrollView>
    </View>
  );
}

function Top({ title, onBack }) {
  return (
    <View style={s.top}>
      <Pressable onPress={onBack} hitSlop={12} style={s.iconBtn}>
        <Ionicons name="arrow-back" size={22} color={C.text} />
      </Pressable>
      <Text style={s.topTitle} numberOfLines={1}>{title}</Text>
    </View>
  );
}

function Home({ p, xp, doneCount, open, toggle, reset }) {
  const lvl = Math.min(LEVELS.length - 1, Math.floor(xp / XP_LEVEL));
  const maxed = lvl >= LEVELS.length - 1;
  const into = maxed ? 1 : (xp % XP_LEVEL) / XP_LEVEL;
  const next = LESSONS.find((l) => !p.done[l.id]);
  let n = 0;
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <View style={s.head}>
        <Ionicons name="flame" size={28} color={C.rust} />
        <Text style={s.brand}>Rust Cave</Text>
      </View>

      <View style={s.card}>
        <View style={s.row}>
          <View style={s.lvlBadge}><Text style={s.lvlNum}>{lvl + 1}</Text></View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={s.cardTitle}>{LEVELS[lvl]}</Text>
            <Text style={s.mute}>{xp} XP{maxed ? ' · max level' : ` · ${XP_LEVEL - (xp % XP_LEVEL)} XP to ${LEVELS[lvl + 1]}`}</Text>
          </View>
        </View>
        <View style={{ height: 12 }} />
        <Bar pct={into} color={C.amber} h={10} />
        <View style={{ height: 16 }} />
        <View style={[s.row, { justifyContent: 'space-between', marginBottom: 6 }]}>
          <Text style={s.mute}>Course progress</Text>
          <Text style={s.mute}>{doneCount} / {LESSONS.length} lessons</Text>
        </View>
        <Bar pct={doneCount / LESSONS.length} />
      </View>

      {next ? (
        <Pressable onPress={() => open('lesson', next.id)} style={({ pressed }) => [s.card, s.continue, pressed && { opacity: 0.85 }]}>
          <Ionicons name="play-circle" size={34} color={C.rust} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.mute}>{doneCount === 0 ? 'START HERE' : 'CONTINUE'}</Text>
            <Text style={s.cardTitle}>{next.title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.mute} />
        </Pressable>
      ) : (
        <View style={[s.card, s.row]}>
          <Ionicons name="trophy" size={30} color={C.amber} />
          <Text style={[s.cardTitle, { marginLeft: 12, flex: 1 }]}>Cave cleared! Now build the Notes API challenge.</Text>
        </View>
      )}

      {MODULES.map((m) => {
        const md = m.lessons.filter((l) => p.done[l.id]).length;
        return (
          <View key={m.id} style={{ marginTop: 22 }}>
            <View style={[s.row, { marginBottom: 10 }]}>
              <Ionicons name={m.icon} size={20} color={C.amber} />
              <Text style={s.modTitle}>{m.title}</Text>
              <Text style={s.mute}>{md}/{m.lessons.length}</Text>
            </View>
            {m.lessons.map((l) => {
              n += 1;
              const done = !!p.done[l.id];
              const best = p.best[l.id];
              return (
                <Pressable key={l.id} onPress={() => open('lesson', l.id)} style={({ pressed }) => [s.lesson, pressed && { opacity: 0.85 }]}>
                  <Text style={s.idx}>{n}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.lessonTitle, done && { color: C.mute }]}>{l.title}</Text>
                    <Text style={s.small}>
                      {l.min} min{best !== undefined ? `  ·  quiz ${best}/${l.quiz.length}` : ''}
                    </Text>
                  </View>
                  <Pressable onPress={() => toggle(l.id)} hitSlop={12}>
                    <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={28} color={done ? C.ok : C.line} />
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        );
      })}

      <View style={{ marginTop: 28 }}>
        <Btn kind="ghost" icon="refresh" label="Reset progress" onPress={reset} />
      </View>
    </ScrollView>
  );
}

function Lesson({ lesson, done, best, toggle, back, openQuiz, nextLesson, openNext }) {
  return (
    <View style={{ flex: 1 }}>
      <Top title={lesson.mod.title} onBack={back} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={s.h1}>{lesson.title}</Text>
        <Text style={[s.mute, { marginBottom: 18 }]}>{lesson.min} min read</Text>
        {lesson.body.map(([k, v], i) =>
          k === 'c' ? <Code key={i} text={v} /> :
          k === 'h' ? <Text key={i} style={s.h2}>{v}</Text> :
          <Text key={i} style={s.p}>{v}</Text>
        )}
        <View style={{ height: 8 }} />
        <Btn icon="help-circle" label={best !== undefined ? `Retake quiz (best ${best}/${lesson.quiz.length})` : 'Take the quiz'} onPress={openQuiz} />
        <View style={{ height: 10 }} />
        <Btn kind="ghost" icon={done ? 'checkmark-circle' : 'ellipse-outline'} label={done ? 'Finished (tap to undo)' : 'Mark as finished'} onPress={toggle} />
        {nextLesson ? (
          <View style={{ marginTop: 10 }}>
            <Btn kind="ghost" icon="arrow-forward" label={`Next: ${nextLesson.title}`} onPress={openNext} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Quiz({ lesson, back, save }) {
  const qs = lesson.quiz;
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [txt, setTxt] = useState('');
  const [checked, setChecked] = useState(false);
  const [ok, setOk] = useState(false);
  const [score, setScore] = useState(0);
  const [end, setEnd] = useState(false);
  const q = qs[i];

  const check = () => {
    let r;
    if (q.k === 'mcq') { if (pick === null) return; r = pick === q.a; }
    else { if (!txt.trim()) return; r = q.ans.some((a) => norm(a) === norm(txt)); }
    setOk(r); setChecked(true);
    if (r) setScore((v) => v + 1);
  };
  const next = () => {
    if (i + 1 >= qs.length) { setEnd(true); save(score); return; }
    setI(i + 1); setPick(null); setTxt(''); setChecked(false);
  };
  const retry = () => { setI(0); setPick(null); setTxt(''); setChecked(false); setScore(0); setEnd(false); };

  if (end) {
    const good = score >= Math.ceil(qs.length * 0.6);
    return (
      <View style={{ flex: 1 }}>
        <Top title="Quiz result" onBack={back} />
        <View style={[s.card, { alignItems: 'center', marginTop: 24 }]}>
          <Ionicons name={good ? 'trophy' : 'bulb'} size={54} color={good ? C.amber : C.rust} />
          <Text style={[s.h1, { marginTop: 12 }]}>{score} / {qs.length}</Text>
          <Text style={[s.p, { textAlign: 'center' }]}>
            {good ? `Nice work! +${score * XP_Q} XP counted (best score is kept).` : 'Review the lesson and try again, you are close.'}
          </Text>
        </View>
        <View style={{ height: 14 }} />
        <Btn icon="refresh" label="Try again" onPress={retry} kind="ghost" />
        <View style={{ height: 10 }} />
        <Btn icon="book" label="Back to lesson" onPress={back} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Top title={`Question ${i + 1} of ${qs.length}`} onBack={back} />
      <Bar pct={(i + (checked ? 1 : 0)) / qs.length} color={C.amber} />
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={s.h2}>{q.q}</Text>
        {q.k === 'mcq' ? (
          q.o.map((o, idx) => {
            const isPick = pick === idx;
            const right = checked && idx === q.a;
            const wrong = checked && isPick && idx !== q.a;
            return (
              <Pressable
                key={idx}
                disabled={checked}
                onPress={() => setPick(idx)}
                style={[s.opt, isPick && { borderColor: C.rust }, right && { borderColor: C.ok, backgroundColor: '#16281D' }, wrong && { borderColor: C.bad, backgroundColor: '#2C1817' }]}
              >
                <Text style={s.optTxt}>{o}</Text>
              </Pressable>
            );
          })
        ) : (
          <>
            <Code text={q.code} />
            <TextInput
              value={txt}
              onChangeText={setTxt}
              editable={!checked}
              placeholder="Type what replaces ____"
              placeholderTextColor={C.mute}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              style={[s.input, checked && { borderColor: ok ? C.ok : C.bad }]}
            />
          </>
        )}
        {checked ? (
          <View style={[s.card, { marginTop: 14, borderColor: ok ? C.ok : C.bad }]}>
            <View style={s.row}>
              <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={22} color={ok ? C.ok : C.bad} />
              <Text style={[s.cardTitle, { marginLeft: 8 }]}>{ok ? 'Correct' : 'Not quite'}</Text>
            </View>
            {!ok && q.k === 'fill' ? <Text style={[s.p, { marginTop: 6 }]}>Answer: {q.ans[0]}</Text> : null}
            <Text style={[s.p, { marginTop: 6, marginBottom: 0 }]}>{q.w}</Text>
          </View>
        ) : null}
        <View style={{ height: 16 }} />
        {checked ? (
          <Btn icon={i + 1 >= qs.length ? 'flag' : 'arrow-forward'} label={i + 1 >= qs.length ? 'See result' : 'Next'} onPress={next} />
        ) : (
          <Btn icon="checkmark" label="Check answer" onPress={check} disabled={q.k === 'mcq' ? pick === null : !txt.trim()} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function App() {
  const [p, setP] = useState({ done: {}, best: {} });
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState({ name: 'home' });
  const { width } = useWindowDimensions();

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) { const j = JSON.parse(raw); setP({ done: j.done || {}, best: j.best || {} }); }
      } catch (e) {}
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(p)).catch(() => {});
  }, [p, ready]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.name === 'home') return false;
      setRoute(route.name === 'quiz' ? { name: 'lesson', id: route.id } : { name: 'home' });
      return true;
    });
    return () => sub.remove();
  }, [route]);

  const toggle = (id) => setP((o) => ({ ...o, done: { ...o.done, [id]: !o.done[id] } }));
  const save = (id, sc) => setP((o) => ({ ...o, best: { ...o.best, [id]: Math.max(o.best[id] || 0, sc) } }));
  const reset = () =>
    Alert.alert('Reset progress?', 'This clears finished lessons and quiz scores.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => { setP({ done: {}, best: {} }); setRoute({ name: 'home' }); } },
    ]);

  const doneCount = LESSONS.filter((l) => p.done[l.id]).length;
  const xp = doneCount * XP_LESSON + LESSONS.reduce((a, l) => a + (p.best[l.id] || 0) * XP_Q, 0);
  const idx = route.id ? LESSONS.findIndex((l) => l.id === route.id) : -1;
  const lesson = idx >= 0 ? LESSONS[idx] : null;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar hidden />
      <View style={{ flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: width < 360 ? 14 : 20, paddingTop: PAD_TOP, paddingBottom: PAD_BOTTOM }}>
        {!ready ? null : route.name === 'home' || !lesson ? (
          <Home p={p} xp={xp} doneCount={doneCount} toggle={toggle} reset={reset} open={(name, id) => setRoute({ name, id })} />
        ) : route.name === 'lesson' ? (
          <Lesson
            lesson={lesson}
            done={!!p.done[lesson.id]}
            best={p.best[lesson.id]}
            toggle={() => toggle(lesson.id)}
            back={() => setRoute({ name: 'home' })}
            openQuiz={() => setRoute({ name: 'quiz', id: lesson.id })}
            nextLesson={LESSONS[idx + 1]}
            openNext={() => setRoute({ name: 'lesson', id: LESSONS[idx + 1].id })}
          />
        ) : (
          <Quiz key={lesson.id} lesson={lesson} back={() => setRoute({ name: 'lesson', id: lesson.id })} save={(sc) => save(lesson.id, sc)} />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  brand: { color: C.text, fontSize: 28, fontWeight: '800', marginLeft: 10, letterSpacing: 0.3 },
  card: { backgroundColor: C.s1, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.line, marginBottom: 12 },
  continue: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { color: C.text, fontSize: 17, fontWeight: '700' },
  mute: { color: C.mute, fontSize: 13 },
  small: { color: C.mute, fontSize: 12, marginTop: 2 },
  lvlBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.rust, alignItems: 'center', justifyContent: 'center' },
  lvlNum: { color: '#fff', fontSize: 22, fontWeight: '800' },
  modTitle: { color: C.text, fontSize: 18, fontWeight: '700', marginLeft: 8, flex: 1 },
  lesson: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.s1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14, marginBottom: 8, borderWidth: 1, borderColor: C.line },
  idx: { color: C.rust, fontWeight: '800', width: 28, fontSize: 15 },
  lessonTitle: { color: C.text, fontSize: 15, fontWeight: '600' },
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: C.mute, fontSize: 14, marginLeft: 12, flex: 1 },
  h1: { color: C.text, fontSize: 28, fontWeight: '800', marginBottom: 4 },
  h2: { color: C.text, fontSize: 19, fontWeight: '700', marginBottom: 14, marginTop: 6, lineHeight: 26 },
  p: { color: '#DCD2C8', fontSize: 16, lineHeight: 25, marginBottom: 14 },
  code: { backgroundColor: C.s2, borderRadius: 12, padding: 14, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: C.rust },
  codeTxt: { color: C.amber, fontFamily: MONO, fontSize: 13, lineHeight: 20 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 15, paddingHorizontal: 16 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  opt: { backgroundColor: C.s1, borderWidth: 1.5, borderColor: C.line, borderRadius: 14, padding: 16, marginBottom: 10 },
  optTxt: { color: C.text, fontSize: 16 },
  input: { backgroundColor: C.s1, borderWidth: 1.5, borderColor: C.line, borderRadius: 14, padding: 14, color: C.text, fontFamily: MONO, fontSize: 16 },
});
