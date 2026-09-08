const User = require('../models/user');
const List = require('../models/list');
const Lead = require('../models/lead');
const Campaign = require('../models/campaign');
const { getRegistrationAllowed, setRegistrationAllowed } = require('../services/registrationSetting');

const USER_FIELDS = '_id name email role enabled createdAt';

module.exports = function () {
  return {
    listUsers: async (req, res) => {
      const users = await User.find({}, USER_FIELDS);
      return res.json({ data: users });
    },

    updateUser: async (req, res) => {
      if (req.params.id === req.user._id.toString()) {
        return res.status(400).json({ error: 'Cannot modify your own account' });
      }

      const data = {};
      if (Object.prototype.hasOwnProperty.call(req.body, 'enabled')) {
        data.enabled = req.body.enabled;
      }
      if (Object.prototype.hasOwnProperty.call(req.body, 'role')) {
        data.role = req.body.role;
      }

      try {
        const user = await User.findByIdAndUpdate(
          req.params.id,
          { $set: data },
          { returnDocument: 'after', fields: USER_FIELDS, runValidators: true, context: 'query' }
        );
        if (!user) {
          return res.status(404).json({ error: 'Not found' });
        }
        return res.json({ data: user });
      } catch (err) {
        return res.status(422).json({ err });
      }
    },

    stats: async (req, res) => {
      const [users, lists, leads, campaigns] = await Promise.all([
        User.countDocuments(),
        List.countDocuments(),
        Lead.countDocuments(),
        Campaign.countDocuments()
      ]);
      return res.json({ users, lists, leads, campaigns });
    },

    getSettings: async (req, res) => {
      const allowRegistration = await getRegistrationAllowed();
      return res.json({ allowRegistration });
    },

    updateSettings: async (req, res) => {
      if (!Object.prototype.hasOwnProperty.call(req.body, 'allowRegistration')) {
        return res.status(400).json({ error: 'allowRegistration is required' });
      }
      const allowRegistration = await setRegistrationAllowed(req.body.allowRegistration);
      return res.json({ allowRegistration });
    }
  };
};
