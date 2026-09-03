# Fonte decorativa

Salve aqui o arquivo `kissing-season.ttf` para servir a **Kissing Season** pela
própria origem do site.

O `@font-face` em `src/app/globals.css` procura por `/fonts/kissing-season.ttf`
primeiro e, se o arquivo não existir, recorre à cópia publicada em
`https://manu.cuptickers.online/Kissing%20Season.ttf`. Nenhuma outra mudança é
necessária.

```bash
curl -L "https://manu.cuptickers.online/Kissing%20Season.ttf" \
  -o public/fonts/kissing-season.ttf
```
