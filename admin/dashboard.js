(() => {
  const listEl = document.getElementById('list');
  const statsEl = document.getElementById('stats');
  const filtersEl = document.getElementById('filters');
  let data = { statuses: [], requests: [] };
  let filter = 'all';

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const when = (iso) => new Date(iso.replace(' ', 'T') + 'Z').toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  async function api(url, opts = {}) {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
    if (res.status === 401) { location.href = '/admin'; throw new Error('signed out'); }
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed');
    return res.json();
  }

  async function load() {
    data = await api('/admin/api/requests');
    render();
  }

  function render() {
    const r = data.requests;
    const count = (fn) => r.filter(fn).length;
    statsEl.innerHTML = [
      ['New', count((x) => x.status === 'new')],
      ['Cart / events', count((x) => x.kind === 'cart')],
      ['Messages', count((x) => x.kind === 'hello')],
      ['Booked', count((x) => x.status === 'booked')],
    ].map(([l, n]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('');

    const tabs = ['all', 'cart', 'hello', ...data.statuses];
    const label = { all: 'All', cart: 'Cart / events', hello: 'Messages' };
    filtersEl.innerHTML = tabs.map((t) =>
      `<button data-f="${t}" class="${t === filter ? 'on' : ''}">${label[t] || t[0].toUpperCase() + t.slice(1)}</button>`).join('');

    const shown = r.filter((x) => filter === 'all' || x.kind === filter || x.status === filter);
    if (!shown.length) { listEl.innerHTML = '<p class="empty">Nothing here yet.</p>'; return; }

    listEl.innerHTML = shown.map((x) => `
      <article class="card ${x.kind}">
        <div class="card-head">
          <h3>${esc(x.name)}<span class="tag">${x.kind === 'cart' ? 'Cart / event' : 'Message'}</span></h3>
          <span class="when">${when(x.created_at)}</span>
        </div>
        <div class="meta">
          ${x.phone ? `<a href="tel:${esc(x.phone)}">📞 ${esc(x.phone)}</a>` : ''}
          ${x.email ? `<a href="mailto:${esc(x.email)}">✉️ ${esc(x.email)}</a>` : ''}
          ${x.event_date ? `<span>📅 ${esc(x.event_date)}</span>` : ''}
          ${x.guests ? `<span>👥 ${esc(x.guests)}</span>` : ''}
          ${x.location ? `<span>📍 ${esc(x.location)}</span>` : ''}
        </div>
        ${x.message ? `<p class="msg">${esc(x.message)}</p>` : ''}
        <div class="actions">
          <select data-id="${x.id}" aria-label="Status">
            ${data.statuses.map((s) => `<option value="${s}" ${s === x.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
          <button class="del" data-del="${x.id}">Delete</button>
        </div>
      </article>`).join('');
  }

  filtersEl.addEventListener('click', (e) => {
    const f = e.target.dataset.f;
    if (f) { filter = f; render(); }
  });

  listEl.addEventListener('change', async (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    await api(`/admin/api/requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) });
    data.requests.find((x) => String(x.id) === id).status = e.target.value;
    render();
  });

  listEl.addEventListener('click', async (e) => {
    const id = e.target.dataset.del;
    if (!id) return;
    if (!confirm('Delete this request for good? (Use this for spam or test entries.)')) return;
    await api(`/admin/api/requests/${id}`, { method: 'DELETE' });
    data.requests = data.requests.filter((x) => String(x.id) !== id);
    render();
  });

  load().catch((err) => { listEl.innerHTML = `<p class="empty">${esc(err.message)}</p>`; });
})();
