'use strict';

const Homey = require('homey');
const { ConnectLifeApi, ConnectLifeTermsError } = require('../../lib/connectlife');

// Airco device type (009) en 008 in de ConnectLife-bibliotheek.
const AIRCO_TYPES = ['008', '009'];

module.exports = class AircoDriver extends Homey.Driver {
  async onInit() {
    this.log('ConnectLife airco driver gestart');
  }

  async onPair(session) {
    let api = null;

    session.setHandler('login', async ({ username, password }) => {
      try {
        api = new ConnectLifeApi(username, password);
        await api.login();
        await this.homey.app.saveCredentials(username, password);
        return true;
      } catch (e) {
        this.error('Login mislukt:', e.message);
        if (e instanceof ConnectLifeTermsError) {
          throw new Error('Accepteer eerst de nieuwe voorwaarden in de ConnectLife-app op je telefoon en probeer opnieuw.');
        }
        return false;
      }
    });

    session.setHandler('list_devices', async () => {
      const client = api || this.homey.app.getApi();
      if (!client) throw new Error('Niet ingelogd');
      const list = await client.getAppliances();
      this.log('ConnectLife toestellen gevonden:', list.map(d => `${d.deviceNickName} (${d.deviceTypeCode}-${d.deviceFeatureCode})`).join(', '));
      return list
        .filter(d => AIRCO_TYPES.includes(String(d.deviceTypeCode)))
        .map(d => ({
          name: d.deviceNickName || d.deviceFeatureName || `Airco ${d.deviceId}`,
          data: { id: String(d.deviceId), puid: String(d.puid) },
        }));
    });
  }
};
