# Krawall Kart

Multiplayer-Kartrennen im Browser: 14 Fahrer, 18 große Strecken in 6 Cups mit Abzweigungen (Schotter-Abkürzungen und Panoramawege) (Cup-Modus mit Punkten über 3 Rennen oder Einzelrennen), 11 Items (u. a. Spitzenreiter-Komet, Krachbombe, Tarnkappe), Drift-Turbo, Bots und Lobbys mit 5-stelligem Einladungscode.

## Auf Render hosten
1. Auf [render.com](https://render.com) einloggen → **New → Blueprint** → dieses Repo wählen (nutzt `render.yaml`).
   Oder **New → Web Service**: Build `npm install`, Start `npm start`, Plan *Free*.
2. Nach dem Deploy die `https://…onrender.com`-Adresse öffnen, Lobby erstellen, Code oder Link verschicken.

Hinweis: Der Gratis-Plan schläft nach ~15 Minuten ohne Besucher ein. Der erste Aufruf danach dauert ca. 30–60 Sekunden.

## Lokal starten
```
npm install
npm start
```
Dann http://localhost:3000 öffnen.

## Steuerung
W/↑ Gas · S/↓ Bremse · A D/← → Lenken · Shift/Leertaste Driften (lange halten = Turbo) · E/Strg Item · R zurück auf die Strecke · Esc Pause · M Ton aus
