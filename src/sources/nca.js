const sections = [
	'/',
	'entertainment',
	'entertainment/movies',
]

const schema = section => ({
	brand: 'News.com.au',
	endpoint: 'http://news.com.au',
	url: `http://news.com.au/${section}`,
	location: 'aus',
	section: {
		name: `${section}`,
		wrapper: '.story-block',
		title: 'h4.heading a',
		description: '.standfirst span',
		link: 'a',
		blacklist: [],
	},
	article: { include: 'story-content p' },
})

module.exports = sections.map(schema)
