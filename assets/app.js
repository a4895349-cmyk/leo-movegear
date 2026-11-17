/* ===== 共用工具 ===== */
const $ = (s, el = document) => el.querySelector(s);
const qs = (k) => new URLSearchParams(location.search).get(k);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// 皮拉提斯器械（pilates-data.js 有載入時才會有）
const plItems = () => (typeof PL_SERIES === "undefined" ? [] : PL_SERIES.flatMap((s) => s.items.map((it) => ({
  id: "pl-" + (it.img || it.code).toLowerCase().replace(/\s+/g, ""), cat: "pilates", brand: "elina", model: it.code, name: it.name,
  img: it.img ? `img/pilates/${it.img}.jpg` : "img/life-pilates.jpg", specs: it.specs, tags: it.tags, series: s,
}))));
const byId = (id) => PRODUCTS.find((p) => p.id === id) || plItems().find((p) => p.id === id);
const catOf = (id) => CATEGORIES.find((c) => c.id === id);
const isCream = (p) => p.cat === "pilates";

const ICON = {
  logo: '<svg viewBox="0 0 32 32" fill="none"><path d="M6 22c2-9 8-15 18-16-5 3-8 7-9 12h8c-2 5-7 8-13 8 2-1 3-3 3-5H6z" fill="#fff"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4V5z"/><path d="M8 10h8M8 13h5" stroke-linecap="round"/></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5" stroke-linecap="round"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
};

/* ===== 詢價清單（存在瀏覽器） ===== */
const Inq = {
  get() { let l = []; try { l = JSON.parse(localStorage.getItem("inq") || "[]"); } catch {} return l.filter((x) => x && byId(x.id)); },
  set(v) { try { localStorage.setItem("inq", JSON.stringify(v)); } catch {} updateBadge(); },
  has(id) { return this.get().some((x) => x.id === id); },
  toggle(id) {
    const l = this.get(); const i = l.findIndex((x) => x.id === id);
    if (i >= 0) { l.splice(i, 1); this.set(l); toast("已從詢價清單移除"); return false; }
    l.push({ id, q: 1 }); this.set(l); toast("已加入詢價清單"); return true;
  },
};
function updateBadge() { const n = Inq.get().length; document.querySelectorAll(".inq-num").forEach((e) => (e.textContent = n || "")); }
function toast(t) {
  let el = $(".toast"); if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
  el.textContent = t; el.classList.add("show"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 1800);
}

/* ===== 佔地換算 ===== */
function footprint(p) {
  if (!p.size) return null;
  const [w, d] = p.size; const m2 = (w * d) / 1e6; const use = ((w + 1200) * (d + 1200)) / 1e6;
  return { m2, ping: m2 / 3.3058, use, usePing: use / 3.3058 };
}
const fmt = (n) => (n < 10 ? n.toFixed(1) : Math.round(n));

/* ===== 名詞解釋（規格表用） ===== */
const GLOSS = {
  "配重片": "機器內建的那疊鐵片，用插銷選重量。數字越大代表可以練得越重。",
  "產品重量": "機器本身的重量，搬運上樓、樓板承重時需要考慮。",
  "動臂顏色": "機器上可以選色的金屬手臂部位。",
  "坡度": "跑步機可以抬高的角度，坡度走路燃脂效果好、對膝蓋友善。",
  "跑步區域寬": "跑帶的寬度，越寬越不容易踩到邊、越有安全感。一般商用約 50–60 cm。",
  "最大載重": "使用者體重上限。",
  "床高": "低腳穩定、適合團課；中腳上下床方便、可加半高架；高腳教練協助不用彎腰。",
  "彈簧": "皮拉提斯的阻力來源。德國彈簧張力穩定耐用；韓國彈簧 CP 值高。",
  "軌道": "全軌道滑動更順、行程更長，站姿與跳躍動作表現更好。",
  "擴充": "可以先買平床，日後再加購套件升級。",
  "中孔直徑": "50 mm 左右是「奧林匹克規格」，可以套在標準 2.2 m 長槓上。",
  "重量誤差": "實際重量和標示的差距，越小越精準。",
  "承重": "架子最多可以放多重的東西。",
  "握把直徑": "握把粗細，手小的人選細一點比較好握。",
  "天花板": "架高的器材需要足夠的天花板高度，購買前請先量。",
  "安裝": "固定在牆上的器材需要結構夠堅固的牆面。",
};

/* ===== Header / Footer / FAB ===== */
function renderChrome(active) {
  const links = [["catalog.html", "器材總覽", "catalog"], ["pilates.html", "皮拉提斯", "pilates"], ["guide.html", "新手指南", "guide"], ["inquiry.html", "詢價清單", "inquiry"]];
  const nav = links.map(([h, t, k]) => `<a href="${h}" class="${k === active ? "active" : ""}">${t}</a>`).join("");
  document.body.insertAdjacentHTML("afterbegin", `
  <header class="site-header"><div class="wrap nav">
    <a class="logo" href="index.html">${ICON.logo}${esc(CONFIG.siteName)}<small>${esc(CONFIG.siteNameZh)}</small></a>
    <nav class="nav-links">${nav}</nav>
    <a class="pill pill-white" href="${CONFIG.line}" target="_blank" rel="noopener">私訊詢價</a>
    <button class="menu-btn" aria-label="選單">${ICON.menu}</button>
  </div></header>
  <div class="mobile-menu">${nav}<a class="pill pill-white" href="${CONFIG.line}" target="_blank" rel="noopener">LINE 私訊詢價</a></div>`);
  $(".menu-btn").onclick = () => $(".mobile-menu").classList.toggle("open");
  const hdr = $(".site-header"); const onS = () => hdr.classList.toggle("scrolled", scrollY > 20); onS(); addEventListener("scroll", onS, { passive: true });

  const cats = CATEGORIES.map((c) => `<li><a href="catalog.html?c=${c.id}">${c.name}</a></li>`).join("") + `<li><a href="pilates.html">皮拉提斯器械</a></li>`;
  document.body.insertAdjacentHTML("beforeend", `
  <footer class="site-footer"><div class="wrap">
    <div class="foot-grid">
      <div><a class="logo" href="index.html">${ICON.logo}${esc(CONFIG.siteName)}</a>
        <p class="muted" style="max-width:360px;margin-top:12px">商用與家用健身器材型錄。看不懂沒關係，把喜歡的器材加入詢價清單，私訊我們幫你規劃。</p></div>
      <div><h4>器材分類</h4><ul>${cats}</ul></div>
      <div><h4>聯絡我們</h4><ul>
        <li><a href="${CONFIG.line}" target="_blank" rel="noopener">LINE 官方帳號</a></li>
        <li><a href="${CONFIG.instagram}" target="_blank" rel="noopener">Instagram</a></li>
        <li><a href="${CONFIG.facebook}" target="_blank" rel="noopener">Facebook</a></li>
        ${CONFIG.phone ? `<li><a href="tel:${CONFIG.phone}">${esc(CONFIG.phone)}</a></li>` : ""}
        <li><a href="guide.html">新手指南</a></li></ul></div>
    </div>
    <p class="note">所有器材價格依款式、顏色、數量與運送安裝條件而定，請私訊詢問。產品圖片與規格取自原廠型錄，實際以原廠出貨為準。</p>
  </div></footer>
  <div class="fab">
    <a href="inquiry.html" aria-label="詢價清單">${ICON.list}<span class="num inq-num"></span></a>
    <a href="${CONFIG.line}" target="_blank" rel="noopener" aria-label="私訊詢價">${ICON.chat}</a>
  </div>`);
  updateBadge();
}

/* ===== 產品卡片 ===== */
function card(p) {
  const fp = footprint(p);
  const chips = [
    p.level === "easy" ? `<span class="chip green">新手友善</span>` : `<span class="chip">${LEVEL[p.level]}</span>`,
    p.place.includes("home") ? `<span class="chip hl">家用OK</span>` : "",
    fp ? `<span class="chip">約 ${fmt(fp.ping)} 坪</span>` : "",
  ].join("");
  const on = Inq.has(p.id);
  return `<article class="p-card reveal">
    <a href="product.html?id=${p.id}" class="ph ${isCream(p) ? "cream" : ""}">${p.hot ? '<span class="badge">熱門</span>' : ""}<img src="${p.img}" alt="${esc(p.name)}" loading="lazy"></a>
    <div class="body">
      <div class="meta">${esc(p.brand)} · ${esc(p.model)}</div>
      <a href="product.html?id=${p.id}"><h3>${esc(p.name)}</h3></a>
      <p class="plain">${esc(p.plain)}</p>
      <div class="chips">${chips}</div>
      <div class="foot"><span class="price-ask">價格<b>私訊詢問</b></span>
        <button class="add-btn ${on ? "on" : ""}" data-add="${p.id}" aria-label="加入詢價清單">${on ? ICON.check : ICON.plus}</button></div>
    </div></article>`;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-add]"); if (!b) return;
  e.preventDefault();
  const on = Inq.toggle(b.dataset.add);
  document.querySelectorAll(`[data-add="${b.dataset.add}"]`).forEach((x) => {
    x.classList.toggle("on", on);
    if (x.classList.contains("add-btn")) x.innerHTML = on ? ICON.check : ICON.plus;
    else x.textContent = on ? "✓ 已在詢價清單" : "＋ 加入詢價清單";
  });
});

function reveal() {
  if (location.hash.includes("static")) { document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in")); return; }
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -40px" }) : null;
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
}

/* ===== 各頁面 ===== */
const Pages = {
  home() {
    $("#cats").innerHTML = CATEGORIES.map((c) => `
      <a class="cat-card reveal" href="catalog.html?c=${c.id}">
        <span class="count">${PRODUCTS.filter((p) => p.cat === c.id).length} 款</span>
        <div class="ph"><img src="${c.img}" alt="${c.name}" loading="lazy"></div>
        <div class="info"><div class="en">${c.en}</div><h3>${c.name}</h3><p>${c.short}</p></div></a>`).join("");
    $("#hot").innerHTML = PRODUCTS.filter((p) => p.hot).slice(0, 8).map(card).join("");
  },

  catalog() {
    let cat = qs("c") || "all", place = "all", easy = false, kw = "";
    const tabs = [["all", "全部"], ...CATEGORIES.map((c) => [c.id, c.name])];
    $("#tabs").innerHTML = tabs.map(([id, t]) => `<button class="tab" data-c="${id}">${t}</button>`).join("");
    const draw = () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.c === cat));
      const c = catOf(cat);
      $("#pageTitle").textContent = c ? c.name : "全部器材";
      $("#pageSub").textContent = c ? c.short : "依照用途分類，每台都有白話說明、佔地換算。喜歡就加入詢價清單。";
      if (c) $(".hero-bg").style.backgroundImage = $(".hero-blur").style.backgroundImage = `url(${c.cover})`;
      $("#intro").innerHTML = c ? `<div class="cat-intro"><div><div class="eyebrow">${c.en}</div><h2>這類器材是什麼？</h2><p>${c.intro}</p></div>
        <div class="pc"><div><h4>👍 優點</h4><ul>${c.pros.map((x) => `<li>${x}</li>`).join("")}</ul></div><div><h4>🤔 要注意</h4><ul>${c.cons.map((x) => `<li>${x}</li>`).join("")}</ul></div></div></div>` : "";
      const k = kw.trim().toLowerCase();
      const list = PRODUCTS.filter((p) => (cat === "all" || p.cat === cat) && (place === "all" || p.place.includes(place)) && (!easy || p.level === "easy") &&
        (!k || (p.name + p.model + p.brand + p.plain + p.muscles.join("")).toLowerCase().includes(k)));
      $("#count").textContent = `共 ${list.length} 款`;
      $("#grid").innerHTML = list.length ? list.map(card).join("") : `<div class="empty" style="grid-column:1/-1">沒有符合的器材，換個條件試試，或直接私訊我們找找看。</div>`;
      reveal();
      const u = new URL(location); cat === "all" ? u.searchParams.delete("c") : u.searchParams.set("c", cat); history.replaceState(null, "", u);
    };
    $("#tabs").onclick = (e) => { const t = e.target.closest(".tab"); if (t) { cat = t.dataset.c; draw(); } };
    $("#place").onclick = (e) => { const b = e.target.closest("button"); if (!b) return; place = b.dataset.v; document.querySelectorAll("#place button").forEach((x) => x.classList.toggle("on", x === b)); draw(); };
    $("#easy").onclick = (e) => { easy = !easy; e.currentTarget.classList.toggle("on", easy); draw(); };
    $("#kw").oninput = (e) => { kw = e.target.value; draw(); };
    draw();
    const at = $(".tab.active"); if (at) at.scrollIntoView({ inline: "center", block: "nearest" });
  },

  product() {
    const p = byId(qs("id")) || PRODUCTS[0]; const c = catOf(p.cat); const fp = footprint(p);
    document.title = `${p.name}｜${CONFIG.siteName}`;
    const who = [LEVEL[p.level], ...p.place.map((x) => PLACE[x] + "適用")].map((t, i) => `<span class="chip ${i === 0 && p.level === "easy" ? "green" : "hl"}">${t}</span>`).join("");
    const muscles = ["胸", "背", "肩", "手臂", "核心", "臀", "腿", "心肺"].map((m) => `<span class="${p.muscles.includes(m) || p.muscles.includes("全身") ? "on" : ""}">${m}</span>`).join("");
    const specs = { ...(p.size ? { "整機尺寸": `寬 ${p.size[0]} × 深 ${p.size[1]} × 高 ${p.size[2]} mm` } : {}), ...p.specs };
    const rows = Object.entries(specs).map(([k, v]) => `<tr><th>${esc(k)}${GLOSS[k] ? `<span class="hint">${GLOSS[k]}</span>` : ""}</th><td>${esc(v)}</td></tr>`).join("");
    const on = Inq.has(p.id);
    $("#pd").innerHTML = `
      <div class="crumb"><a href="catalog.html">器材總覽</a> / <a href="catalog.html?c=${c.id}">${c.name}</a> / ${esc(p.name)}</div>
      <div class="pd">
        <div class="pd-img ${isCream(p) ? "cream" : ""}"><img src="${p.img}" alt="${esc(p.name)}"></div>
        <div>
          <div class="eyebrow">${esc(p.brand)} · ${esc(p.model)}</div>
          <h1>${esc(p.name)}</h1>
          <p class="lead">${esc(p.plain)}</p>
          <div class="who">${who}</div>
          <div class="ask-box"><div><div class="lbl">價格</div><div class="val">私訊詢問</div><div class="lbl">依顏色、數量、運送安裝條件報價</div></div>
            <div class="ask-actions"><button class="pill pill-dark" data-add="${p.id}">${on ? "✓ 已在詢價清單" : "＋ 加入詢價清單"}</button>
            <a class="pill pill-orange" href="${CONFIG.line}" target="_blank" rel="noopener">LINE 私訊</a></div></div>
          ${p.muscles.length ? `<div class="info-block"><h3><span class="ic">💪</span>練到哪裡</h3><div class="body-map">${muscles}</div></div>` : ""}
          ${fp ? `<div class="info-block"><h3><span class="ic">📐</span>需要多大空間</h3><div class="space">
            <div><small>機器本身</small><b>${fmt(fp.m2)} m²</b><small>約 ${fmt(fp.ping)} 坪</small></div>
            <div><small>含使用空間（四周各留 60 cm）</small><b>${fmt(fp.use)} m²</b><small>約 ${fmt(fp.usePing)} 坪</small></div></div>
            <p class="muted" style="font-size:13px;margin:10px 0 0">高度 ${(p.size[2] / 10).toFixed(0)} cm，${p.size[2] >= 2100 ? "請先確認天花板高度（建議比機器高 20 cm 以上）。" : "一般住家天花板都放得下。"}</p></div>` : ""}
          <div class="info-block"><h3><span class="ic">📋</span>規格</h3><table class="spec-table">${rows}</table></div>
        </div>
      </div>`;
    const rel = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
    $("#relTitle").textContent = `其他${c.name}`; $("#relLink").href = `catalog.html?c=${c.id}`;
    $("#rel").innerHTML = rel.map(card).join("");
  },

  guide() {
    document.querySelectorAll("[data-set]").forEach((ul) => {
      ul.innerHTML = ul.dataset.set.split(",").map((id) => byId(id)).filter(Boolean)
        .map((p) => `<li><a href="product.html?id=${p.id}"><img src="${p.img}" alt="">${esc(p.name)}</a></li>`).join("");
    });
    document.querySelectorAll("[data-addset]").forEach((b) => (b.onclick = () => {
      const l = Inq.get(); b.dataset.addset.split(",").forEach((id) => { if (!l.some((x) => x.id === id)) l.push({ id, q: 1 }); });
      Inq.set(l); toast("整組已加入詢價清單");
    }));
  },

  pilates() {
    const items = plItems();
    $("#st-items").textContent = items.length;
    let cat = "all", q = "";
    const tagCls = (t) => (["可加半高架", "半高架", "升級套件"].includes(t) ? "tag-up" : ["高CP", "熱銷"].includes(t) ? "tag-hl" : "");
    const draw = () => {
      const n = q.trim().toLowerCase(); let out = "";
      for (const s of PL_SERIES) {
        if (cat !== "all" && s.cat !== cat) continue;
        const list = items.filter((p) => p.series === s && (!n || (p.model + " " + p.name + " " + p.tags.join(" ") + " " + s.zh).toLowerCase().includes(n)));
        if (!list.length) continue;
        out += `<div class="pl-series reveal"><div class="pl-series-head"><div><div class="eyebrow">${esc(PL_CATLABEL[s.cat])}</div><h3><span class="disp">${esc(s.en)}</span>${esc(s.zh)}</h3><div class="tl">${esc(s.tagline)}</div></div><p>${esc(s.intro)}</p></div><div class="grid">` +
          list.map((p) => { const on = Inq.has(p.id); return `<article class="p-card">
            <div class="ph cream-contain"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"></div>
            <div class="body"><div class="meta">elina · ${esc(p.model)}</div><h3>${esc(p.name)}</h3>
            <ul class="pl-specs">${p.specs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
            <div class="chips">${p.tags.map((t) => `<span class="chip ${tagCls(t) === "tag-up" ? "hl" : tagCls(t) === "tag-hl" ? "green" : ""}">${esc(t)}</span>`).join("")}</div>
            <div class="foot"><span class="price-ask">價格<b>私訊詢問</b></span><button class="add-btn ${on ? "on" : ""}" data-add="${p.id}" aria-label="加入詢價清單">${on ? ICON.check : ICON.plus}</button></div></div></article>`; }).join("") + `</div></div>`;
      }
      $("#plCatalog").innerHTML = out || `<div class="empty">找不到符合「${esc(q)}」的器械，換個關鍵字試試。</div>`;
      $("#plAcc").hidden = !(cat === "all" && !n);
      document.querySelectorAll("#plChips .tab").forEach((b) => b.classList.toggle("active", b.dataset.cat === cat));
      reveal();
    };
    $("#plChips").onclick = (e) => { const b = e.target.closest(".tab"); if (b) { cat = b.dataset.cat; draw(); } };
    $("#plQ").oninput = (e) => { q = e.target.value; draw(); };
    document.querySelectorAll(".pl-tabs button").forEach((b) => (b.onclick = () => {
      document.querySelectorAll(".pl-tabs button").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      document.querySelectorAll(".plan").forEach((p) => (p.hidden = p.id !== "plan-" + b.dataset.plan));
    }));
    draw();
  },

  inquiry() {
    const st = { place: "", size: "", area: "", note: "", name: "" };
    const draw = () => {
      const l = Inq.get().filter((x) => byId(x.id));
      $("#list").innerHTML = l.length ? l.map((x) => { const p = byId(x.id); return `
        <div class="inq-item"><img src="${p.img}" alt=""><div class="t"><a href="product.html?id=${p.id}"><b>${esc(p.name)}</b></a><small>${esc(p.brand)} · ${esc(p.model)}</small></div>
        <div class="qty"><button data-q="${p.id}" data-d="-1">−</button><span>${x.q}</span><button data-q="${p.id}" data-d="1">＋</button></div>
        <button class="rm" data-rm="${p.id}">移除</button></div>`; }).join("")
        : `<div class="empty" style="background:var(--card);border-radius:20px;border:1px solid var(--line)">清單還是空的<br><br><a class="pill pill-orange" href="catalog.html">去逛器材</a></div>`;
      const lines = l.map((x, i) => { const p = byId(x.id); return `${i + 1}. ${p.name}（${p.brand} ${p.model}）× ${x.q}`; });
      const msg = `您好，我想詢問以下器材的價格：\n${lines.length ? lines.join("\n") : "（尚未選擇器材，想請你們推薦）"}\n\n` +
        `・使用場地：${st.place || "未填"}\n・空間大小：${st.size || "未填"}\n・所在地區：${st.area || "未填"}\n` + (st.note ? `・其他需求：${st.note}\n` : "") + (st.name ? `\n稱呼：${st.name}` : "");
      $("#msg").textContent = msg;
      return msg;
    };
    $("#list").onclick = (e) => {
      const l = Inq.get(); const q = e.target.closest("[data-q]"); const r = e.target.closest("[data-rm]");
      if (q) { const it = l.find((x) => x.id === q.dataset.q); it.q = Math.max(1, Math.min(99, it.q + +q.dataset.d)); Inq.set(l); }
      if (r) Inq.set(l.filter((x) => x.id !== r.dataset.rm));
      draw();
    };
    $("#placeOpt").onclick = (e) => { const b = e.target.closest("button"); if (!b) return; st.place = b.textContent; document.querySelectorAll("#placeOpt button").forEach((x) => x.classList.toggle("on", x === b)); draw(); };
    ["size", "area", "note", "name"].forEach((k) => ($("#f-" + k).oninput = (e) => { st[k] = e.target.value; draw(); }));
    const copy = async () => {
      const m = draw();
      try { await navigator.clipboard.writeText(m); toast("訊息已複製，貼到聊天視窗即可"); }
      catch { const t = document.createElement("textarea"); t.value = m; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); toast("訊息已複製"); } catch { toast("請手動複製下方訊息"); } t.remove(); }
    };
    $("#copy").onclick = copy;
    document.querySelectorAll("[data-go]").forEach((a) => { a.href = CONFIG[a.dataset.go]; a.onclick = () => copy(); });
    $("#clear").onclick = () => { if (confirm("確定清空詢價清單？")) { Inq.set([]); draw(); } };
    draw();
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  renderChrome(page);
  Pages[page] && Pages[page]();
  reveal();
});
