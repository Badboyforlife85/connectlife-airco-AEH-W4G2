# ConnectLife Airco (persoonlijk) voor Homey

Onofficiële Homey-app voor Hisense-airco's met ConnectLife Wi-Fi-module (bv. AEH-W4G2),
via dezelfde cloud als de ConnectLife-telefoon-app. Gebaseerd op de MIT-bibliotheek
https://github.com/oyvindwe/connectlife (Python) - poort naar Node.

## Installeren (eenmalig, op een computer met Node.js)
1. `npm install -g homey`
2. `homey login`  (Athom-account)
3. In deze map: `homey app install`   (blijvend op je Homey Pro)
   of `homey app run` om live logs te zien tijdens het testen.
4. Homey-app > Apparaten > + > "ConnectLife Airco" > inloggen met je ConnectLife
   e-mailadres en wachtwoord (geen Google/Apple-login) > toestellen kiezen.

## Wat je krijgt per airco
aan/uit, setpoint (16-32), kamertemperatuur van de unit, modus (auto/koelen/verwarmen/
ontvochtigen/ventilator), ventilatorsnelheid, eco. Poll elke 60 s, na een commando na 8 s.

## Opmerkingen
- Inloggegevens staan alleen in de app-instellingen op je Homey.
- Foutmelding "voorwaarden": accepteer eerst de nieuwe voorwaarden in de ConnectLife-app.
- De log (homey app run) toont bij het koppelen alle gevonden ConnectLife-toestellen
  met type- en featurecode; stuur die regel als er geen airco verschijnt.
