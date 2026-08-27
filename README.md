# The Glória Eterna

Simulador de carreira da Copa Libertadores 2026, em Astro + TypeScript.

## Estrutura

```
src/
  pages/index.astro     entrada — monta <div id="app"> e importa o script do jogo
  layouts/Layout.astro  shell HTML (meta, fontes, importa o CSS global)
  styles/global.css     todo o visual (design tokens, componentes, temas)
  game/
    types.ts            tipos compartilhados (Player, Team, GameData...)
    data/teams.json      32 clubes da Libertadores + elencos
    data/market.json      mercado global de transferências
    teams.ts / market.ts  loaders tipados dos JSONs acima
    engine.ts            motor puro (simulação, escalações, chaveamento) — sem DOM
    app.ts               estado, telas, renderização — o "controller" do jogo
    window.d.ts          augmenta window.Game/ST/storage (usados pelos onclick inline)
public/
  logos/                 escudos oficiais dos 32 clubes
  images/                mascote e imagem de fundo do hero
```

## Rodar localmente

```bash
npm install
npm run dev
```

## Build / Deploy

```bash
npm run build
```

Deploy estático padrão na Vercel (framework preset "Astro", detectado automaticamente).
