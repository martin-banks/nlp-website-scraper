const express = require('express')
const fs = require('fs')
const path = require('path')
const pug = require('pug')
const { CronJob } = require('cron')
const getData = require('../src/index')
const controllers = require('../controllers/index')

const { lastSession, sessionList, getSession } = controllers

let i = 0
const job = new CronJob({
	// cronTime: '00 00 00,06,12,18 * * *',
	cronTime: '00 00 00,06,12,18 * * *',
	onTick: () => {
		i++
		console.log('Cron jobs run:', i)
		getData()
	},
	start: false,
	timeZone: 'Australia/Sydney',
})


// set up web service
const port = 7001
const app = express()
const router = express.Router()

app.set('view engine', 'pug')
app.use(express.static('public'))
app.use(router)

router.get('/', lastSession)
router.get('/sessions', sessionList)
router.get('/sessions/:id', getSession)

app.listen(port, () => console.log(`listening on ${port}`))
job.start()
