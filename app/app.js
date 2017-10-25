const express = require('express')
const fs = require('fs')
const path = require('path')
const pug = require('pug')

const app = express()
const router = express.Router()

const dataStore = path.join(__dirname, '../data_store')
app.set('view engine', 'pug')
app.use(express.static('public'))
app.use(router)

router.get('/', (req, res) => {
	fs.readdir(dataStore, (err, data) => {
		if (err) return res.send(err)
		const ordered = data
			.filter(d => d !== '.DS_Store')
			.sort((a, b) => parseInt(b.split('__').join('')) - parseInt(a.split('__').join('')))

		fs.readFile(path.join(dataStore, `${ordered[0]}/session.json`), (err, data) => {
			const d = JSON.parse(data)
			const topNames = Object.keys(d)
				.map(key => {
					const newItem = d[key]
					newItem.name = key
					return newItem
				})
				.sort((a, b) => b.count - a.count)

			res.render('topNames', { topNames, session: ordered[0] })
		})
	})
})

app.listen(4000, () => console.log('listening on 4000'))
