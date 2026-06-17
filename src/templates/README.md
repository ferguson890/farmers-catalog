# src/templates

Заготовки для встраивания каталога в Tilda (T123-блок). Используются, когда нужно вынести код в Tilda без `fetch` — данные передаются инлайном через `window.FARMERS_DATA`.

Рекомендуемый порядок вставки в T123:
```html
<!-- 1. Данные (содержимое data/farmers.json) -->
<script>window.FARMERS_DATA = { /* ...вставить JSON... */ };</script>

<!-- 2. Разметка каталога (из index.html: HERO + FILTER + #grid) -->
<!-- ...сюда блоки... -->

<!-- 3. Логика (содержимое src/js/catalog.js) -->
<script> /* ...вставить catalog.js... */ </script>
```

Стили (`src/css/styles.css`) лучше класть в «Настройки сайта → Ещё → HTML-код в head» внутри `<style>…</style>`, чтобы переиспользовались на странице каталога и на страницах фермеров.

Подробная инструкция — в `docs/TILDA.md`. Файлы-болванки добавляйте сюда по мере настройки конкретной страницы Tilda (например `tilda-catalog-block.html`, `tilda-farmer-block.html`).
