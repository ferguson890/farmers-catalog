/* ============================================================
   farmer.js — страница одного производителя (farmer.html?id=...)
   ============================================================ */
(function () {
  "use strict";

  var DATA_URL = "data/farmers.json";

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  var qs = function (k) {
    return new URLSearchParams(window.location.search).get(k);
  };

  function icon(name) {
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

  function notFound(msg) {
    document.title = "Производитель не найден — Каталог АРНО";
    $("fp").innerHTML = '<div style="padding:80px 0;text-align:center">' +
      '<div style="font-family:Playfair Display,serif;font-size:54px;color:#CBBFA8;font-style:italic">∅</div>' +
      '<h1 style="font-family:Playfair Display,serif;font-size:26px;color:#9E9082;font-style:italic;margin:10px 0">' +
      esc(msg || "Производитель не найден") + "</h1>" +
      '<a class="fp-back" href="index.html">← Вернуться в каталог</a></div>';
  }

  function render(f) {
    document.title = f.name + " — Каталог производителей АРНО";
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute("content", f.shortDesc || f.name);

    var cover = f.photo
      ? '<img src="' + esc(f.photo) + '" alt="' + esc(f.name) + '" ' +
        "onerror=\"this.outerHTML='<div class=fp-cover-fallback>" + esc(f.icon) + "</div>'\">"
      : '<div class="fp-cover-fallback">' + esc(f.icon) + "</div>";

    var meta = '<div class="fp-meta-item">' + icon("pin") + "<span>" + esc(f.address || f.district) + "</span></div>";
    if (f.since) meta += '<div class="fp-meta-item">' + icon("cal") + "<span>Работает с " + esc(f.since) + " года</span></div>";

    var tags = (f.products || []).map(function (p) {
      return '<span class="fp-tag">' + esc(p) + "</span>";
    }).join("");

    var highlights = (f.highlights || []).map(function (h) {
      return "<li>" + esc(h) + "</li>";
    }).join("");

    // Контакты
    var contacts = "";
    (f.phones && f.phones.length ? f.phones : [f.phone]).forEach(function (ph) {
      if (ph) contacts += '<a class="fp-phone" href="tel:' + esc(ph.replace(/[^\d+]/g, "")) + '">' + esc(ph) + "</a>";
    });
    if (f.website) {
      var wsClean = f.website.replace(/^https?:\/\//, "").replace(/\/$/, "");
      contacts += '<div class="fp-row">' + icon("web") + '<a href="' + esc(f.website) + '" target="_blank" rel="noopener">' + esc(wsClean) + "</a></div>";
    }
    if (f.email) contacts += '<div class="fp-row">' + icon("mail") + '<a href="mailto:' + esc(f.email) + '">' + esc(f.email) + "</a></div>";
    if (f.social && f.social.vk) contacts += '<div class="fp-row">' + icon("chat") + '<a href="' + esc(f.social.vk) + '" target="_blank" rel="noopener">ВКонтакте</a></div>';
    if (f.social && f.social.telegram) contacts += '<div class="fp-row">' + icon("chat") + '<a href="' + esc(f.social.telegram) + '" target="_blank" rel="noopener">Telegram</a></div>';
    if (f.social && f.social.other) f.social.other.forEach(function (o) {
      contacts += '<div class="fp-row">' + icon("chat") + "<span>" + esc(o) + "</span></div>";
    });
    if (f.map) contacts += '<div class="fp-row">' + icon("map") + '<a href="' + esc(f.map) + '" target="_blank" rel="noopener">На карте</a></div>';

    var gallery = "";
    if (f.gallery && f.gallery.length) {
      gallery = '<div class="fp-section"><div class="fp-lbl">Фотогалерея</div><div class="fp-gallery">' +
        f.gallery.map(function (g) { return '<img src="' + esc(g) + '" alt="' + esc(f.name) + '" loading="lazy">'; }).join("") +
        "</div></div>";
    }

    var html =
      '<a class="fp-back" href="index.html">← Все производители</a>' +
      '<div class="fp-cover">' + cover + "</div>" +
      '<div class="fp-head">' +
        '<div class="fp-eyebrow">' + esc(f.icon) + " " + esc(f.categoryLabel) + "</div>" +
        '<h1 class="fp-name">' + esc(f.name) + "</h1>" +
        '<div class="fp-owner">' + esc(f.owner) + "</div>" +
        '<div class="fp-meta">' + meta + "</div>" +
      "</div>" +
      '<div class="fp-section"><div class="fp-lbl">О производстве</div>' +
        '<p class="fp-text">' + esc(f.description) + "</p></div>" +
      (f.founderStory ? '<div class="fp-section"><div class="fp-lbl">Основатель</div>' +
        '<p class="fp-text">' + esc(f.founderStory) + "</p></div>" : "") +
      '<div class="fp-section"><div class="fp-lbl">Продукция</div>' +
        '<div class="fp-tags" style="margin-bottom:16px">' + tags + "</div>" +
        '<p class="fp-text">' + esc(f.productsDetail || "") + "</p></div>" +
      (highlights ? '<div class="fp-section"><div class="fp-lbl">Преимущества</div>' +
        '<ul class="fp-highlights">' + highlights + "</ul></div>" : "") +
      gallery +
      '<div class="fp-section"><div class="fp-lbl">Контакты</div>' +
        '<div class="fp-contacts">' + contacts + "</div></div>";

    $("fp").innerHTML = html;
  }

  var id = qs("id");
  if (!id) { notFound("Не указан производитель"); return; }

  fetch(DATA_URL)
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var f = (data.farmers || []).filter(function (x) { return x.id === id; })[0];
      if (!f) return notFound();
      render(f);
    })
    .catch(function () { notFound("Не удалось загрузить данные"); });
})();
