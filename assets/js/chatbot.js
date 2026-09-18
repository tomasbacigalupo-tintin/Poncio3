/**
 * Poncio IA — widget de chat propio (reemplaza a Chatbase)
 */
(() => {
  'use strict';
  const fab   = document.getElementById('botFab');
  const panel = document.getElementById('botPanel');
  const close = document.getElementById('botClose');
  const msgs  = document.getElementById('botMsgs');
  const form  = document.getElementById('botForm');
  const input = document.getElementById('botInput');
  if (!fab || !panel || !form) return;

  const history = [];
  let open = false;
  let busy = false;

  const setOpen = v => {
    open = v;
    panel.classList.toggle('open', open);
    fab.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    if (open) input.focus();
  };

  fab.addEventListener('click', () => setOpen(!open));
  close.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) setOpen(false); });

  const addMsg = (text, who) => {
    const el = document.createElement('div');
    el.className = `bot-msg bot-msg-${who}`;
    el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;

    input.value = '';
    addMsg(text, 'user');
    history.push({ role: 'user', content: text });

    busy = true;
    const typing = addMsg('Escribiendo…', 'bot typing');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json().catch(() => ({}));
      typing.remove();

      if (!res.ok || !data.reply) {
        addMsg(data.error || 'No pude responder. Probá de nuevo en un momento o escribinos por WhatsApp.', 'bot error');
        return;
      }
      addMsg(data.reply, 'bot');
      history.push({ role: 'assistant', content: data.reply });
    } catch {
      typing.remove();
      addMsg('No pude conectarme. Probá de nuevo en un momento o escribinos por WhatsApp.', 'bot error');
    } finally {
      busy = false;
    }
  });
})();
