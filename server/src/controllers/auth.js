const User = require('../models/user')
const jwt = require('jwt-simple')
const config = require('../../config')

module.exports = (app) => {
	return {
		token: (req, res) => {
			let user = req.body
			if (!user) {
				return res.status(401).send('Unauthorized')
			}

			const query = {
				email: user.username,
				password: user.password
			}

			const callback = (err, user) => {
				if (err) {
					return res.status(500).json({ err: err })
				}

				if (!user) {
					return res.status(401).send('Unauthorized')
				}
				const payload = {
					id: user.id
				}

				const token = jwt.encode(payload, config.jwtSecret)

				return res.json({ token: token })
			}

			user = User.findOne(query, callback)
		},
		me: (req, res) => {
			res.status(200).json({
				user: req.user
			})
		},
		register: (req, res) => {
			let data = {
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
				accounts: [{
					name: req.body.account_name,
					role: 'owner',
					enabled: true
				}]
			}

			let callback = (err, user) => {
				if (err) {
					return res.status(422).json({ err: err })
				}
				return res.status(200).json({ user: user })
			}


			User.create(data, callback)
		},
		edit: (req, res) => {
			return res.json({ page: 'auth@edit' });
		}
	}
}