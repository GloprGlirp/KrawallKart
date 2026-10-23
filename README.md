# Krawall Kart

Multiplayer-Kartrennen im Browser: 14 Fahrer mit Fahrzeug-Baukasten (Karosserie, Reifen, Gleiter), 27 Strecken in 9 Cups mit Höhen, Gleiter-Schluchten, Schanzen, Stampfern und 2–3 Abzweigungen pro Strecke, 11 Items, Siegerehrung nach jedem Cup, Bots und Lobbys mit 5-stelligem Einladungscode.

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
W/↑ Gas · S/↓ Bremse (im Gleiter: schneller sinken) · A D/← → Lenken · Shift/Leertaste Driften (lange halten = Turbo, in der Luft = Trick) · E/Strg Item · R zurück auf die Strecke · H Tastenübersicht · Esc Pause · M Ton aus
