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
			.then(resolve(true))
			.catch(reject(false))
	}))
	return Promise.all(createdAllDirs)
}
// function readDir({ path }) {
// 	return new Promise((resolve, reject) => {
// 		fs.readDir(path.join(__dirname, `${sessionID}/${dir}`), (err, data) => {
// 			if (err) reject(new Error(err))
// 		})
// 	})
// }


function cleanFolderName(name) {
	return name === '/' ? 'home' : name.replace(/\//g, '__')
}

// create brand directory
function createDirectories() {
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


function nlpDomArticles() {
	const { wrapper, description, name, title, link } = arguments[0].section
	const brand = arguments[1]
	const dom = arguments[2]
	const articles = [...dom.window.document.querySelectorAll(wrapper)]
	const articleNLP = articles.map((article, i) => new Promise((resolve, reject) => {
		const data = nlp(article.innerHTML)
		const searches = {
			title: article.querySelector(title),
			description: article.querySelector(description),
			link: article.querySelector(link),
		}

		const output = {
			brand,
			title: searches.title ? searches.title.innerHTML.replace(/\n+|\t+/g, '') : null,
			description: searches.description ? searches.description.innerHTML.replace(/\n+|\t+/g, '') : null,
			link: searches.link ? searches.link.getAttribute('href') : null,
			nlp: {
				names: data.people().out('freq'),
			},
			raw: article.innerHTML,
		}
		writeFile({ name: `${brand}/${cleanFolderName(name)}/names__${i}.json`, content: JSON.stringify(output, 'utf8', 2) })
			.then(resolve(true))
			.catch(reject(false))
	}))
	return Promise.all(articleNLP)
}

function createDom({ page, brand }) {
	console.log({ brand })
	const { url } = page
	const { name, wrapper } = page.section
	return new Promise((resolve, reject) => {
		resolve(JSDOM.fromURL(url)
			.then(nlpDomArticles.bind(null, page, brand))
			.catch(console.log))
	})
}

// load link + save page as file
function loadDomForSections() {
	Object.keys(sourcelist).forEach(key => {
		const loadedDoms = sourcelist[key].map(page => new Promise((resolve, reject) => {
			console.log({ key })
			createDom({ page, brand: key })
				.then(resolve(true))
				.catch(reject(false))
			reject(false)
		})
			.catch(console.log)
		)
		Promise.all(loadedDoms)
	})
}


// get all article links from section page
// search page for article links
function getSectionPageContent() {}

// save items to file
function saveSectionContent() {}


// read file
// process text
// write to new file

function createSession() {
	const d = new Date()
	const DD = x => `0${x}`.slice(-2)
	return `${d.getFullYear()}${DD(d.getMonth())}${DD(d.getDate())}__${DD(d.getHours())}_${DD(d.getMinutes())}_${DD(d.getSeconds())}`
}
sessionID = createSession()
createDirectories()
	.then(loadDomForSections)
	.then(console.log)
	.catch(console.log)

