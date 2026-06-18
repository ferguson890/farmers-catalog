/* ============================================================
   catalog.js — рендер каталога из data/farmers.json
   Без зависимостей. Работает на статике (Tilda / GitHub Pages).
   ============================================================ */
(function () {
  "use strict";

  // Путь к данным относительно index.html. На Tilda заменить на абсолютный URL.
  var DATA_URL = "data/farmers.json";
  // Базовый путь к странице фермера. На Tilda переопределяется через
  // window.ARNO_FARMER_PAGE (см. собранный блок), локально — farmer.html.
  var FARMER_PAGE = (typeof window !== "undefined" && window.ARNO_FARMER_PAGE) || "farmer.html";

  var state = { farmers: [], categories: [], activeCat: "all", query: "" };

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  function pinIcon() {
    return '<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  }

  function catLabel(slug) {
    for (var i = 0; i < state.categories.length; i++)
      if (state.categories[i].slug === slug) return state.categories[i].label;
    return slug;
  }
  function catIcon(slug) {
    for (var i = 0; i < state.categories.length; i++)
      if (state.categories[i].slug === slug) return state.categories[i].icon;
    return "";
  }

  function getFiltered() {
    var q = state.query.trim().toLowerCase();
    return state.farmers.filter(function (f) {
      var catOk = state.activeCat === "all" || f.category === state.activeCat;
      if (!q) return catOk;
      var fields = [f.name, f.owner, f.district, f.shortDesc, f.categoryLabel]
        .concat(f.products || []);
      var searchOk = fields.some(function (s) {
        return String(s || "").toLowerCase().indexOf(q) !== -1;
      });
      return catOk && searchOk;
    });
  }

  function renderTabs() {
    var tabs = $("tabs");
    tabs.innerHTML = state.categories.map(function (c) {
      var on = c.slug === state.activeCat ? " on" : "";
      return '<button class="ftab' + on + '" data-cat="' + esc(c.slug) + '">' +
        esc(c.nav || c.label) + "</button>";
    }).join("");
  }

  function cardHTML(f, i) {
    var delay = i * 55;
    var tags = (f.products || []).slice(0, 4).map(function (p) {
      return '<span class="card-tag">' + esc(p) + "</span>";
    }).join("");
    var href = FARMER_PAGE + "?id=" + encodeURIComponent(f.id);
    var img = f.photo
      ? '<img src="' + esc(f.photo) + '" alt="' + esc(f.name) + '" loading="lazy" ' +
        "onerror=\"this.outerHTML='<div class=card-photo-fallback>" + esc(f.icon) + "</div>'\">"
      : '<div class="card-photo-fallback">' + esc(f.icon) + "</div>";

    return '<article class="card" style="animation-delay:' + delay + 'ms">' +
      '<a class="card-link" href="' + href + '" data-id="' + esc(f.id) + '">' +
        '<div class="card-photo">' + img +
          '<div class="card-badge">' + esc(f.icon) + " " + esc(f.categoryLabel) + "</div>" +
        "</div>" +
        '<div class="card-body">' +
          '<div class="card-name">' + esc(f.name) + "</div>" +
          '<div class="card-owner">' + esc(f.owner) + "</div>" +
          '<div class="card-district">' + pinIcon() + esc(f.district) + "</div>" +
          '<div class="card-desc">' + esc(f.shortDesc) + "</div>" +
          '<div class="card-tags">' + tags + "</div>" +
        "</div>" +
      "</a>" +
      '<div class="card-foot">' +
        '<a href="tel:' + esc(f.phone.replace(/[^\d+]/g, "")) + '" class="card-phone">' + esc(f.phone) + "</a>" +
        '<a class="card-more" href="' + href + '" data-id="' + esc(f.id) + '">Подробнее <span class="card-arrow"></span></a>' +
      "</div>" +
    "</article>";
  }

  /* ---------- Модалка производителя (на той же странице) ---------- */

  function detailIcon(name) {
    var p = {
      pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
      cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
      phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
      web: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>',
      mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
      chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
      map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>'
    };
    return '<svg viewBox="0 0 24 24">' + (p[name] || "") + "</svg>";
  }

  function findFarmer(id) {
    for (var i = 0; i < state.farmers.length; i++)
      if (state.farmers[i].id === id) return state.farmers[i];
    return null;
  }

  function renderDetail(f) {
    var cover = f.photo
      ? '<img src="' + esc(f.photo) + '" alt="' + esc(f.name) + '" ' +
        "onerror=\"this.outerHTML='<div class=fp-cover-fallback>" + esc(f.icon) + "</div>'\">"
      : '<div class="fp-cover-fallback">' + esc(f.icon) + "</div>";

    var meta = '<div class="fp-meta-item">' + detailIcon("pin") + "<span>" + esc(f.address || f.district) + "</span></div>";
    if (f.since) meta += '<div class="fp-meta-item">' + detailIcon("cal") + "<span>Работает с " + esc(f.since) + " года</span></div>";

    var tags = (f.products || []).map(function (p) {
      return '<span class="fp-tag">' + esc(p) + "</span>";
    }).join("");
    var hl = (f.highlights || []).map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("");

    var contacts = "";
    (f.phones && f.phones.length ? f.phones : [f.phone]).forEach(function (ph) {
      if (ph) contacts += '<a class="fp-phone" href="tel:' + esc(ph.replace(/[^\d+]/g, "")) + '">' + esc(ph) + "</a>";
    });
    if (f.website) {
      var ws = f.website.replace(/^https?:\/\//, "").replace(/\/$/, "");
      contacts += '<div class="fp-row">' + detailIcon("web") + '<a href="' + esc(f.website) + '" target="_blank" rel="noopener">' + esc(ws) + "</a></div>";
    }
    if (f.email) contacts += '<div class="fp-row">' + detailIcon("mail") + '<a href="mailto:' + esc(f.email) + '">' + esc(f.email) + "</a></div>";
    if (f.social && f.social.vk) contacts += '<div class="fp-row">' + detailIcon("chat") + '<a href="' + esc(f.social.vk) + '" target="_blank" rel="noopener">ВКонтакте</a></div>';
    if (f.social && f.social.telegram) contacts += '<div class="fp-row">' + detailIcon("chat") + '<a href="' + esc(f.social.telegram) + '" target="_blank" rel="noopener">Telegram</a></div>';
    if (f.social && f.social.other) f.social.other.forEach(function (o) {
      contacts += '<div class="fp-row">' + detailIcon("chat") + "<span>" + esc(o) + "</span></div>";
    });
    if (f.map) contacts += '<div class="fp-row">' + detailIcon("map") + '<a href="' + esc(f.map) + '" target="_blank" rel="noopener">На карте</a></div>';

    var gallery = "";
    if (f.gallery && f.gallery.length) {
      gallery = '<div class="fp-section"><div class="fp-lbl">Фотогалерея</div><div class="fp-gallery">' +
        f.gallery.map(function (g) { return '<img src="' + esc(g) + '" alt="' + esc(f.name) + '" loading="lazy">'; }).join("") +
        "</div></div>";
    }

    return '<div class="fpm-cover">' + cover + "</div>" +
      '<div class="fpm-body">' +
        '<div class="fp-eyebrow">' + esc(f.icon) + " " + esc(f.categoryLabel) + "</div>" +
        '<h2 class="fp-name">' + esc(f.name) + "</h2>" +
        '<div class="fp-owner">' + esc(f.owner) + "</div>" +
        '<div class="fp-meta">' + meta + "</div>" +
        '<div class="fp-section"><div class="fp-lbl">О производстве</div><p class="fp-text">' + esc(f.description) + "</p></div>" +
        (f.founderStory ? '<div class="fp-section"><div class="fp-lbl">Основатель</div><p class="fp-text">' + esc(f.founderStory) + "</p></div>" : "") +
        '<div class="fp-section"><div class="fp-lbl">Продукция</div><div class="fp-tags" style="margin-bottom:16px">' + tags + '</div><p class="fp-text">' + esc(f.productsDetail || "") + "</p></div>" +
        (hl ? '<div class="fp-section"><div class="fp-lbl">Преимущества</div><ul class="fp-highlights">' + hl + "</ul></div>" : "") +
        gallery +
        '<div class="fp-section"><div class="fp-lbl">Контакты</div><div class="fp-contacts">' + contacts + "</div></div>" +
      "</div>";
  }

  var modalEl = null;
  function ensureModal() {
    if (modalEl) return modalEl;
    // Обёртка с id="arno-catalog" восстанавливает контекст стилей (#arno-catalog …),
    // а вешаем её на <body> — чтобы position:fixed не ломался transform-родителями Tilda.
    var wrap = document.createElement("div");
    wrap.id = "arno-catalog";
    wrap.setAttribute("data-arno-modal", "");
    modalEl = document.createElement("div");
    modalEl.className = "fp-modal";
    modalEl.setAttribute("hidden", "");
    modalEl.innerHTML =
      '<div class="fp-modal-overlay" data-close="1"></div>' +
      '<div class="fp-modal-panel">' +
        '<button class="fp-modal-close" type="button" data-close="1" aria-label="Закрыть">&times;</button>' +
        '<div class="fp-modal-content"></div>' +
      "</div>";
    wrap.appendChild(modalEl);
    document.body.appendChild(wrap);
    modalEl.addEventListener("click", function (e) {
      if (e.target.getAttribute && e.target.getAttribute("data-close")) closeModal();
    });
    return modalEl;
  }
  function openModal(f) {
    var m = ensureModal();
    m.querySelector(".fp-modal-content").innerHTML = renderDetail(f);
    m.removeAttribute("hidden");
    m.scrollTop = 0;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    if (!modalEl) return;
    modalEl.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  function render() {
    var list = getFiltered();
    $("count").textContent = list.length;
    if ($("hero-count")) $("hero-count").textContent = state.farmers.length;
    var grid = $("grid");
    if (!list.length) {
      grid.innerHTML = '<div class="empty"><div class="empty-icon">∅</div>' +
        '<div class="empty-title">Ничего не найдено</div>' +
        '<div class="empty-sub">Попробуйте другой запрос или категорию</div></div>';
      return;
    }
    grid.innerHTML = list.map(cardHTML).join("");
  }

  function bind() {
    $("tabs").addEventListener("click", function (e) {
      var btn = e.target.closest(".ftab");
      if (!btn) return;
      state.activeCat = btn.dataset.cat;
      renderTabs();
      render();
    });
    var search = $("search");
    if (search) search.addEventListener("input", function () {
      state.query = this.value; render();
    });
    // Клик по карточке открывает модалку (без перехода на отдельную страницу).
    $("grid").addEventListener("click", function (e) {
      var a = e.target.closest("a.card-link, a.card-more");
      if (!a) return;
      e.preventDefault();
      var f = findFarmer(a.getAttribute("data-id"));
      if (f) openModal(f);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.keyCode === 27) closeModal();
    });
  }

  function init(data) {
    state.farmers = data.farmers || [];
    state.categories = data.categories || [];
    if ($("hero-total")) $("hero-total").textContent = state.farmers.length;
    if ($("hero-cats")) $("hero-cats").textContent = Math.max(0, state.categories.length - 1);
    renderTabs();
    bind();
    render();
  }

  // window.FARMERS_DATA можно встроить инлайном (для Tilda без fetch).
  if (window.FARMERS_DATA) { init(window.FARMERS_DATA); return; }

  fetch(DATA_URL)
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(init)
    .catch(function (err) {
      $("grid").innerHTML = '<div class="empty"><div class="empty-icon">!</div>' +
        '<div class="empty-title">Не удалось загрузить данные</div>' +
        '<div class="empty-sub">' + esc(String(err)) +
        " — запустите через локальный сервер или проверьте путь к farmers.json</div></div>";
    });
})();
