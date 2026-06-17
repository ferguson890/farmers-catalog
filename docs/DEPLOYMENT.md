# Развёртывание и публикация

Проект — статика, поэтому разворачивается где угодно. Три сценария.

## 1. Tilda (основной)
См. подробно `TILDA.md`. Кратко: T123-блок + инлайн-данные. Публикация — кнопкой «Опубликовать» в Tilda.

## 2. GitHub Pages (демо / CDN для данных)
Удобно как живое демо и как источник `farmers.json` для Tilda.
1. Запушить репозиторий на GitHub.
2. Settings → Pages → Source: `main` / root.
3. Сайт будет на `https://<user>.github.io/<repo>/`.
4. Caталог: `…/index.html`, страница: `…/farmer.html?id=brynza`.
5. Если используете данные с Pages в Tilda — в коде `fetch` указать абсолютный URL `https://<user>.github.io/<repo>/data/farmers.json` (CORS на Pages разрешён).

## 3. Netlify / Vercel / любой статик-хостинг
1. Подключить репозиторий (build command — пусто, publish dir — корень).
2. Деплой автоматически при push.

## Локальный предпросмотр
```bash
cd farmers-catalog
python -m http.server 8000   # http://localhost:8000
# или: npx serve .
```
> Открывать через `http://`, не `file://` — иначе `fetch(farmers.json)` заблокируется браузером.

## Релизный чек-лист
- [ ] `farmers.json` валиден (`python -c "import json;json.load(open('data/farmers.json',encoding='utf-8'))"`).
- [ ] Все `category` ссылаются на существующие `slug`.
- [ ] Фото лежат в `assets/images/<id>/` или используется fallback.
- [ ] Проверены каталог и хотя бы одна страница фермера.
- [ ] Проверена адаптивность (desktop/tablet/mobile).
- [ ] Заданы мета-теги (`SEO.md`).
- [ ] Создан git-тег версии (опц.): `git tag v1.0.0`.

## Процесс обновления контента
1. Внести правки в `data/farmers.json` (+ фото в `assets/images/`).
2. Локально проверить.
3. `git add -A && git commit -m "data: добавлен <фермер>" && git push`.
4. Pages/Netlify обновятся автоматически; для Tilda — обновить инлайн-данные или дождаться кэша CDN.
