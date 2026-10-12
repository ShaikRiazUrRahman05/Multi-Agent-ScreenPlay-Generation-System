(function(){
  const chatLog = document.getElementById('chat-log');
  const input = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const actionSel = document.getElementById('action-select');
  const targetScene = document.getElementById('target-scene');

  const panelOutline = document.getElementById('outline');
  const panelCharacters = document.getElementById('characters');
  const panelDialogues = document.getElementById('dialogues');
  const panelFinal = document.getElementById('final');
  const overlay = document.getElementById('loading');

  const tabs = Array.from(document.querySelectorAll('.tab'));
  const panels = {
    outline: document.getElementById('panel-outline'),
    characters: document.getElementById('panel-characters'),
    dialogues: document.getElementById('panel-dialogues'),
    final: document.getElementById('panel-final')
  };

  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const name = tab.dataset.tab;
    Object.values(panels).forEach(p => p.classList.remove('active'));
    panels[name].classList.add('active');
  }));

  function addMessage(role, text){
    const wrap = document.createElement('div');
    wrap.className = 'msg ' + role;
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = role === 'user' ? 'U' : 'A';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const pre = document.createElement('div');
    pre.innerText = text;
    bubble.appendChild(pre);
    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    chatLog.appendChild(wrap);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function toScenesBlocks(dialogues){
    // Expect an array of strings. Try to split and annotate scenes
    const container = document.createElement('div');
    (dialogues || []).forEach((block, idx) => {
      const scene = document.createElement('div');
      scene.className = 'scene';
      const h = document.createElement('h3');
      h.textContent = `Scene ${idx+1}`;
      const p = document.createElement('div');
      p.innerText = block;
      scene.appendChild(h);
      scene.appendChild(p);
      container.appendChild(scene);
    });
    return container;
  }

  function renderResult(res, action){
    // Only refresh the tabs impacted by action
    const affectAll = !action || action === 'full_run' || action === 'rewrite_plot';
    const affectCharacters = affectAll || action === 'rewrite_characters';
    const affectDialogue = affectAll || action === 'rewrite_scene' || action === 'rewrite_characters';

    if (affectAll) {
      panelOutline.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.className = 'card';
      const h = document.createElement('h2'); h.textContent = 'Outline';
      const p = document.createElement('div'); p.innerText = (res.outline || '').trim();
      wrap.appendChild(h); wrap.appendChild(p);
      panelOutline.appendChild(wrap);
    }
    if (affectCharacters) {
      panelCharacters.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.className = 'card';
      const h = document.createElement('h2'); h.textContent = 'Characters';
      const p = document.createElement('div'); p.innerText = (res.characters || '').trim();
      wrap.appendChild(h); wrap.appendChild(p);
      panelCharacters.appendChild(wrap);
    }
    if (affectDialogue) {
      panelDialogues.innerHTML = '';
      const scenes = toScenesBlocks(res.dialogues || []);
      panelDialogues.appendChild(scenes);
    }
    if (affectAll || affectDialogue || affectCharacters) {
      panelFinal.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.className = 'card mono';
      const h = document.createElement('h2'); h.textContent = 'Final Script';
      const p = document.createElement('div'); p.innerText = (res.final_script || '').trim();
      wrap.appendChild(h); wrap.appendChild(p);
      panelFinal.appendChild(wrap);
    }
  }

  async function send(){
    const text = (input.value || '').trim();
    if (!text) return;
    const action = actionSel.value;
    const tScene = targetScene.value ? parseInt(targetScene.value, 10) : undefined;

    addMessage('user', `${action}${tScene?`(scene ${tScene})`:''}: ${text}`);
    input.value = '';

    // disable UI and show spinner
    setDisabled(true);
    setLoading(true);

    const body = { user_input: text, user_action: action };
    if (action === 'rewrite_scene' && tScene) body.target_scene = tScene;

    try{
      const resp = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const err = await resp.json().catch(()=>({detail:'Unknown error'}));
        addMessage('assistant', `Error: ${err.detail}`);
        return;
      }
      const data = await resp.json();
      addMessage('assistant', 'Done. Updated results on the right.');
      renderResult(data, action);
    } finally {
      setLoading(false);
      setDisabled(false);
    }
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e)=>{ if(e.key==='Enter') send(); });
  function setLoading(v){ overlay.classList.toggle('show', !!v); overlay.setAttribute('aria-hidden', v? 'false':'true'); }
  function setDisabled(v){ input.disabled=v; sendBtn.disabled=v; actionSel.disabled=v; targetScene.disabled=v; }
})();

