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
	return new Promise ((resolve, reject) => {
		fs.writeFile(path.join(__dirname, `../data_store/${sessionID}/${name}`), content, err => {
			if (err) reject(new Error(err))
			resolve(true)
		})
	})
}


// function createSessionDir(){
// 	return new Promise((resolve, reject) => {
// 		resolve(createDir(`/data_store/${sessionID}`))
// 	})
// }

// create brand directory
function createDirectories() {
	sessionID = 'test_session'
	const createdAllDirs = Object
		.keys(sourcelist)
		.map(key => new Promise((resolve, reject) => {
			createDir(`../data_store/${sessionID}/${key}`)
				.then(resolve(true))
				.catch(reject(false))
		}))
	return Promise.all(createdAllDirs)
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

// create section directory
function createSectionDirectory() {}


// load link
function loadDomForSection() {}

// save page to file
function savePageSource() {}

// get all article links from section page
// search page for article links
function getSectionPageContent() {}

// save items to file
function saveSectionContent() {}


// read file
// process text
// write to new file


createDirectories()
	.then(createBrandResultManifest)
	.then(console.log)
	.catch(console.log)

