// ChatHelper demo script (mock AI). Save as script.js
// No external libs, pure vanilla JS.

(() => {
  const history = []; // stores {id, q, a, tag, time}
  const chatArea = document.getElementById('chatArea');
  const historyList = document.getElementById('historyList');
  const queryInput = document.getElementById('queryInput');
  const askBtn = document.getElementById('askBtn');
  const askAIbtn = document.getElementById('askAIbtn');
  const filterTopic = document.getElementById('filterTopic');
  const clearHistory = document.getElementById('clearHistory');
  const downloadAll = document.getElementById('downloadAll');
  const exportJson = document.getElementById('exportJson');

  // Utility: escape HTML (safe display)
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Naive auto-tagging
  function autoTag(question) {
    const q = question.toLowerCase();
    if (q.includes('python') || q.includes('java') || q.includes('program') || q.includes('code')) return 'programming';
    if (q.includes('bio') || q.includes('chem') || q.includes('science')) return 'science';
    if (q.includes('job') || q.includes('career') || q.includes('salary') || q.includes('interview')) return 'career';
    return 'general';
  }

  // Render the history sidebar (newest first)
  function renderHistory() {
    const sel = filterTopic.value;
    const items = history.filter(h => sel === 'all' || h.tag === sel);
    if (items.length === 0) {
      historyList.innerHTML = '<div style="color:var(--muted);font-size:13px">No history yet.</div>';
      return;
    }
    historyList.innerHTML = items.map(h => `
      <div class="item" data-id="${h.id}">
        <div class="q">Q: ${escapeHtml(h.q)}</div>
        <div class="meta">Tag: ${h.tag} • ${new Date(h.time).toLocaleString()}</div>
        <div style="margin-top:8px;display:flex;gap:8px">
          <button class="small view-btn" data-id="${h.id}">View</button>
          <button class="small copy-btn" data-id="${h.id}">Copy A</button>
        </div>
      </div>
    `).join('');
    // attach handlers for view & copy
    historyList.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = Number(e.currentTarget.dataset.id);
        viewFromHistory(id);
      });
    });
    historyList.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = Number(e.currentTarget.dataset.id);
        const item = history.find(h => h.id === id);
        if (item) {
          navigator.clipboard.writeText(item.a).then(() => alert('Answer copied to clipboard'));
        }
      });
    });
  }

  // Render chat area (chronological: oldest first)
  function renderChat() {
    chatArea.innerHTML = '';
    if (history.length === 0) {
      chatArea.innerHTML = '<div class="tip">Ask a question below to start the chat.</div>';
      return;
    }
    const items = [...history].reverse(); // reverse because we stored newest first
    items.forEach(h => {
      const qDiv = document.createElement('div');
      qDiv.className = 'bubble user';
      qDiv.innerHTML = `<strong>Q:</strong> ${escapeHtml(h.q)}`;
      const aDiv = document.createElement('div');
      aDiv.className = 'bubble';
      aDiv.innerHTML = `<strong>A:</strong> ${escapeHtml(h.a)}<div class="meta-right">Tag: ${h.tag} • ${new Date(h.time).toLocaleTimeString()}</div>`;
      chatArea.appendChild(qDiv);
      chatArea.appendChild(aDiv);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  // Add to history (push newest at start)
  function addToHistory(q, a, tag) {
    const item = { id: Date.now() + Math.floor(Math.random() * 1000), q, a, tag, time: new Date().toISOString() };
    history.unshift(item);
    renderHistory();
    renderChat();
  }

  // View from history: put question in input and scroll chat
  function viewFromHistory(id) {
    const it = history.find(h => h.id === id);
    if (it) {
      queryInput.value = it.q;
      renderChat();
    }
  }

  // Mock AI generator (short relevant answers)
  function generateAnswerMock(question) {
    const q = question.toLowerCase();
    if (q.includes('what is ai') || q.includes('define ai')) return 'AI stands for Artificial Intelligence: systems that perform tasks that normally require human intelligence.';
    if (q.includes('what is ml') || q.includes('define ml')) return 'Machine Learning is a subset of AI where models learn patterns from data.';
    if (q.includes('python')) return 'Python is a popular programming language used for web, automation, and data science.';
    if (q.includes('career') || q.includes('job')) return 'Build projects, internships, and practice interview problems to improve job prospects.';
    if (q.split(' ').length < 3) return 'Please give a little more detail so I can answer better.';
    return 'Nice question! Here is a concise demo answer: ' + question.slice(0, 130);
  }

  // Main ask flow (useMock=true for demo; replace with real API call in production)
  async function ask(question, useMock = true) {
    if (!question || !question.trim()) return;
    const qText = question.trim();

    // show immediate user bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'bubble user';
    userBubble.textContent = qText;
    chatArea.appendChild(userBubble);

    // loader bubble
    const loading = document.createElement('div');
    loading.className = 'bubble';
    loading.innerHTML = '<span class="loader"></span> Thinking...';
    chatArea.appendChild(loading);
    chatArea.scrollTop = chatArea.scrollHeight;

    // simulate network latency
    await new Promise(resolve => setTimeout(resolve, 600));

    let answer = '';
    if (useMock) {
      answer = generateAnswerMock(qText);
    } else {
      // EXAMPLE: If you have a backend endpoint '/api/ask' use fetch
      // try {
      //   const resp = await fetch('/api/ask', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ question: qText })
      //   });
      //   const data = await resp.json();
      //   answer = data.answer || 'No answer returned';
      // } catch (err) {
      //   answer = 'Error fetching answer from server.';
      // }
      // For demo fallback to mock:
      answer = generateAnswerMock(qText);
    }

    // remove loader and append answer
    if (loading.parentNode) loading.parentNode.removeChild(loading);
    const ansBubble = document.createElement('div');
    ansBubble.className = 'bubble';
    ansBubble.innerHTML = `<strong>A:</strong> ${escapeHtml(answer)}<div class="meta-right">${new Date().toLocaleTimeString()}</div>`;
    chatArea.appendChild(ansBubble);
    chatArea.scrollTop = chatArea.scrollHeight;

    const tag = autoTag(qText);
    addToHistory(qText, answer, tag);
  }

  // Attach event listeners
  askBtn.addEventListener('click', () => {
    ask(queryInput.value, true);
    queryInput.value = '';
  });

  askAIbtn.addEventListener('click', () => {
    ask(queryInput.value, true);
    queryInput.value = '';
  });

  queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      ask(queryInput.value, true);
      queryInput.value = '';
    }
  });

  filterTopic.addEventListener('change', renderHistory);

  clearHistory.addEventListener('click', () => {
    if (confirm('Clear all history?')) {
      history.length = 0;
      renderHistory();
      renderChat();
    }
  });

  downloadAll.addEventListener('click', () => {
    if (history.length === 0) {
      alert('No history to download');
      return;
    }
    const txt = history.slice().reverse().map(h => `Q: ${h.q}\nA: ${h.a}\nTag: ${h.tag}\nTime: ${h.time}\n\n`).join('\n');
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chathelper_history.txt';
    a.click();
    URL.revokeObjectURL(url);
  });

  exportJson.addEventListener('click', () => {
    if (history.length === 0) {
      alert('No history to export');
      return;
    }
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chathelper_history.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Seed demo content
  addToHistory('What is AI?', 'AI stands for Artificial Intelligence: systems that perform tasks that normally require human intelligence.', 'general');
  addToHistory('How to learn Python?', 'Start with basics: syntax, data types, control flow. Build mini projects and use online resources.', 'programming');

  // initial render
  renderHistory();
  renderChat();
})();