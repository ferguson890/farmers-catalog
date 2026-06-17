/* ============================================================
   catalog.js — рендер каталога из data/farmers.json
   Без зависимостей. Работает на статике (Tilda / GitHub Pages).
   ============================================================ */
(function () {
  "use strict";

  // Путь к данным относительно index.html. На Tilda заменить на абсолютный URL.
  var DATA_URL = "data/farmers.json";
  // Базовый путь к странице фермера.
  var FARMER_PAGE = "farmer.html";

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
      '<a class="card-link" href="' + href + '">' +
        '<div class="card-photo">' + img +
          '<span class="card-since">' + (f.since ? "с " + esc(f.since) : "") + "</span>" +
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
        '<a class="card-more" href="' + href + '">Подробнее <span class="card-arrow"></span></a>' +
      "</div>" +
    "</article>";
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
