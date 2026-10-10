# ConnectLife Airco for Homey Pro (personal, unofficial)

**EN** | [NL](#nl)

A small personal Homey app that talks to the ConnectLife cloud directly. Made for Hisense air conditioners with the **AEH-W4G2** Wi-Fi module (e.g. DJ25VE0AG) when the official ConnectLife app shows no devices in Homey. Lightly tested, use at your own risk. Current version: **0.5.0**.

## What it can do

### Device
| Capability | Notes |
|---|---|
| On / off | Standard Homey card |
| Target temperature | 16-32 °C, step 1 |
| Room temperature | Internal sensor, or an external sensor (see below) |
| Mode | auto, cool, heat, dry, fan only. Choosing a mode also turns the unit on |
| Fan speed | auto, low, medium low, medium, medium high, high |
| Eco | on / off |
| Outdoor temperature, power (W), energy (kWh), humidity | Only if your unit reports them. **Not the case for the AEH-W4G2 / DJ25VE0AG.** The app adds these tiles automatically when the data exists and removes them when it does not |

The app polls ConnectLife every 60 s, and again a few seconds after each command.

### Diagnostics
Open the device, advanced settings, **Properties received from ConnectLife**: it lists every property your unit sends (for example `t_power=1, t_temp=24, f_temp_in=26`). Useful to see what your model really reports. Properties starting with `f_e_` are fault flags (0 = no fault), not measurements.

## Flow cards

All cards are found under the app name "ConnectLife airco" and need a ConnectLife air conditioner as device.

### When... (triggers)
| Card | Token | Fires when |
|---|---|---|
| The mode changed | `mode` (auto / cool / heat / dry / fan_only) | The unit reports a different mode |
| The fan speed changed | `fan` (auto / low / middle_low / medium / middle_high / high) | The fan speed changes |
| Eco changed | `eco` (yes / no) | Eco is switched |

Turned on / off, target temperature changed and room temperature changed use the standard Homey cards.

### And... (conditions)
| Card | True when |
|---|---|
| Mode is (not) ... | The current mode equals the chosen one |
| Fan speed is (not) ... | The current fan speed equals the chosen one |
| Eco is on / off | Eco is switched on |

### Then... (actions)
| Card | What it does |
|---|---|
| Set mode | Sets the mode and turns the unit on |
| Set fan speed | Sets the fan speed |
| Set eco | Eco on or off |
| Use external room temperature | Shows the temperature of another Homey sensor as room temperature of this device |
| Back to internal temperature sensor | Switches back to the internal sensor immediately |
| Use external humidity | Shows the humidity of another Homey sensor on this device (display only) |
| Remove external humidity | Removes the external humidity again |

## Using an external sensor
The air conditioner itself always regulates on its own internal sensor: ConnectLife offers no way to change that. The external value only changes what Homey, your flows and your scripts see.

Example flow, living room:
1. **When** the temperature of "Thermometer living" changes
2. **Then** ConnectLife: *Use external room temperature*, device "living air conditioner", temperature = the temperature tag of "Thermometer living"

Humidity works the same way with *Use external humidity*. Make sure the tag comes from the sensor itself and not from a similar looking thermostat group.

- The external temperature is used as long as it is at most **60 minutes old**. After that the device falls back to the internal sensor automatically (for example when the sensor battery is empty).
- The external humidity is also valid for 60 minutes.
- *Use external room temperature* only accepts -40 to 80 °C, humidity 0-100 %.

## Requirements
- Homey Pro (2023 or later) and Node.js
- Homey CLI: `npm install -g homey`, then `homey login`
- Accept the latest ConnectLife terms in the phone app first, otherwise login fails
- Docker is **not** needed for `homey app install` (only for `homey app run`)

## Install / update
1. Unpack the app. `app.json` must sit directly in the app folder, next to `app.js`.
2. In that folder run `homey app install`.
3. First install: in the Homey app go to Devices, Add, "ConnectLife airco (persoonlijk)", log in, select your units.
4. Updating: run `homey app install` again. Your devices and flows stay as they are.

## Notes
- Uses the ConnectLife cloud; it stops working if ConnectLife changes the API.
- Based on the MIT-licensed open-source ConnectLife API work used by the Home Assistant integration.
- On Midea/Hisense units, **eco is a cooling function**: do not enable it while heating, it switches the unit to cool at 26 °C.
- When the unit is off, some models still report a room temperature that does not reflect the room. An external sensor avoids this.
- Unofficial. Not affiliated with Hisense or ConnectLife.

---

<a id="nl"></a>
# ConnectLife Airco voor Homey Pro (persoonlijk, onofficieel)

[EN](#connectlife-airco-for-homey-pro-personal-unofficial) | **NL**

Een kleine persoonlijke Homey-app die rechtstreeks met de ConnectLife-cloud praat. Bedoeld voor Hisense-airco's met de **AEH-W4G2** wifi-module (bv. DJ25VE0AG) wanneer de officiële ConnectLife-app geen toestellen toont in Homey. Beperkt getest, gebruik op eigen risico. Huidige versie: **0.5.0**.

## Wat de app kan

### Toestel
| Functie | Opmerking |
|---|---|
| Aan / uit | Standaard Homey-kaart |
| Doeltemperatuur | 16-32 °C, stap 1 |
| Kamertemperatuur | Interne sensor, of een externe sensor (zie hieronder) |
| Modus | auto, koelen, verwarmen, ontvochtigen, enkel ventilator. Een modus kiezen zet het toestel ook aan |
| Ventilatorstand | auto, laag, middellaag, middel, middelhoog, hoog |
| Eco | aan / uit |
| Buitentemperatuur, vermogen (W), verbruik (kWh), vochtigheid | Alleen als je toestel ze doorgeeft. **Niet het geval bij de AEH-W4G2 / DJ25VE0AG.** De app voegt deze tegels zelf toe als de data bestaat en verwijdert ze als dat niet zo is |

De app vraagt ConnectLife elke 60 s op, en nogmaals enkele seconden na elk commando.

### Diagnose
Open het toestel, geavanceerde instellingen, **Eigenschappen ontvangen van ConnectLife**: daar staat elke eigenschap die jouw toestel doorstuurt (bv. `t_power=1, t_temp=24, f_temp_in=26`). Handig om te zien wat jouw model echt meldt. Eigenschappen die met `f_e_` beginnen zijn foutvlaggen (0 = geen storing) en geen metingen.

## Flowkaarten

Alle kaarten staan onder de appnaam "ConnectLife airco" en vragen een ConnectLife-airco als apparaat.

### Wanneer... (triggers)
| Kaart | Token | Gaat af als |
|---|---|---|
| De modus is gewijzigd | `mode` (auto / cool / heat / dry / fan_only) | Het toestel een andere modus meldt |
| De ventilatorstand is gewijzigd | `fan` (auto / low / middle_low / medium / middle_high / high) | De ventilatorstand verandert |
| Eco is gewijzigd | `eco` (ja / nee) | Eco wordt aan- of uitgezet |

Aan- of uitgezet, doeltemperatuur gewijzigd en kamertemperatuur gewijzigd zijn de standaard Homey-kaarten.

### En... (voorwaarden)
| Kaart | Waar als |
|---|---|
| Modus is (niet) ... | De huidige modus gelijk is aan de gekozen |
| Ventilatorstand is (niet) ... | De huidige ventilatorstand gelijk is aan de gekozen |
| Eco staat aan / uit | Eco aanstaat |

### Dan... (acties)
| Kaart | Wat ze doet |
|---|---|
| Modus instellen | Zet de modus en schakelt het toestel in |
| Ventilatorstand instellen | Zet de ventilatorstand |
| Eco instellen | Eco aan of uit |
| Externe kamertemperatuur gebruiken | Toont de temperatuur van een andere Homey-sensor als kamertemperatuur van dit toestel |
| Terug naar interne temperatuursensor | Schakelt meteen terug naar de interne sensor |
| Externe vochtigheid gebruiken | Toont de vochtigheid van een andere Homey-sensor op dit toestel (enkel weergave) |
| Externe vochtigheid verwijderen | Haalt de externe vochtigheid weer weg |

## Een externe sensor gebruiken
De airco zelf regelt altijd op zijn eigen interne sensor: ConnectLife biedt geen manier om dat te wijzigen. De externe waarde verandert alleen wat Homey, je flows en je scripts zien.

Voorbeeldflow, living:
1. **Wanneer** de temperatuur van "Thermometer living" verandert
2. **Dan** ConnectLife: *Gebruik externe kamertemperatuur*, apparaat "living air conditioner", temperatuur = de temperatuur-tag van "Thermometer living"

Vochtigheid werkt hetzelfde met *Gebruik externe vochtigheid*. Let erop dat de tag van de sensor zelf komt en niet van een gelijkaardig ogende thermostaatgroep.

- De externe temperatuur wordt gebruikt zolang ze hoogstens **60 minuten oud** is. Daarna valt het toestel automatisch terug op de interne sensor (bv. bij een lege sensorbatterij).
- De externe vochtigheid is ook 60 minuten geldig.
- *Gebruik externe kamertemperatuur* accepteert enkel -40 tot 80 °C, vochtigheid 0-100 %.

## Vereisten
- Homey Pro (2023 of later) en Node.js
- Homey CLI: `npm install -g homey`, daarna `homey login`
- Accepteer eerst de nieuwste ConnectLife-voorwaarden in de app op je telefoon, anders mislukt het inloggen
- Docker is **niet** nodig voor `homey app install` (enkel voor `homey app run`)

## Installeren / updaten
1. Pak de app uit. `app.json` moet rechtstreeks in de appmap staan, naast `app.js`.
2. Voer in die map `homey app install` uit.
3. Eerste installatie: in de Homey-app Apparaten, Toevoegen, "ConnectLife airco (persoonlijk)", inloggen, toestellen kiezen.
4. Updaten: voer `homey app install` opnieuw uit. Je apparaten en flows blijven zoals ze zijn.

## Opmerkingen
- Gebruikt de ConnectLife-cloud; werkt niet meer als ConnectLife de API wijzigt.
- Gebaseerd op het open-source (MIT) ConnectLife-API-werk dat ook de Home Assistant-integratie gebruikt.
- Bij Midea/Hisense-toestellen is **eco een koelfunctie**: zet die niet aan tijdens verwarmen, het toestel schakelt dan naar koelen op 26 °C.
- Als het toestel uitstaat, melden sommige modellen een kamertemperatuur die niet de kamer weergeeft. Een externe sensor voorkomt dat.
- Onofficieel. Niet verbonden aan Hisense of ConnectLife.
