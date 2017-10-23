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
		title: '.story-block h4',
		description: '.story-block p.standfirst',
		link: 'story-block h4 a',
		blacklist: [],
	},
	article: { include: 'story-content p' },
})

module.exports = sections.map(schema)


