
# AICOM / AUREA Metaverse — MVP Autonomo (Web-First)

Este paquete contiene un prototipo funcional listo para desplegarse.
Incluye:
- Cliente Web (Three.js basico + chat + login local)
- Servidor Node (Express + Socket.IO + API de items)
- Economia simulada (tienda con creditos locales) y "Stage" (evento piloto)
- Preparado para Netlify/Vercel (cliente) y Railway/Render (server)
- Compatible con IPFS (solo carpeta client/)

## Requisitos
- Node.js 18+

## Ejecucion local
Servidor:
```
cd server
cp .env.example .env
npm install
npm run start
```
Cliente (opcion simple):
```
cd client
python3 -m http.server 8080
# abre http://localhost:8080
```
Si el servidor corre en otro puerto/origen, abre el cliente con:
```
http://localhost:8080/?server=http://localhost:8787
```

## Despliegue rapido
Cliente (Netlify o Vercel)
- Netlify: publish directory "client"
- Vercel: framework "Other", output "client"

Servidor (Railway/Render)
- Railway: proyecto Node con raiz "server/"
- Render: Web Service Node con comando "npm run start"

Variables de entorno:
```
PORT=8787
# STRIPE_SECRET_KEY=
# OPENAI_API_KEY=
# SOLANA_RPC_URL=
```

## Estructura
AICOM_METAVERSE_MVP/
  client/
    index.html
    styles.css
    app.js
    assets/
  server/
    server.js
    package.json
    .env.example
    Procfile
  README.md
