const Setting = require('../models/setting');

const KEY = 'allowRegistration';

// DB setting wins when present; otherwise fall back to the env var default.
async function isRegistrationAllowed() {
  const setting = await Setting.findOne({ key: KEY });
  if (setting) {
    return !!setting.value;
  }
  return process.env.ALLOW_REGISTRATION !== 'false';
}

async function getRegistrationAllowed() {
  return isRegistrationAllowed();
}

async function setRegistrationAllowed(value) {
  await Setting.findOneAndUpdate(
    { key: KEY },
    { key: KEY, value: !!value },
    { upsert: true }
  );
  return !!value;
}

module.exports = { isRegistrationAllowed, getRegistrationAllowed, setRegistrationAllowed };
