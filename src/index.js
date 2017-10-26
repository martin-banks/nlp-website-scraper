/* eslint-disable */
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const nlp = require('compromise')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const sourcelist = require('./sources/_index')



let sessionID = null
let sessionData = null
// create session directory

function createDir(dir) {
	return new Promise ((resolve, reject) => {
		mkdirp(path.join(__dirname, dir), err => {
			if (err) reject(new Error(err))
			resolve(true)
		})
	})
}

function writeFile({ name, content } = {}) {
	// console.log({ name, content })
	return new Promise ((resolve, reject) => {
		fs.writeFile(path.join(__dirname, `../data_store/${sessionID}/${name}`), content, err => {
			if (err) reject(new Error(err))
			resolve(true)
		})
	})
}
function createFolderSet({ folders } = {}) {
	const createdAllDirs = folders.map(folder => new Promise((resolve, reject) => {
		createDir(`../data_store/${sessionID}/${folder}`)
			.then(resolve)
			.catch(reject)
	}))
	return Promise.all(createdAllDirs)
}


function cleanFolderName(name) {
	return name === '/' ? 'home' : name.replace(/\//g, '__')
}

// create brand directory
function createDirectories() {
	console.log('creating directories')
	const folders = Object.keys(sourcelist).reduce((output, source) => {
		const update = output
		sourcelist[source].forEach(section => {
			const { name } = section.section
			const folderName = cleanFolderName(name)
			update.push(`${source}/${folderName}`)
		})
		return update
	}, [])
	return createFolderSet({ folders })
}



function createBrandResultManifest() {
	const createdAllManifests = Object.keys(sourcelist)
		.map(key => new Promise((resolve, reject) => {
			writeFile({ name: `${key}/manifest.txt`, content: 'hello world' })
				.then(resolve(`${key} manifest written`))
				.catch(reject)
		}))
	return Promise.all(createdAllManifests)
}


function nlpDomArticles({ dom, page, brand }) {
	const { wrapper, description, name, title, link } = page.section
	// const brand = arguments[1]
	// const dom = arguments[2]
	const articles = [...dom.window.document.querySelectorAll(wrapper)]
	const articleNLP = articles.map((article, i) => new Promise((resolve, reject) => {
		const filename = `${brand}/${cleanFolderName(name)}/${`00${i}`.slice(-3)}.json`
		const searches = {
			title: article.querySelector(title),
			description: article.querySelector(description),
			link: article.querySelector(link),
		}
		const dataToSearch = () => {
			if (searches.description) {
				return searches.description.innerHTML
			} else if (searches.title) {
				return searches.title.innerHTML
			}
			return ''
		}
		const data = nlp(dataToSearch()) 
		const output = {
			brand,
			section: name,
			title: searches.title ? searches.title.innerHTML.replace(/\n+|\t+/g, '') : '',
			description: searches.description ? searches.description.innerHTML.replace(/\n+|\t+/g, '') : null,
			link: searches.link ? searches.link.getAttribute('href') : null,
			nlp: {
				names: data.people().out('freq'),
			},
			raw: article.innerHTML,
		}

		data.people().out('array').forEach(n => {
			// console.log({n})
			n = n.replace('\'s', '')
			if (!sessionData[n]) sessionData[n] = {
				count: 0,
				articles: [],
			}
			if (sessionData[n].articles.some(a => a.title.includes(output.title))) return
			sessionData[n].count++
			sessionData[n].articles.push({
				title: output.title,
				description: output.description,
				link: output.link,
				brand: output.brand,
				section: output.section,
			})
		})

		writeFile({ name: filename, content: JSON.stringify(output, 'utf8', 2) })
			.then(resolve(true))
			.catch(reject(false))
	}))
	return Promise.all(articleNLP)
}

function createDom({ page, brand }) {
	const { url } = page
	const { name, wrapper } = page.section
	return new Promise((resolve, reject) => {
		JSDOM.fromURL(url)
			.then(r => {
				nlpDomArticles({ dom: r, page, brand }).then(resolve)
			})
			.catch(console.log)
	})
}

function processSectionsDoms(key) {
	const loadedDoms = sourcelist[key].map(page => new Promise((resolve, reject) => {
		createDom({ page, brand: key })
			.then(resolve)
			.catch(reject)
	})
		.catch(console.log)
	)
	return Promise.all(loadedDoms)
}

// load link + save page as file
function loadDomForSections() {
	const allDoms = Object.keys(sourcelist).map(key => new Promise((resolve, reject) => {
		console.log('Loading dom for', key)
		processSectionsDoms(key)
			.then(resolve)
			.catch(reject)
	}))
	return Promise.all(allDoms)

}

function createSessionID() {
	const d = new Date()
	const DD = x => `0${x}`.slice(-2)
	return `${d.getFullYear()}${DD(d.getMonth() + 1)}${DD(d.getDate())}__${DD(d.getHours())}${DD(d.getMinutes())}${DD(d.getSeconds())}`
}


function readDir({ path }) {
	return new Promise((resolve, reject) => {
		fs.readdir(path, (err, data) => {
			if (err) return reject(new Error(err))
			resolve(data)
		})
	})
}

const fileBlacklist = [
	'.DS_Store'
]

function writeSessionData(){
	console.log('writing sesion data')
	return new Promise((res, rej) => {
		const content = JSON.stringify(sessionData, 'utf8', 2)
		const name = 'session.json'
		writeFile({ name, content })
			.then(res)
			.catch(rej)
	})
}



function eol() {
	console.log('session complete')
}


function printSession() {
	console.log('session data')
	return new Promise((resolve, reject) => {
		fs.readFileSync(path.join(__dirname, `../data_store/${sessionID}/session.json`), (err, file) => {
			if (err) throw new Error(err)
			const data = JSON.parse(file)
			const orderedNames = Object.keys(data)
				.map(key => ({ name: key, count: data[key].count }))
				.sort((a, b) => b.count - a.count)
			// console.log(orderedNames)
			resolve(orderedNames)
		})
	})
}


function start(){
	sessionID = createSessionID()
	sessionData = {}
	return createDirectories()
		.then(loadDomForSections)
		// .then(processSession)
		.then(writeSessionData)
		.then(eol)
		// .then(printSession)
		.catch('oh no')		
}

start()

module.exports = start
