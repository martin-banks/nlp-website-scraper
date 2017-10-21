/* eslint-disable */
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const nlp = require('compromise')


// how to handle output???
JSDOM.fromURL("http://nypost.com/").then(dom => {
	dom.window.document
		.querySelectorAll('*')
		.forEach(p => {
			const text = (p.innerHTML)
				.toString()
				.replace(/<.+>/g, '')

			const names = nlp(text)
				.people()
				.out('freq')
			if (!names.length) return
			const output = names

			console.log(output)
		})
});
