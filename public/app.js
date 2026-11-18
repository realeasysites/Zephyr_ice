(() => {
  /* ---------- Data (flavors seen on Zephyr's own posts; lineup rotates) ---------- */
  const BASES = [
    { id: 'mac', name: 'Macadamia nut', color: '#e8c993' },
    { id: 'van', name: 'Vanilla', color: '#fff1cf' },
    { id: 'coco', name: 'Coconut', color: '#fbfaf3', vegan: true },
  ];
  const SYRUPS = [
    { id: 'pog', name: 'P.O.G.', note: 'passion · orange · guava', color: '#ff8a3d' },
    { id: 'mintlime', name: 'Mint lime', color: '#8fd65e' },
    { id: 'cucumber', name: 'Cucumber', color: '#c8ee9f' },
    { id: 'orange', name: 'Orange', color: '#ffa529' },
    { id: 'banana', name: 'Banana', color: '#ffe066' },
    { id: 'coconut', name: 'Coconut', color: '#f3ede2' },
  ];
  const TOPS = [
    { id: 'cap', name: 'Snow cap', color: '#ffffff' },
    { id: 'toast', name: 'Toasted coconut', color: '#d9a35b' },
    { id: 'plum', name: 'Plum powder', color: '#b0413e' },
  ];

  /* ---------- Cup illustration ---------- */
  function cupSVG(p) {
    // Deterministic ice "texture" dots
    let s = 7, dots = '';
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 70; i++) {
      const x = 62 + rnd() * 176, y = 70 + rnd() * 130, r = 1.5 + rnd() * 4;
      dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#fff" opacity="${(0.25 + rnd() * 0.45).toFixed(2)}"/>`;
    }
    let flakes = '', plum = '';
    for (let i = 0; i < 16; i++) {
      const x = 92 + rnd() * 116, y = 92 + rnd() * 34, a = Math.round(rnd() * 180);
      flakes += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="9" height="3.2" rx="1.6" fill="#d9a35b" transform="rotate(${a} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    for (let i = 0; i < 40; i++) {
      const x = 84 + rnd() * 132, y = 96 + rnd() * 70;
      plum += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.6" fill="#a8383a" opacity=".85"/>`;
    }
    return `
<svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a shave ice cup">
  <defs>
    <clipPath id="${p}-dome"><path d="M58 202 C 50 66, 250 66, 242 202 Z"/></clipPath>
    <clipPath id="${p}-cup"><path d="M64 206 L236 206 L215 338 Q150 350 85 338 Z"/></clipPath>
    <linearGradient id="${p}-shine" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>
  <ellipse cx="150" cy="346" rx="92" ry="9" fill="#1f5664" opacity=".12"/>
  <!-- cup -->
  <path d="M64 206 L236 206 L215 338 Q150 350 85 338 Z" fill="#fff" stroke="#1f5664" stroke-width="3"/>
  <g clip-path="url(#${p}-cup)">
    <rect x="40" y="262" width="220" height="16" fill="#d12d86"/>
    <rect x="40" y="284" width="220" height="6" fill="#357485"/>
  </g>
  <text x="150" y="250" text-anchor="middle" font-family="Bricolage Grotesque, system-ui" font-weight="800" font-size="27" fill="#1f5664" letter-spacing="1">ZEPHYR</text>
  <text x="150" y="320" text-anchor="middle" font-family="Caveat, cursive" font-size="17" fill="#1f5664" opacity=".8">shave ice · portland me</text>
  <!-- ice cream base -->
  <ellipse class="cup-base" id="${p}-base" cx="150" cy="204" rx="90" ry="15" fill="#e8c993" stroke="#1f5664" stroke-width="3"/>
  <!-- shaved ice dome with syrup bands -->
  <g clip-path="url(#${p}-dome)">
    <rect x="30" y="50" width="240" height="160" fill="#f6fbff"/>
    <g transform="skewX(-14) translate(30 0)">
      <rect class="syrup-band" id="${p}-s0" x="20" y="50" width="86" height="160" fill="#ff8a3d"/>
      <rect class="syrup-band" id="${p}-s1" x="104" y="50" width="78" height="160" fill="#ff8a3d"/>
      <rect class="syrup-band" id="${p}-s2" x="180" y="50" width="110" height="160" fill="#ff8a3d"/>
    </g>
    ${dots}
    <rect x="30" y="50" width="240" height="160" fill="url(#${p}-shine)"/>
  </g>
  <path d="M58 202 C 50 66, 250 66, 242 202" fill="none" stroke="#1f5664" stroke-width="3"/>
  <!-- toppings -->
  <path class="topping" id="${p}-cap" d="M86 124 C 96 92, 204 92, 214 124 Q 206 140 196 128 Q 186 150 172 132 Q 160 154 146 134 Q 132 152 120 132 Q 106 146 100 128 Q 92 138 86 124 Z" fill="#fffdf6" stroke="#1f5664" stroke-width="2.5"/>
  <g class="topping" id="${p}-toast">${flakes}</g>
  <g class="topping" id="${p}-plum">${plum}</g>
  <!-- spoon -->
  <path d="M206 98 L240 30" stroke="#1f5664" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="243" cy="24" rx="9" ry="13" transform="rotate(28 243 24)" fill="#d12d86" stroke="#1f5664" stroke-width="3"/>
</svg>`;
  }

  function paint(p, base, syrups, tops) {
    const b = document.getElementById(`${p}-base`);
    if (b) b.setAttribute('fill', base.color);
    const cols = syrups.length ? syrups.map((x) => x.color) : ['#eef7fc'];
    const bands = cols.length === 1 ? [cols[0], cols[0], cols[0]] : cols.length === 2 ? [cols[0], cols[1], cols[1]] : cols;
    bands.forEach((c, i) => document.getElementById(`${p}-s${i}`)?.setAttribute('fill', c));
    TOPS.forEach((t) => document.getElementById(`${p}-${t.id}`)?.classList.toggle('off', !tops.some((x) => x.id === t.id)));
  }

  /* ---------- Hero cup: cycles through combos ---------- */
  const hero = document.getElementById('heroCup');
  const heroLabel = document.getElementById('heroLabel');
  if (hero) {
    hero.innerHTML = cupSVG('h');
    const pick = (arr, ids) => ids.map((id) => arr.find((x) => x.id === id));
    const combos = [
      { b: 'mac', s: ['pog'], t: ['cap'], label: 'P.O.G. over macadamia nut' },
      { b: 'coco', s: ['mintlime', 'cucumber'], t: ['cap', 'toast'], label: 'Mint lime + cucumber, vegan coconut' },
      { b: 'van', s: ['banana', 'coconut', 'orange'], t: [], label: 'Banana, coconut & orange on vanilla' },
      { b: 'mac', s: ['orange', 'mintlime'], t: ['plum'], label: 'Orange + mint lime, plum powder' },
    ];
    let i = 0;
    const show = () => {
      const c = combos[i % combos.length];
      paint('h', BASES.find((x) => x.id === c.b), pick(SYRUPS, c.s), pick(TOPS, c.t));
      heroLabel.textContent = c.label;
      i++;
    };
    show();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(show, 3200);
  }

  /* ---------- Builder ---------- */
  const state = { base: BASES[0], syrups: [SYRUPS[0]], tops: [TOPS[0]] };
  const buildCup = document.getElementById('buildCup');
  const orderLine = document.getElementById('orderLine');

  function optBtn(item, pressed, group) {
    const v = item.vegan ? '<span class="tagv">vegan</span>' : '';
    return `<button type="button" class="opt" data-g="${group}" data-id="${item.id}" aria-pressed="${pressed}">
      <span class="sw" style="background:${item.color}"></span>${item.name}${v}</button>`;
  }

  function renderBuilder() {
    document.getElementById('optBase').innerHTML = BASES.map((b) => optBtn(b, state.base.id === b.id, 'base')).join('');
    document.getElementById('optSyrup').innerHTML = SYRUPS.map((s) => optBtn(s, state.syrups.some((x) => x.id === s.id), 'syrup')).join('');
    document.getElementById('optTop').innerHTML = TOPS.map((t) => optBtn(t, state.tops.some((x) => x.id === t.id), 'top')).join('');
    paint('b', state.base, state.syrups, state.tops);
    const syr = state.syrups.length ? state.syrups.map((s) => s.name).join(' + ') : 'Pick a syrup';
    const top = state.tops.length ? ` · ${state.tops.map((t) => t.name.toLowerCase()).join(', ')}` : '';
    orderLine.textContent = `${syr} over ${state.base.name.toLowerCase()}${state.base.vegan ? ' (vegan)' : ''}${top}`;
  }

  if (buildCup) {
    buildCup.innerHTML = cupSVG('b');
    renderBuilder();
    document.querySelector('.builder-steps').addEventListener('click', (e) => {
      const btn = e.target.closest('.opt');
      if (!btn) return;
      const { g, id } = btn.dataset;
      if (g === 'base') state.base = BASES.find((x) => x.id === id);
      if (g === 'syrup') {
        const has = state.syrups.some((x) => x.id === id);
        if (has) state.syrups = state.syrups.filter((x) => x.id !== id);
        else {
          if (state.syrups.length >= 3) state.syrups.shift();
          state.syrups.push(SYRUPS.find((x) => x.id === id));
        }
      }
      if (g === 'top') {
        const has = state.tops.some((x) => x.id === id);
        state.tops = has ? state.tops.filter((x) => x.id !== id) : [...state.tops, TOPS.find((x) => x.id === id)];
      }
      renderBuilder();
    });
    document.getElementById('shareBtn').addEventListener('click', async (e) => {
      const text = `My Zephyr Ice order: ${orderLine.textContent}`;
      try {
        if (navigator.share && matchMedia('(pointer: coarse)').matches) await navigator.share({ text });
        else { await navigator.clipboard.writeText(text); e.target.textContent = 'Copied!'; setTimeout(() => (e.target.textContent = 'Copy my order'), 1600); }
      } catch (_) { /* user cancelled */ }
    });
  }

  /* ---------- Open now (Portland time) ---------- */
  const HOURS = { 0: [13, 18], 3: [15, 21], 4: [15, 21], 5: [15, 21], 6: [14, 21] };
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((x) => x.type === t).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    const now = (Number(get('hour')) % 24) + Number(get('minute')) / 60;
    const h = HOURS[day];
    const pill = document.getElementById('openPill');
    const txt = document.getElementById('openText');
    const fmt = (n) => (n > 12 ? n - 12 : n) + (n >= 12 ? ' pm' : ' am');
    if (h && now >= h[0] && now < h[1]) { pill.classList.add('is-open'); txt.textContent = `Open now on Spring St · until ${fmt(h[1])}`; }
    else if (h && now < h[0]) txt.textContent = `Opens today at ${fmt(h[0])} · 129 Spring St`;
    document.querySelectorAll('#hours tr').forEach((tr) => { if (tr.dataset.d.split(',').map(Number).includes(day)) tr.classList.add('today'); });
  } catch (_) { /* leave default text */ }

  /* ---------- Facebook feed (lazy, sized to its box) ---------- */
  const fb = document.getElementById('fbFeed');
  if (fb) {
    const load = () => {
      const w = Math.max(180, Math.min(500, Math.floor(fb.parentElement.clientWidth - 20)));
      fb.src = fb.dataset.src.replace('WIDTH', w);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { load(); io.disconnect(); } }, { rootMargin: '400px' });
      io.observe(fb);
    } else load();
  }

  /* ---------- Request form ---------- */
  const form = document.getElementById('form');
  if (form) {
    const note = document.getElementById('formNote');
    const kind = form.querySelector('[name="kind"]');
    const msgLabel = document.getElementById('msgLabel');
    form.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => {
      form.querySelectorAll('.tab').forEach((x) => { x.classList.toggle('on', x === t); x.setAttribute('aria-selected', x === t); });
      kind.value = t.dataset.kind;
      form.classList.toggle('hello', t.dataset.kind === 'hello');
      msgLabel.textContent = t.dataset.kind === 'hello' ? 'What’s up?' : 'Anything else we should know?';
      document.getElementById('sendBtn').textContent = t.dataset.kind === 'hello' ? 'Send message' : 'Send request';
    }));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      note.className = 'form-note';
      const data = Object.fromEntries(new FormData(form));
      if (!data.name.trim()) { note.textContent = 'Please add your name.'; note.classList.add('bad'); return; }
      if (!data.email.trim() && !data.phone.trim()) { note.textContent = 'Add a phone or email so we can get back to you.'; note.classList.add('bad'); return; }
      const btn = document.getElementById('sendBtn');
      btn.disabled = true;
      try {
        const res = await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(out.error || 'Something went wrong.');
        form.reset();
        kind.value = form.querySelector('.tab.on').dataset.kind;
        note.textContent = 'Got it — thank you! We’ll be in touch soon. 🍧';
        note.classList.add('ok');
      } catch (err) {
        note.textContent = err.message + ' You can also call (774) 249-0012.';
        note.classList.add('bad');
      } finally { btn.disabled = false; }
    });
  }

  /* ---------- Nav + reveal + year ---------- */
  const burger = document.getElementById('burger');
  const links = document.getElementById('links');
  burger?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  links?.addEventListener('click', (e) => { if (e.target.tagName === 'A') { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

  document.getElementById('yr').textContent = new Date().getFullYear();

  if ('IntersectionObserver' in window) {
    const els = document.querySelectorAll('.section-head, .builder, .story > *, .gallery .ph, .spot, .map, .feed > *, .cart > *');
    els.forEach((el) => el.classList.add('rv'));
    const io = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }
})();
