/* eslint-disable */
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const nlp = require('compromise')

const sources = [
	{
		brand: 'News.com.au',
		section: 'home',
		url: 'http://news.com.au',
		location: 'aus',
		section: {
			include: 'story-block',
			title: 'story-block h4',
			description: 'story-block p.standfirst',
			link: 'story-block h4 a',
			blacklist: [],
		},
		article: {
			include: 'story-content p'
		}
	}
]

// how to handle output???
JSDOM.fromURL("http://nypost.com/").then(dom => {
	dom.window.document
		.querySelectorAll('*')
		.forEach(p => {
			const text = (p.innerHTML)
				.toString()
				.replace(/<.+>/g, '') // remove any additional html tags

			const names = nlp(text)
				.people()
				.out('freq')
			if (!names.length) return
			const output = names

			console.log(output)
		})
});
