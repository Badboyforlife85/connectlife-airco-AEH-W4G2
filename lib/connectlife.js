'use strict';

// ConnectLife / HijuConn cloud client (port of the MIT-licensed Python library
// https://github.com/oyvindwe/connectlife). Unofficial: uses the same endpoints
// as the ConnectLife mobile app.

const crypto = require('crypto');

const CONST = {
  API_KEY: '4_yhTWQmHFpZkQZDSV1uV-_A',
  LOGIN_URL: 'https://accounts.eu1.gigya.com/accounts.login',
  JWT_URL: 'https://accounts.eu1.gigya.com/accounts.getJWT',
  OAUTH_AUTHORIZE: 'https://oauth.hijuconn.com/oauth/authorize',
  OAUTH_TOKEN: 'https://oauth.hijuconn.com/oauth/token',
  CLIENT_ID: '5065059336212',
  CLIENT_SECRET: '07swfKgvJhC3ydOUS9YV_SwVz0i4LKqlOLGNUukYHVMsJRF1b-iWeUGcNlXyYCeK',
  REDIRECT_URI: 'https://api.connectlife.io/swagger/oauth2-redirect.html',
  GATEWAY_BASE: 'https://clife-eu-gateway.hijuconn.com',
  APP_ID: '47110565134383',
  APP_SECRET: 'yOzhz6junYno-nmULM3Wr7PU_dpSZN22ZdluvVWZ4uW5ZwwG8fIGCHTbrhcnU-iv',
  LANGUAGE_ID: '12',
  TIMEZONE: '1.0',
  VERSION: '5.0',
  SIGN_SUFFIX: 'D9519A4B756946F081B7BB5B5E8D1197',
  PUBLIC_KEY: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyyWrNG6q475HIHu7sMVu
vHof6vlgPeixmxa4EL/UsvVvHPz33NnWoQetQqit9TBNzUjMXw0KlY9PXM4iqHUU
U+dSyNDq1jZWIiJ2C2FccppswJtIKL3NRMFvT9PFh6NlP/4FUcQKojgKFbF7Kacc
JPKYHlwaO7qgoIjLxAHlSOXGpucJcOkPzT2EqsSVnW8sn8kenvNmghXDayhgxsh6
AyxK4kehJplEnmX/iYCfNoFXknGcLqFWYccgBz3fybvx30C/0IgU1980L8QsUAv5
esZmN8ugnbRgLRxKRlkQQLxQAiZMZdKTAx665YflT3YMHJvEFE8c2XFgoxHzSMc4
BwIDAQAB
-----END PUBLIC KEY-----
`,
};

const GIGYA_PENDING_REGISTRATION = 206001;
const GATEWAY_INVALID_ACCESS_TOKEN = 100026;
const GATEWAY_RANDSTR_CHECK_FAILED = 101005;

class ConnectLifeError extends Error {}
class ConnectLifeAuthError extends ConnectLifeError {}
class ConnectLifeTermsError extends ConnectLifeAuthError {}

class ConnectLifeApi {
  constructor(username, password, opts = {}) {
    this.username = username;
    this.password = password;
    this.accessToken = null;
    this.expires = 0;
    this.refreshToken = null;
    this.refreshExpires = 0;
    // Optional override of all base URLs (for the local test server).
    const t = opts.testServer;
    this.url = {
      login: t ? `${t}/accounts.login` : CONST.LOGIN_URL,
      jwt: t ? `${t}/accounts.getJWT` : CONST.JWT_URL,
      authorize: t ? `${t}/oauth/authorize` : CONST.OAUTH_AUTHORIZE,
      token: t ? `${t}/oauth/token` : CONST.OAUTH_TOKEN,
      redirect: t ? `${t}/swagger/oauth2-redirect.html` : CONST.REDIRECT_URI,
      deviceList: `${t || CONST.GATEWAY_BASE}/clife-svc/pu/get_device_status_list`,
      update: `${t || CONST.GATEWAY_BASE}/device/pu/property/set`,
    };
  }

  // ---- public ----------------------------------------------------------
  async login() {
    this._reset();
    await this._initialLogin();
  }

  async getAppliances() {
    await this._ensureToken();
    const res = await this._gateway(this.url.deviceList, {}, { method: 'GET' });
    if (!Array.isArray(res.deviceList)) throw new ConnectLifeError("Unexpected response: missing deviceList");
    return res.deviceList.filter(d => d && d.deviceId && d.statusList);
  }

  // properties: { t_power: '1', ... } (values are strings)
  async setProperties(puid, properties) {
    await this._ensureToken();
    const props = {};
    for (const [k, v] of Object.entries(properties)) props[k] = String(v);
    await this._gateway(this.url.update, { puid, properties: props });
  }

  // ---- auth ------------------------------------------------------------
  _reset() {
    this.accessToken = null; this.expires = 0; this.refreshToken = null; this.refreshExpires = 0;
  }

  async _ensureToken() {
    const now = Date.now();
    if (!this.accessToken) return this._initialLogin();
    if (this.expires > now) return undefined;
    if (!this.refreshToken || (this.refreshExpires && this.refreshExpires <= now)) {
      this._reset();
      return this._initialLogin();
    }
    try {
      await this._refresh();
    } catch (e) {
      this._reset();
      await this._initialLogin();
    }
    return undefined;
  }

  async _postForm(url, form, auth = true) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(form).toString(),
    });
    return this._parse(res, url, auth);
  }

  async _postJson(url, body, auth = true, headers = {}) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    return this._parse(res, url, auth);
  }

  async _parse(res, url, auth) {
    const text = await res.text();
    const Err = auth ? ConnectLifeAuthError : ConnectLifeError;
    if (res.status !== 200) throw new Err(`HTTP ${res.status} from ${url}`);
    try { return JSON.parse(text); } catch (e) { throw new Err(`Non-JSON response from ${url}: ${text.slice(0, 200)}`); }
  }

  async _initialLogin() {
    const g = await this._postForm(this.url.login, {
      loginID: this.username, password: this.password, APIKey: CONST.API_KEY,
    });
    if (g.errorCode || g.errorMessage || g.errorDetails) {
      const Err = g.errorCode === GIGYA_PENDING_REGISTRATION ? ConnectLifeTermsError : ConnectLifeAuthError;
      throw new Err(`Login failed. Code: ${g.errorCode} Message: ${g.errorMessage} Details: ${g.errorDetails}`);
    }
    if (!g.UID || !g.sessionInfo || !g.sessionInfo.cookieValue) throw new ConnectLifeAuthError('Missing UID/sessionInfo in login response');
    const jwt = await this._postForm(this.url.jwt, { APIKey: CONST.API_KEY, login_token: g.sessionInfo.cookieValue });
    if (!jwt.id_token) throw new ConnectLifeAuthError('Missing id_token');
    const code = await this._postJson(this.url.authorize, {
      client_id: CONST.CLIENT_ID, redirect_uri: this.url.redirect, idToken: jwt.id_token,
      response_type: 'code', thirdType: 'CDC', thirdClientId: g.UID,
    });
    if (!code.code) throw new ConnectLifeAuthError('Missing authorization code');
    const tok = await this._postForm(this.url.token, {
      client_id: CONST.CLIENT_ID, client_secret: CONST.CLIENT_SECRET, redirect_uri: this.url.redirect,
      grant_type: 'authorization_code', code: code.code,
    });
    this._setTokens(tok);
  }

  async _refresh() {
    const tok = await this._postForm(this.url.token, {
      client_id: CONST.CLIENT_ID, client_secret: CONST.CLIENT_SECRET, redirect_uri: this.url.redirect,
      grant_type: 'refresh_token', refresh_token: this.refreshToken,
    });
    this._setTokens(tok);
  }

  _setTokens(tok) {
    if (!tok.access_token || !tok.expires_in) throw new ConnectLifeAuthError('Missing access_token/expires_in');
    this.accessToken = tok.access_token;
    this.expires = Date.now() + (Number(tok.expires_in) - 90) * 1000;
    this.refreshToken = tok.refresh_token || this.refreshToken;
    const r = tok.refreshTokenExpiredTime;
    this.refreshExpires = r ? Number(r) : 0;
  }

  // ---- gateway ---------------------------------------------------------
  static unsignedString(payload) {
    const items = Object.keys(payload).filter(k => k !== 'sign').sort().map(k => {
      let v = payload[k];
      if (v !== null && typeof v === 'object') v = JSON.stringify(v);
      return `${k}=${v}`;
    });
    return `${items.join('&')}${CONST.SIGN_SUFFIX}`;
  }

  static sign(payload) {
    const digest = crypto.createHash('sha256').update(ConnectLifeApi.unsignedString(payload)).digest();
    const enc = crypto.publicEncrypt({ key: CONST.PUBLIC_KEY, padding: crypto.constants.RSA_PKCS1_PADDING }, digest);
    return enc.toString('base64');
  }

  _requestData(payload) {
    const data = {
      accessToken: this.accessToken,
      appId: CONST.APP_ID,
      appSecret: CONST.APP_SECRET,
      languageId: CONST.LANGUAGE_ID,
      randStr: crypto.randomBytes(16).toString('hex'),
      timeStamp: String(Date.now()),
      timezone: CONST.TIMEZONE,
      version: CONST.VERSION,
      ...payload,
    };
    data.sign = ConnectLifeApi.sign(data);
    return data;
  }

  async _gateway(url, payload, { method = 'POST', retryAuth = true, retryRand = true } = {}) {
    const data = this._requestData(payload);
    let res;
    if (method === 'GET') {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(data)) qs.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
      res = await fetch(`${url}?${qs.toString()}`, { headers: { 'User-Agent': 'connectlife-homey/1.0' } });
    } else {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'connectlife-homey/1.0' },
        body: JSON.stringify(data),
      });
    }
    const body = await this._parse(res, url, false);
    const gw = body.response;
    if (!gw || typeof gw !== 'object') throw new ConnectLifeError('Unexpected gateway response: missing response');
    if ([0, '0', undefined, null].includes(gw.resultCode)) return gw;
    if (retryAuth && gw.errorCode === GATEWAY_INVALID_ACCESS_TOKEN) {
      await this.login();
      return this._gateway(url, payload, { method, retryAuth: false, retryRand });
    }
    if (retryRand && gw.errorCode === GATEWAY_RANDSTR_CHECK_FAILED) {
      return this._gateway(url, payload, { method, retryAuth, retryRand: false });
    }
    const Err = gw.errorCode === GATEWAY_INVALID_ACCESS_TOKEN ? ConnectLifeAuthError : ConnectLifeError;
    throw new Err(`Gateway error ${gw.errorCode}: ${gw.errorDesc || 'unknown'}`);
  }
}

module.exports = { ConnectLifeApi, ConnectLifeError, ConnectLifeAuthError, ConnectLifeTermsError, CONST };
