# Задача: Настроить GitHub Pages deploy для Agent Sim

Проект: Agent Sim — Phaser 3 игра с AI-агентами (Vite + TypeScript)
Репозиторий: github.com/jskonst/agent-sim

## Что нужно сделать

1. **Создать `.github/workflows/deploy.yml`** — GitHub Actions workflow для публикации на GitHub Pages:
   - Триггер: push в ветку `main`
   - Permissions: contents: read, pages: write, id-token: write
   - Concurrency: group: pages, cancel-in-progress: true
   - Job **build**: 
     - Node 20, cache: npm
     - `npm ci`, `npm run build`
     - actions/configure-pages@v4
     - actions/upload-pages-artifact@v3 (source: `dist`)
   - Job **deploy** (needs: build):
     - environment: github-pages
     - actions/deploy-pages@v4

2. **Создать `.gitignore`** для проекта:
   - dist/
   - node_modules/
   - *.log
   - .DS_Store

3. **Проверить `vite.config.ts`** — убедиться что `base: '/agent-sim/'` уже установлен (файл есть в проекте, если надо — добавь)

4. **Сделать коммит** и **запушить** в main

## Контекст

- Vite config уже есть, в нём прописан `base: '/agent-sim/'` — это правильно для Pages
- Команда сборки: `npm run build` (tsc && vite build)
- Публиковаться будет на `https://jskonst.github.io/agent-sim/`