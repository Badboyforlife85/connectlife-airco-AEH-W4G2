'use strict';

const Homey = require('homey');

// ConnectLife airco-eigenschappen (zie connectlife-ha data_dictionaries/009.yaml):
//   t_power: 0/1            t_work_mode: 0 fan_only, 1 heat, 2 cool, 3 dry, 4 auto
//   t_temp: setpoint (C)    f_temp_in: kamertemperatuur
//   t_fan_speed: 0 auto, 5 low, 6 middle_low, 7 medium, 8 middle_high, 9 high
//   t_eco: 0/1
const MODE_BY_NUM = { 0: 'fan_only', 1: 'heat', 2: 'cool', 3: 'dry', 4: 'auto' };
const NUM_BY_MODE = Object.fromEntries(Object.entries(MODE_BY_NUM).map(([k, v]) => [v, Number(k)]));
const FAN_BY_NUM = { 0: 'auto', 5: 'low', 6: 'middle_low', 7: 'medium', 8: 'middle_high', 9: 'high' };
const NUM_BY_FAN = Object.fromEntries(Object.entries(FAN_BY_NUM).map(([k, v]) => [v, Number(k)]));

const POLL_MS = 60 * 1000;
const FAST_POLL_MS = 8 * 1000; // kort na een commando, om de nieuwe stand te bevestigen

module.exports = class AircoDevice extends Homey.Device {
  async onInit() {
    this._puid = this.getData().puid;
    this._deviceId = this.getData().id;
    this._busy = false;

    this.registerCapabilityListener('onoff', v => this._set({ t_power: v ? 1 : 0 }));
    this.registerCapabilityListener('target_temperature', v => this._set({ t_temp: Math.round(v) }));
    this.registerCapabilityListener('connectlife_mode', v => {
      if (!(v in NUM_BY_MODE)) throw new Error(`Onbekende modus ${v}`);
      // Een modus kiezen zet het toestel ook aan.
      return this._set({ t_power: 1, t_work_mode: NUM_BY_MODE[v] });
    });
    this.registerCapabilityListener('connectlife_fan', v => {
      if (!(v in NUM_BY_FAN)) throw new Error(`Onbekende ventilatorstand ${v}`);
      return this._set({ t_fan_speed: NUM_BY_FAN[v] });
    });
    this.registerCapabilityListener('connectlife_eco', v => this._set({ t_eco: v ? 1 : 0 }));

    await this._poll();
    this._timer = this.homey.setInterval(() => this._poll(), POLL_MS);
  }

  async onDeleted() {
    if (this._timer) this.homey.clearInterval(this._timer);
    if (this._fast) this.homey.clearTimeout(this._fast);
  }

  async _set(props) {
    const api = this.homey.app.getApi();
    if (!api) throw new Error('Niet ingelogd bij ConnectLife');
    this.log('Zet', JSON.stringify(props));
    await api.setProperties(this._puid, props);
    if (this._fast) this.homey.clearTimeout(this._fast);
    this._fast = this.homey.setTimeout(() => this._poll(), FAST_POLL_MS);
  }

  async _poll() {
    if (this._busy) return;
    this._busy = true;
    try {
      const api = this.homey.app.getApi();
      if (!api) { await this.setUnavailable('Niet ingelogd bij ConnectLife'); return; }
      const list = await api.getAppliances();
      const me = list.find(d => String(d.deviceId) === this._deviceId);
      if (!me) { await this.setUnavailable('Toestel niet gevonden in ConnectLife'); return; }
      if (String(me.offlineState) === '0') { await this.setUnavailable('Airco is offline'); return; }
      await this.setAvailable();
      this._apply(me.statusList || {});
    } catch (e) {
      this.error('Poll mislukt:', e.message);
      await this.setUnavailable(`ConnectLife: ${e.message}`).catch(() => {});
    } finally {
      this._busy = false;
    }
  }

  _apply(s) {
    const num = k => (s[k] === undefined || s[k] === null || s[k] === '' ? null : Number(s[k]));
    const power = num('t_power');
    if (power !== null) this._cap('onoff', power === 1);
    const t = num('t_temp');
    if (t !== null) this._cap('target_temperature', t);
    const tin = num('f_temp_in');
    if (tin !== null && tin > -40 && tin < 80) this._cap('measure_temperature', tin);
    const m = num('t_work_mode');
    if (m !== null && MODE_BY_NUM[m]) this._cap('connectlife_mode', MODE_BY_NUM[m]);
    const f = num('t_fan_speed');
    if (f !== null && FAN_BY_NUM[f]) this._cap('connectlife_fan', FAN_BY_NUM[f]);
    const eco = num('t_eco');
    if (eco !== null) this._cap('connectlife_eco', eco === 1);
  }

  _cap(id, value) {
    if (this.hasCapability(id) && this.getCapabilityValue(id) !== value) {
      this.setCapabilityValue(id, value).catch(e => this.error('setCapabilityValue', id, e.message));
    }
  }
};
