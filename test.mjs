import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {plusDays,initialState,eraseProgress,enroll,grade,dueCards,stats,award,validateTrack,validateBackup} from './dist/core.mjs';
import {ankiRequest} from './dist/anki.mjs';
const intervals=[1,3,7,14,30];
test('calendar offsets cross month, leap and year boundaries',()=>{assert.equal(plusDays('2024-02-28',1),'2024-02-29');assert.equal(plusDays('2026-12-31',1),'2027-01-01');assert.equal(plusDays('2026-11-17',30),'2026-12-17');});
test('review targets stay anchored to learning and do not grant application',()=>{const s=initialState();enroll(s,'a',intervals,'2026-11-01');assert.equal(s.reviews.a.due,'2026-11-02');grade(s,'a','R',intervals,'2026-11-02');assert.equal(s.reviews.a.due,'2026-11-04');assert.equal(s.assessments.a.a,false);assert.equal(s.assessments.a.r,true);assert.throws(()=>grade(s,'a','R',intervals,'2026-11-02'));assert.equal(s.reviewLog.length,1);});
test('guided retry has priority, retains stage, and advances on later success',()=>{const s=initialState();enroll(s,'a',intervals,'2026-11-01');enroll(s,'b',intervals,'2026-10-01');grade(s,'a','G',intervals,'2026-11-02');assert.equal(s.reviews.a.due,'2026-11-03');assert.equal(s.reviews.a.stage,0);assert.equal(dueCards(s,'2026-11-03')[0].id,'a');grade(s,'a','R',intervals,'2026-11-03',true);assert.equal(s.reviews.a.due,'2026-11-04');assert.equal(s.assessments.a.a,true);});
test('late reviews advance only one stage, mature card ends fixed cycle',()=>{const s=initialState();enroll(s,'a',intervals,'2026-01-01');grade(s,'a','R',intervals,'2026-11-01');assert.equal(s.reviews.a.due,'2026-11-02');for(let i=2;i<=5;i++)grade(s,'a','R',intervals,`2026-11-0${i}`);assert.equal(s.reviews.a.due,null);assert.equal(s.reviews.a.history.length,5);});
test('repeat enrollment and XP cannot farm duplicate awards',()=>{const s=initialState();enroll(s,'a',intervals,'2026-11-01');enroll(s,'a',intervals,'2026-11-03');assert.equal(s.reviews.a.learned,'2026-11-01');assert.equal(award(s,'a',20),true);assert.equal(award(s,'a',20),false);assert.equal(stats(s).xp,20);});
test('completion requires all blocks; streak tolerates today not yet studied',()=>{const s=initialState();s.tasks[1]={backend:true,dsa:true};s.tasks[2]={backend:true,dsa:true,review:true};s.activity['2026-11-15']=true;s.activity['2026-11-16']=true;assert.equal(stats(s,'2026-11-17').streak,2);assert.equal(stats(s,'2026-11-17').completed,1);assert.equal(stats(s,'2026-11-18').streak,0);});
test('track validation rejects duplicate lessons and executable links',()=>{const t={id:'language',title:'French',lessons:[{id:'f1',title:'Pronunciation',resource:'https://example.com'}]};assert.equal(validateTrack(t),t);assert.throws(()=>validateTrack({...t,lessons:[...t.lessons,...t.lessons]}));assert.throws(()=>validateTrack({...t,lessons:[{id:'x',title:'X',resource:'javascript:alert(1)'}]}));assert.throws(()=>validateBackup({version:1}));assert.equal(validateBackup(initialState()).version,1);});
test('curriculum preserves 154 consecutive days and all 3278 exact question texts',()=>{const c=JSON.parse(fs.readFileSync('dist/curriculum.json'));const original=JSON.parse(fs.readFileSync('curriculum-integrity.json'));assert.equal(c.days.length,154);let n=0;const ids=new Set();c.days.forEach((d,i)=>{assert.equal(d.day,i+1);assert.equal(d.title,original[i].title);assert.deepEqual(d.budget,original[i].budget);assert.equal(d.meta.name,original[i].problem);assert.equal(crypto.createHash('sha256').update(JSON.stringify(d.questions.map(q=>q.question))).digest('hex'),original[i].questionHash);for(const q of d.questions){assert.ok(q.answer?.length>10);assert.ok(!q.answer.includes('{{'));assert.ok(!ids.has(q.id));ids.add(q.id);n++;}});assert.equal(n,3278);for(const t of c.tracks)validateTrack(t);});
test('Anki version6 contract, key and error handling with mock transport',async()=>{let sent;const fake=async(u,o)=>{sent=JSON.parse(o.body);return {ok:true,json:async()=>({result:['Default'],error:null})};};assert.deepEqual(await ankiRequest('http://127.0.0.1:8765','deckNames',{},'secret',fake),['Default']);assert.equal(sent.version,6);assert.equal(sent.key,'secret');await assert.rejects(ankiRequest('https://remote.example','version',{},'',fake));await assert.rejects(ankiRequest('http://localhost:8765','x',{},'',async()=>({ok:true,json:async()=>({error:'bad model',result:null})})),/bad model/);await assert.rejects(ankiRequest('http://localhost:8765','x',{},'',async()=>({ok:true,json:async()=>({})})),/Invalid/);});

test("recall can succeed while guided application still requires next-day retry",()=>{const s=initialState();enroll(s,"a",intervals,"2026-11-01");grade(s,"a","R",intervals,"2026-11-02",false,true);assert.equal(s.assessments.a.r,true);assert.equal(s.assessments.a.g,true);assert.equal(s.assessments.a.a,false);assert.equal(s.reviews.a.due,"2026-11-03");assert.equal(s.reviews.a.stage,0);});


test('erase progress resets learning records while preserving an independent copy of study content',()=>{
 const s=initialState();s.currentDay=48;s.tasks[1]={backend:true,dsa:true,review:true};
 s.settings.focus=40;s.settings.theme='dark';s.settings.customAudio='data:audio/wav;base64,example';
 s.notes={'practice-D001-T01':'My explanation'};s.todos=[{id:'task',text:'Keep this action',done:true}];
 s.customTracks=[{id:'french',title:'French',lessons:[{id:'french-1',title:'Greetings'}]}];
 s.customCards=[{id:'custom-card',question:'Bonjour?',answer:'Hello'}];s.lessonDone={'french-1':true};
 enroll(s,'custom-card',intervals,'2026-11-01');grade(s,'custom-card','R',intervals,'2026-11-02',true);
 s.sessions=[{id:'focus-1',date:'2026-11-02',seconds:1500,mode:'focus'}];
 const before=structuredClone(s),reset=eraseProgress(s);
 assert.equal(reset.currentDay,1);assert.deepEqual(stats(reset,'2026-11-02'),{xp:0,level:1,streak:0,completed:0,recall:0,applied:0});
 for(const key of ['tasks','assessments','reviews','activity','xpAwards','lessonDone'])assert.deepEqual(reset[key],{});
 for(const key of ['reviewLog','sessions'])assert.deepEqual(reset[key],[]);
 for(const key of ['settings','notes','todos','customTracks','customCards'])assert.deepEqual(reset[key],s[key]);
 assert.equal(validateBackup(reset),reset);assert.deepEqual(s,before);
 reset.customTracks[0].lessons[0].title='Changed';reset.todos[0].text='Changed';reset.settings.focus=25;
 assert.deepEqual(s,before);assert.deepEqual(eraseProgress(initialState()),initialState());
});
