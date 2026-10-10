# connectlife-airco-AEH-W4G2
ConnectLife Airco for Homey Pro (personal, unofficial)

EN | NL

A small personal Homey app that talks to the ConnectLife cloud directly. Made for Hisense air conditioners with the AEH-W4G2 Wi-Fi module (e.g. DJ25VE0AG) when the official ConnectLife app shows no devices in Homey. Lightly tested, use at your own risk.

Features
Login with your ConnectLife account, lists your air conditioners
On/off, target temperature, room temperature
Mode (auto / cool / heat / dry / fan only), fan speed, eco
Polls every 60 s, and again a few seconds after each command
Requirements
Homey Pro (2023 or later) and Node.js
Homey CLI: npm install -g homey, then homey login
Accept the latest ConnectLife terms in the phone app first, otherwise login fails
Docker is not needed for homey app install (only for homey app run)
Install
Unpack the app. app.json must sit directly in the app folder, next to app.js.
In that folder run homey app install.
In the Homey app: Devices → Add → "ConnectLife airco (persoonlijk)" → log in → select your units.
Notes
Uses the ConnectLife cloud; it stops working if ConnectLife changes the API.
Based on the MIT-licensed open-source ConnectLife API work used by the Home Assistant integration.
On Midea/Hisense units, eco is a cooling function: do not enable it while heating, it switches the unit to cool at 26 °C.
Unofficial. Not affiliated with Hisense or ConnectLife.

<a id="nl"></a>

ConnectLife Airco voor Homey Pro (persoonlijk, onofficieel)

EN | NL

Een kleine persoonlijke Homey-app die rechtstreeks met de ConnectLife-cloud praat. Bedoeld voor Hisense-airco's met de AEH-W4G2 wifi-module (bv. DJ25VE0AG) wanneer de officiële ConnectLife-app geen toestellen toont in Homey. Beperkt getest, gebruik op eigen risico.

Functies
Inloggen met je ConnectLife-account, toont je airco's
Aan/uit, doeltemperatuur, kamertemperatuur
Modus (auto / koelen / verwarmen / ontvochtigen / enkel ventilator), ventilatorsnelheid, eco
Pollt elke 60 s en nogmaals enkele seconden na elk commando
Vereisten
Homey Pro (2023 of later) en Node.js
Homey CLI: npm install -g homey, daarna homey login
Accepteer eerst de nieuwste ConnectLife-voorwaarden in de app op je telefoon, anders mislukt het inloggen
Docker is niet nodig voor homey app install (enkel voor homey app run)
Installeren
Pak de app uit. app.json moet rechtstreeks in de appmap staan, naast app.js.
Voer in die map homey app install uit.
In de Homey-app: Apparaten → Toevoegen → "ConnectLife airco (persoonlijk)" → inloggen → toestellen kiezen.
Opmerkingen
Gebruikt de ConnectLife-cloud; werkt niet meer als ConnectLife de API wijzigt.
Gebaseerd op het open-source (MIT) ConnectLife-API-werk dat ook de Home Assistant-integratie gebruikt.
Bij Midea/Hisense-toestellen is eco een koelfunctie: zet die niet aan tijdens verwarmen, het toestel schakelt dan naar koelen op 26 °C.
Onofficieel. Niet verbonden aan Hisense of ConnectLife.
