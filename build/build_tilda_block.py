# -*- coding: utf-8 -*-
"""
Сборка единого HTML-блока для вставки в Tilda (блок T123 «HTML-код»).

Берёт styles.css / catalog.js / farmers.json + тело index.html (hero+filter+main),
изолирует все CSS-правила в контейнере #arno-catalog (чтобы не сломать остальную
страницу Tilda) и встраивает данные инлайном (без fetch / без CORS).

Запуск:  python build/build_tilda_block.py
Результат: dist/tilda-catalog-block.html
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCOPE = "#arno-catalog"
FARMER_PAGE = "/farmer"   # адрес будущей страницы фермера в Tilda

# CDN (jsDelivr) — раздаёт файлы публичного GitHub-репозитория.
# Стили, скрипт и фото грузятся отсюда, поэтому Tilda-блок остаётся лёгким.
# GH_REF можно зафиксировать на конкретный коммит: GH_REF=<sha> python build/...
GH_USER = "ferguson890"
GH_REPO = "farmers-catalog"
GH_REF = os.environ.get("GH_REF", "main")
CDN = "https://cdn.jsdelivr.net/gh/%s/%s@%s" % (GH_USER, GH_REPO, GH_REF)


def read(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return f.read()

# ---------- 1. Изоляция CSS в #arno-catalog ----------

def strip_comments(css):
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)

def prefix_selector_list(sel):
    """Префиксует список селекторов (через запятую) контейнером."""
    out = []
    for s in sel.split(","):
        s = s.strip()
        if not s:
            continue
        if s == "html":
            # html{scroll-behavior} — глобально не нужно, пропускаем
            continue
        if s == "body":
            out.append(SCOPE)
        elif s == "*":
            out.append(SCOPE)
            out.append(SCOPE + " *")
        elif s.startswith("*::"):
            out.append(SCOPE + " " + s)        # *::before -> #arno-catalog *::before
        else:
            out.append(SCOPE + " " + s)
    return ", ".join(out)

def scope_block(selector, body):
    sel = prefix_selector_list(selector)
    if not sel:
        return ""
    return sel + "{" + body.strip() + "}\n"

def transform(css):
    css = strip_comments(css)
    i, n = 0, len(css)
    out = []
    while i < n:
        # читаем до '{'
        j = css.find("{", i)
        if j == -1:
            break
        head = css[i:j].strip()

        if head.startswith("@keyframes") or head.startswith("@font-face"):
            # копируем блок целиком без префиксов (имя анимации остаётся глобальным)
            depth, k = 0, j
            while k < n:
                if css[k] == "{": depth += 1
                elif css[k] == "}":
                    depth -= 1
                    if depth == 0:
                        k += 1
                        break
                k += 1
            out.append(css[i:k].strip() + "\n")
            i = k
            continue

        if head.startswith("@media") or head.startswith("@supports"):
            # вложенный блок: префиксуем внутренние селекторы
            inner_start = j + 1
            depth, k = 1, inner_start
            while k < n and depth > 0:
                if css[k] == "{": depth += 1
                elif css[k] == "}": depth -= 1
                k += 1
            inner = css[inner_start:k-1]
            out.append(head + "{\n" + transform(inner) + "}\n")
            i = k
            continue

        # обычный блок селектор{...}
        end = css.find("}", j)
        body = css[j+1:end]
        if head == ":root":
            out.append(":root{" + body.strip() + "}\n")   # переменные оставляем глобально
        else:
            out.append(scope_block(head, body))
        i = end + 1
    return "".join(out)

# ---------- 2. Тело каталога (hero + filter + main) ----------

BODY = '''<div id="arno-catalog">

  <!-- NAV -->
  <header class="nav">
    <a href="https://nireal.ru" class="nav-logo">
      <img src="https://static.tildacdn.com/tild3964-3834-4065-b566-663235346131/photo.jpg" alt="Ассоциация рестораторов НО"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="nav-logo-txt" style="display:none"><b>АРНО</b><span>Нижегородская область</span></div>
    </a>
    <ul class="nav-links">
      <li><a href="https://nireal.ru/#rec277394004">О нас</a></li>
      <li><a href="https://nireal.ru/#rec478862499">Новости</a></li>
      <li><a href="https://nireal.ru/#rec449988712">Помощь ресторатору</a></li>
      <li><a href="https://nireal.ru/#rec277432530">Членство</a></li>
      <li><a href="https://nireal.ru/#rec277724048">Партнёры</a></li>
      <li><a href="#arno-catalog" class="active">Каталог</a></li>
    </ul>
    <div class="nav-contact">
      <a href="tel:+79036005060">+7 903 600 50 60</a>
      <a href="mailto:info@arno.ru">info@arno.ru</a>
    </div>
  </header>

  <!-- HERO -->
  <section class="hero">
    <div class="breadcrumb">
      <a href="https://nireal.ru">Главная</a>
      <span class="breadcrumb-sep">&rsaquo;</span>
      <span>Каталог производителей</span>
    </div>
    <div class="hero-body">
      <div>
        <div class="hero-eyebrow">
          <span class="hero-eyebrow-lbl">Нижегородская область</span>
        </div>
        <h1>Производители<br>нашего <em>региона</em></h1>
        <p class="hero-desc">Натуральные продукты напрямую от производителей. Здесь собраны фермеры и мастера, с которыми работают рестораны — члены Ассоциации.</p>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-num" id="hero-total">—</div>
          <div class="hero-stat-lbl">Производителей</div>
        </div>
        <div class="stat-sep"></div>
        <div class="hero-stat">
          <div class="hero-stat-num" id="hero-cats">—</div>
          <div class="hero-stat-lbl">Категорий</div>
        </div>
        <div class="stat-sep"></div>
        <div class="hero-stat">
          <div class="hero-stat-num">НО</div>
          <div class="hero-stat-lbl">Регион</div>
        </div>
      </div>
    </div>
  </section>

  <!-- FILTER BAR -->
  <div class="filter-bar">
    <div class="filter-inner">
      <div class="filter-tabs" id="tabs"></div>
      <div class="search-box">
        <svg class="search-ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input class="search-input" id="search" type="text" placeholder="Продукт, район, производитель…">
      </div>
    </div>
  </div>

  <!-- MAIN -->
  <main class="main">
    <div class="results-txt">Показано: <span id="count">—</span> производителей</div>
    <div class="grid" id="grid">
      <div class="empty"><div class="empty-icon">…</div><div class="empty-title">Загрузка</div></div>
    </div>
  </main>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-links">
      <a href="https://nireal.ru/#rec277394004">О нас</a>
      <a href="https://nireal.ru/#rec478862499">Новости</a>
      <a href="https://nireal.ru/#rec449988712">Помощь</a>
      <a href="https://nireal.ru/#rec277432530">Членство</a>
      <a href="https://nireal.ru/#rec277724048">Партнёры</a>
      <a href="#arno-catalog">Каталог производителей</a>
    </div>
    <div class="footer-right">
      <div class="footer-social">
        <a href="https://t.me/vilkastrelka">Telegram</a>
        <a href="https://vk.com/vilka_strelka_blog">ВКонтакте</a>
      </div>
      <div class="footer-legal">ОГРН 1205200027625 · ИНН 5260472484 · © 2026 АРНО</div>
    </div>
  </footer>

</div>'''

# ---------- 3. Сборка ----------

def main():
    # 1. Скоупленный CSS -> embed/catalog.css (коммитится, раздаётся с CDN)
    css = transform(read("src/css/styles.css"))
    os.makedirs(os.path.join(ROOT, "embed"), exist_ok=True)
    css_path = os.path.join(ROOT, "embed", "catalog.css")
    with open(css_path, "w", encoding="utf-8") as f:
        f.write("/* Стили каталога АРНО, изолированы в #arno-catalog. */\n")
        f.write("/* Сгенерировано build/build_tilda_block.py — вручную не править. */\n")
        f.write(css.strip() + "\n")

    # 2. Данные: переписываем относительные пути фото на абсолютные CDN-ссылки
    obj = json.loads(read("data/farmers.json"))
    rewritten = 0
    for f in obj.get("farmers", []):
        p = f.get("photo")
        if p and not p.startswith("http"):
            f["photo"] = CDN + "/" + p.lstrip("/")
            rewritten += 1
    data = json.dumps(obj, ensure_ascii=False)

    # 3. Лёгкий блок для Tilda: CSS и JS с CDN, данные инлайном
    out = []
    out.append("<!-- ============================================================ -->")
    out.append("<!-- КАТАЛОГ ПРОИЗВОДИТЕЛЕЙ АРНО — блок для Tilda (T123 «HTML-код») -->")
    out.append("<!-- Стили/скрипт/фото грузятся с CDN (jsDelivr). Всё в #arno-catalog. -->")
    out.append("<!-- Сгенерировано build/build_tilda_block.py — вручную не править.   -->")
    out.append("<!-- CDN ref: %s -->" % GH_REF)
    out.append("<!-- ============================================================ -->")
    out.append('<link rel="stylesheet" href="%s/embed/catalog.css">' % CDN)
    out.append("")
    out.append(BODY)
    out.append("")
    out.append("<script>")
    out.append('window.ARNO_FARMER_PAGE = "%s";' % FARMER_PAGE)
    out.append("window.FARMERS_DATA = " + data.strip() + ";")
    out.append("</script>")
    out.append('<script src="%s/src/js/catalog.js"></script>' % CDN)

    os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)
    dest = os.path.join(ROOT, "dist", "tilda-catalog-block.html")
    with open(dest, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print("OK -> embed/catalog.css (", round(os.path.getsize(css_path) / 1024), "КБ )")
    print("OK ->", dest)
    print("  размер блока:", round(os.path.getsize(dest) / 1024), "КБ; фото на CDN:", rewritten)
    print("  CDN ref:", GH_REF)

if __name__ == "__main__":
    main()
