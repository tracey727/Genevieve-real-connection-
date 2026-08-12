const STORAGE_KEY = 'genevieve-real-connection-v1';
const defaultState = {
  people: [],
  reflections: [],
  life: [
    { id: crypto.randomUUID(), title: 'Try a free community activity', when: 'now' },
    { id: crypto.randomUUID(), title: 'Have a longer dog-park conversation', when: 'now' },
    { id: crypto.randomUUID(), title: 'Comedy club', when: 'future' },
    { id: crypto.randomUUID(), title: 'Concert', when: 'future' },
    { id: crypto.randomUUID(), title: 'Restaurant experience', when: 'future' },
    { id: crypto.randomUUID(), title: 'Travel somewhere new', when: 'future' }
  ],
  fit: {},
  progress: { familiar: 0, conversations: 0, invites: 0, reflections: 0 },
  today: { choice: null, step: null, completed: 0 },
  connectionMode: 'friendship'
};

const todayOptions = [
  ['talk', 'I feel like talking to someone'],
  ['company', 'I would like company doing something'],
  ['new', 'I would like to meet someone new'],
  ['reconnect', 'I would like to reconnect with someone'],
  ['quiet', 'I do not want company today']
];

const todaySteps = {
  talk: [
    ['One slightly longer conversation', 'At Musgrave or on your dog walk, stay in one comfortable conversation for one extra question. Try: “Do you come here often?”'],
    ['Learn one first name', 'If you recognise someone you have spoken with before, learn their first name or tell them yours.'],
    ['Follow one thread', 'When someone mentions something interesting, ask one genuine follow-up instead of switching topics.']
  ],
  company: [
    ['Choose a shared $0 activity', 'Think of one person you already know a little and one free thing you could comfortably do together: dog walk, park coffee from home, or community event.'],
    ['Make the invitation small', 'Try: “I enjoy talking with you. Want to walk the dogs together sometime?” Small invitations are easier to accept or decline.']
  ],
  new: [
    ['Use repetition, not randomness', 'Go to one familiar place at a similar time. Your goal is not “make a friend”; it is “recognise one more familiar face.”'],
    ['Notice one approachable moment', 'Say hello to one person when there is already a natural reason to speak — for example, your dogs interact or you are both waiting at the gate.']
  ],
  reconnect: [
    ['Choose the easiest person', 'Pick someone you have already enjoyed talking with and make one simple re-entry: “Good to see you again — how have you been?”'],
    ['Move one relationship one centimetre', 'If you already know their name, ask one thing you remember from the last conversation.']
  ],
  quiet: [
    ['Quiet is allowed', 'No social task today. If you want, add one thing to your Life List or review what kind of connection you want next.']
  ]
};

const reflectionQuestions = [
  'Did I enjoy being with this person?',
  'Could I be myself?',
  'Did they listen as well as talk?',
  'Did I feel pressured?',
  'Did I want the conversation to continue?',
  'Did they respect a difference between us?',
  'Would I like to see them again?',
  'Did being around them make my world feel bigger while still letting me be myself?'
];

const deeperQuestions = [
  { text: 'Do we both initiate contact or conversation?', good: true },
  { text: 'Do they remember things that matter to me?', good: true },
  { text: 'Do I feel curious about who they really are, not only about escaping loneliness?', good: true },
  { text: 'Do they seem genuinely curious about me too?', good: true },
  { text: 'Can we disagree without punishment, ridicule or withdrawal?', good: true },
  { text: 'Do they respect my pace and boundaries?', good: true },
  { text: 'Am I doing most of the initiating and emotional work?', good: false },
  { text: 'Am I guessing constantly because I am afraid to ask?', good: false },
  { text: 'Have they pressured, controlled, humiliated, monitored or frightened me?', red: true },
  { text: 'If romance never happened, would I still want this person in my life?', good: true }
];

const fitQuestions = [
  ['independence', 'I want people who have their own mind and let me have mine.'],
  ['reciprocity', 'I need listening and speaking to go both ways.'],
  ['boundaries', 'I want a person who can hear “no” without punishment or pressure.'],
  ['curiosity', 'I enjoy people who can teach, learn and stay curious.'],
  ['disagreement', 'I want disagreement to stay respectful rather than become a fight.'],
  ['humour', 'Laughing together matters to me.'],
  ['pace', 'I want connection to grow gradually rather than become intense immediately.'],
  ['money', 'I prefer not to centre friendship around money, status or spending.'],
  ['experience', 'I want relationships that help life feel bigger and more meaningful.'],
  ['independence2', 'I need room to learn and do things my own way.']
];

let state = loadState();
let currentPersonId = null;

function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      progress: {...defaultState.progress, ...(parsed.progress || {})},
      today: {...defaultState.today, ...(parsed.today || {})},
      connectionMode: parsed.connectionMode || 'friendship'
    };
  } catch { return structuredClone(defaultState); }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); refreshAll(); }
function esc(str=''){ return String(str).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); }
function stageLabel(v){ return ({familiar:'Familiar face',conversation:'Conversation',acquaintance:'Acquaintance',contact:'Contact outside setting',activity:'Doing something together',friendship:'Developing friendship',deeper:'Possibly something deeper'})[v] || v; }

function setConnectionMode(mode, navigate=false){
  state.connectionMode = mode === 'deeper' ? 'deeper' : 'friendship';
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderConnectionMode();
  if(navigate){
    const target = state.connectionMode === 'deeper' ? 'deeper' : 'people';
    const btn = document.querySelector(`.nav-btn[data-view="${target}"]`);
    if(btn) btn.click();
  }
}
function renderConnectionMode(){
  const friendship=document.getElementById('friendshipPathBtn');
  const deeper=document.getElementById('deeperPathBtn');
  const hint=document.getElementById('connectionModeHint');
  if(!friendship || !deeper || !hint) return;
  const isDeeper=state.connectionMode==='deeper';
  friendship.classList.toggle('active',!isDeeper);
  deeper.classList.toggle('active',isDeeper);
  friendship.setAttribute('aria-pressed',String(!isDeeper));
  deeper.setAttribute('aria-pressed',String(isDeeper));
  hint.textContent=isDeeper
    ? 'Invite. Notice. Ask. Match pace. Never presume the next step.'
    : 'Build familiarity, conversation and reciprocity first.';
}

function setupNav(){
  document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b===btn));
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById('view-'+btn.dataset.view).classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  }));
  document.getElementById('menuBtn').addEventListener('click',()=>document.querySelector('.nav').scrollIntoView({behavior:'smooth'}));
}

function renderTodayChoices(){
  const wrap=document.getElementById('todayChoices');
  wrap.innerHTML='';
  todayOptions.forEach(([id,label])=>{
    const b=document.createElement('button');
    b.className='choice-btn'+(state.today.choice===id?' selected':'');
    b.textContent=label;
    b.addEventListener('click',()=>chooseToday(id));
    wrap.appendChild(b);
  });
  renderTodayStep();
}
function chooseToday(choice){
  state.today.choice=choice;
  state.today.step=Math.floor(Math.random()*todaySteps[choice].length);
  saveState();
}
function renderTodayStep(){
  const title=document.getElementById('todayStepTitle'); const text=document.getElementById('todayStepText');
  const done=document.getElementById('stepDoneBtn'); const another=document.getElementById('newStepBtn');
  if(!state.today.choice){ title.textContent='Choose what you want today'; text.textContent='Your step will appear here.'; done.disabled=true; another.disabled=true; return; }
  const step=todaySteps[state.today.choice][state.today.step ?? 0]; title.textContent=step[0]; text.textContent=step[1]; done.disabled=false; another.disabled=false;
}

document.getElementById('stepDoneBtn').addEventListener('click',()=>{ state.today.completed=(state.today.completed||0)+1; toast('Counted. Small steps matter.'); saveState(); });
document.getElementById('newStepBtn').addEventListener('click',()=>{ const arr=todaySteps[state.today.choice]; state.today.step=(state.today.step+1)%arr.length; saveState(); });

function renderMetrics(){
  const familiar = state.people.filter(p=>['familiar','conversation','acquaintance','contact','activity','friendship','deeper'].includes(p.stage)).length;
  document.getElementById('metricFamiliar').textContent=familiar;
  document.getElementById('metricConversations').textContent=state.progress.conversations||0;
  document.getElementById('metricInvites').textContent=state.progress.invites||0;
  document.getElementById('metricReflections').textContent=state.reflections.length;
}

function renderPeople(){
  const list=document.getElementById('peopleList'); const empty=document.getElementById('emptyPeople'); list.innerHTML='';
  empty.classList.toggle('hidden', state.people.length>0);
  state.people.forEach(p=>{
    const el=document.createElement('article'); el.className='person-card';
    el.innerHTML=`<h3>${esc(p.name)}</h3><div class="meta"><span class="mini-chip">${esc(p.place)}</span><span class="mini-chip">${esc(stageLabel(p.stage))}</span></div>${p.note?`<p>${esc(p.note)}</p>`:''}<div class="person-actions"><button class="link-btn" data-a="progress">Move one stage</button><button class="link-btn" data-a="conversation">+ conversation</button><button class="link-btn" data-a="invite">+ invitation</button><button class="link-btn danger" data-a="delete">Remove</button></div>`;
    el.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>personAction(p.id,b.dataset.a)));
    list.appendChild(el);
  });
}
function personAction(id, action){
  const p=state.people.find(x=>x.id===id); if(!p)return;
  if(action==='delete'){ if(confirm(`Remove ${p.name} from your private tracker?`)){state.people=state.people.filter(x=>x.id!==id); saveState();} return; }
  if(action==='conversation'){state.progress.conversations++; toast('Conversation counted.'); saveState(); return;}
  if(action==='invite'){state.progress.invites++; toast('Small invitation counted.'); saveState(); return;}
  if(action==='progress'){
    const order=['familiar','conversation','acquaintance','contact','activity','friendship','deeper']; const i=order.indexOf(p.stage); if(i<order.length-1)p.stage=order[i+1]; toast(`Moved to: ${stageLabel(p.stage)}`); saveState();
  }
}

const personDialog=document.getElementById('personDialog');
document.getElementById('addPersonBtn').addEventListener('click',()=>personDialog.showModal());
document.getElementById('savePersonBtn').addEventListener('click',e=>{
  e.preventDefault();
  const name=document.getElementById('personName').value.trim(); if(!name)return;
  state.people.push({id:crypto.randomUUID(),name,place:document.getElementById('personPlace').value,stage:document.getElementById('personStage').value,note:document.getElementById('personNote').value.trim(),createdAt:new Date().toISOString()});
  document.getElementById('personForm').reset(); personDialog.close(); toast('Person added privately.'); saveState();
});

function renderPeopleSelects(){
  ['reflectionPerson','deeperPerson'].forEach(id=>{
    const s=document.getElementById(id); const current=s.value; s.innerHTML='<option value="">Choose...</option>'+state.people.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join(''); if(state.people.some(p=>p.id===current))s.value=current;
  });
}

function renderQuestions(containerId, questions, prefix){
  const c=document.getElementById(containerId); c.innerHTML='';
  questions.forEach((q,i)=>{
    const text=typeof q==='string'?q:q.text; const div=document.createElement('div'); div.className='question';
    div.innerHTML=`<p>${esc(text)}</p><div class="radio-row">${['Yes','Unsure','No'].map(v=>`<label class="radio-pill"><input type="radio" name="${prefix}${i}" value="${v.toLowerCase()}" required><span>${v}</span></label>`).join('')}</div>`; c.appendChild(div);
  });
}
function getAnswers(prefix, count){ return Array.from({length:count},(_,i)=>document.querySelector(`input[name="${prefix}${i}"]:checked`)?.value||''); }

document.getElementById('reflectionForm').addEventListener('submit',e=>{
  e.preventDefault(); const personId=document.getElementById('reflectionPerson').value; if(!personId){toast('Choose a person first.');return;}
  const answers=getAnswers('r',reflectionQuestions.length); const yes=answers.filter(a=>a==='yes').length; const pressure=answers[3]==='yes';
  let title='Worth noticing'; let cls=''; let text='There is enough positive signal here to keep observing naturally. You do not need to force the next step.';
  if(pressure){title='Slow down';cls='yellow-result';text='You recorded feeling pressured. Do not accelerate the relationship. A respectful person should be able to hear and accept your pace.';}
  else if(yes>=6){title='This connection felt broadly positive'; text='You recorded enjoyment, room to be yourself and several signs of compatibility. The next move can stay small and mutual.';}
  else if(yes<=3){title='Do not manufacture a connection';cls='yellow-result';text='There are not many positive signals yet. That is information, not failure. Keep it casual or let it remain an acquaintance.';}
  state.reflections.push({id:crypto.randomUUID(),personId,answers,note:document.getElementById('reflectionNote').value.trim(),createdAt:new Date().toISOString()});
  const box=document.getElementById('reflectionResult'); box.className='card result-card '+cls; box.innerHTML=`<h3>${title}</h3><p>${text}</p>`; document.getElementById('reflectionForm').reset(); saveState();
});

document.getElementById('deeperForm').addEventListener('submit',e=>{
  e.preventDefault(); const personId=document.getElementById('deeperPerson').value; if(!personId){toast('Choose a person first.');return;}
  const a=getAnswers('d',deeperQuestions.length); let green=0,yellow=0,red=0;
  deeperQuestions.forEach((q,i)=>{ if(q.red && a[i]==='yes') red++; else if(q.good===true){if(a[i]==='yes')green++; if(a[i]==='no')yellow++;} else if(q.good===false && a[i]==='yes')yellow++; });
  const box=document.getElementById('deeperResult');
  if(red){box.className='card result-card red-result'; box.innerHTML='<h3>Red — do not progress</h3><p>You recorded behaviour involving pressure, control, humiliation, monitoring or fear. Do not treat attraction as a reason to override that. Prioritise safety and distance.</p>';}
  else if(yellow>=3){box.className='card result-card yellow-result'; box.innerHTML='<h3>Yellow — slow down and observe</h3><p>There is too much uncertainty or one-sided effort to accelerate. Keep contact ordinary, make no big declaration, and see whether the other person begins taking some of the steps too.</p>';}
  else if(green>=6){box.className='card result-card'; box.innerHTML='<h3>Green — there may be a mutual pattern</h3><p>This is not proof of romance, but there are enough signs to justify one small, reversible step. Invite rather than assume, then let their response set the pace.</p><p><strong>Possible wording:</strong> “I really enjoy spending time with you. Would you like to do something together, just the two of us, sometime?”</p>';}
  else {box.className='card result-card yellow-result'; box.innerHTML='<h3>Not enough information yet</h3><p>Keep enjoying the connection without forcing a label. Familiarity and reciprocity are allowed to build slowly.</p>';}
  box.classList.remove('hidden');
});

const lifeDialog=document.getElementById('lifeDialog'); document.getElementById('addLifeBtn').addEventListener('click',()=>lifeDialog.showModal());
document.getElementById('saveLifeBtn').addEventListener('click',e=>{e.preventDefault();const title=document.getElementById('lifeTitle').value.trim();if(!title)return;state.life.push({id:crypto.randomUUID(),title,when:document.getElementById('lifeWhen').value});document.getElementById('lifeForm').reset();lifeDialog.close();saveState();});
function renderLife(){
  ['now','future'].forEach(when=>{const c=document.getElementById(when==='now'?'lifeNowList':'lifeFutureList');const items=state.life.filter(x=>x.when===when);c.innerHTML=items.length?'':'<p class="muted">Nothing here yet.</p>';items.forEach(item=>{const d=document.createElement('div');d.className='life-item';d.innerHTML=`<span>${esc(item.title)}</span><button aria-label="Remove">Remove</button>`;d.querySelector('button').addEventListener('click',()=>{state.life=state.life.filter(x=>x.id!==item.id);saveState();});c.appendChild(d);});});
}

function renderFit(){
  const f=document.getElementById('fitForm'); f.innerHTML='<p><strong>How important is each to you?</strong></p>';
  fitQuestions.forEach(([key,text])=>{const div=document.createElement('div');div.className='question';div.innerHTML=`<p>${esc(text)}</p><div class="radio-row">${[['low','Low'],['medium','Medium'],['high','High']].map(([v,l])=>`<label class="radio-pill"><input type="radio" name="fit-${key}" value="${v}" ${state.fit[key]===v?'checked':''}><span>${l}</span></label>`).join('')}</div>`; f.appendChild(div);});
  const b=document.createElement('button');b.type='submit';b.className='primary-btn';b.textContent='Save my fit';f.appendChild(b);
  f.onsubmit=e=>{e.preventDefault();fitQuestions.forEach(([key])=>{const v=document.querySelector(`input[name="fit-${key}"]:checked`)?.value;if(v)state.fit[key]=v;});saveState();toast('Friendship fit saved privately.');};
}

document.getElementById('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='genevieve-real-connection-backup.json';a.click();URL.revokeObjectURL(a.href);});
document.getElementById('importFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());state={...structuredClone(defaultState),...parsed,progress:{...defaultState.progress,...(parsed.progress||{})},today:{...defaultState.today,...(parsed.today||{})}};saveState();toast('Backup imported.');}catch{alert('That file could not be imported.');}e.target.value='';});
document.getElementById('deleteAllBtn').addEventListener('click',()=>{if(confirm('Delete all GENEVIEVE Real Connection trial data from this browser? This cannot be undone unless you exported a backup.')){localStorage.removeItem(STORAGE_KEY);state=structuredClone(defaultState);saveState();toast('All local trial data deleted.');}});

document.getElementById('friendshipPathBtn')?.addEventListener('click',()=>setConnectionMode('friendship',true));
document.getElementById('deeperPathBtn')?.addEventListener('click',()=>setConnectionMode('deeper',true));

function refreshAll(){renderTodayChoices();renderMetrics();renderPeople();renderPeopleSelects();renderLife();renderFit();renderConnectionMode();}
setupNav();renderQuestions('reflectionQuestions',reflectionQuestions,'r');renderQuestions('deeperQuestions',deeperQuestions,'d');refreshAll();

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js').catch(()=>{}));}
