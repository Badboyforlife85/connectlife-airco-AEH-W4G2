'use strict';

const Homey = require('homey');
const { ConnectLifeApi } = require('./lib/connectlife');

module.exports = class ConnectLifeApp extends Homey.App {
  async onInit() {
    this._api = null;
    this.log('ConnectLife Airco app gestart');
  }

  // Eén gedeelde sessie voor alle toestellen. Inloggegevens staan alleen in de
  // Homey-instellingen van deze app (lokaal op je Homey).
  getApi() {
    const creds = this.homey.settings.get('connectlife');
    if (!creds || !creds.username || !creds.password) return null;
    if (!this._api || this._apiUser !== creds.username || this._apiPass !== creds.password) {
      this._api = new ConnectLifeApi(creds.username, creds.password);
      this._apiUser = creds.username;
      this._apiPass = creds.password;
    }
    return this._api;
  }

  async saveCredentials(username, password) {
    this.homey.settings.set('connectlife', { username, password });
    this._api = null;
  }
};
