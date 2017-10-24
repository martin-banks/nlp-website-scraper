/* eslint-disable */
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const nlp = require('compromise')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const sourcelist = require('./sources/_index')
// const sources = [
// 	{
// 		brand: 'News.com.au',
// 		section: 'home',
// 		url: 'http://news.com.au',
// 		location: 'aus',
// 		section: {
// 			include: 'story-block',
// 			title: 'story-block h4',
// 			description: 'story-block p.standfirst',
// 			link: 'story-block h4 a',
// 			blacklist: [],
// 		},
// 		article: {
// 			include: 'story-content p'
// 		}
// 	}
// ]


// how to handle output???
// function readNames(props) {
// 	const { url } = props
// 	const { wrapper } = props.section
// 	JSDOM.fromURL(url).then(dom => {
// 		dom.window.document
// 			.querySelectorAll(wrapper)
// 			.forEach(wrapper => {
// 				wrapper
// 					.querySelectorAll('*')
// 					.forEach(item => {
// 						const text = (item.innerHTML)
// 							.toString()
// 							.replace(/<.+>/g, '') // remove any additional html tags

// 						const names = nlp(text)
// 							.people()
// 							.out('freq')
// 						if (!names.length) return
// 						const output = names
						
// 					})

// 				console.log(output)
// 			})
// 	});
// }


let sessionID = null
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
		const data = nlp(article.innerHTML)
		const searches = {
			title: article.querySelector(title),
			description: article.querySelector(description),
			link: article.querySelector(link),
		}
		const output = JSON.stringify({
			brand,
			title: searches.title ? searches.title.innerHTML.replace(/\n+|\t+/g, '') : null,
			description: searches.description ? searches.description.innerHTML.replace(/\n+|\t+/g, '') : null,
			link: searches.link ? searches.link.getAttribute('href') : null,
			nlp: {
				names: data.people().out('freq'),
			},
			raw: article.innerHTML,
		}, 'utf8', 2)

		writeFile({ name: filename, content: output })
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
		processSectionsDoms(key)
			.then(resolve)
			.catch(reject)
	}))
	return Promise.all(allDoms)

}

function createSessionID() {
	const d = new Date()
	const DD = x => `0${x}`.slice(-2)
	return `${d.getFullYear()}${DD(d.getMonth() + 1)}${DD(d.getDate())}__${DD(d.getHours())}_${DD(d.getMinutes())}_${DD(d.getSeconds())}`
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

function processSession() {
	console.log(arguments)
	console.log({sessionID})
	const sessionDir = path.join(__dirname, `../data_store/${sessionID}`)
	readDir({ path: sessionDir })
		// .then(readDir.bind(null, { path: path.join(sessionDir, 'nca') }))
		.then(dirContent => new Promise((resolve, reject) => {
			const children = dirContent.filter(x => !fileBlacklist.includes(x)).map(d => new Promise((res, rej) => {
				return readDir({ path: path.join(sessionDir, d) })
					.then(console.log)
					.catch(rej)
			}))
			return Promise.all(children)
		}))
		.then(console.log)

		// .then(r => {
		// 	r.filter(x => !fileBlacklist.includes(x)).forEach(x => {
		// 		readDir({ path: path.join(sessionDir, x) })
		// 			.then(console.log)
		// 			.catch(console.log)
		// 	})
		// })
		.catch(console.log)
}


;(function start(){
	sessionID = createSessionID()
	createDirectories()
		.then(loadDomForSections)
		.then(processSession)
		.catch(console.log)
}())
