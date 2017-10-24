const sections = [
	// '/',
	'news',
	// 'entertainment',
	// 'movies',
]

const schema = section => ({
	brand: 'New York Post',
	endpoint: 'http://nypost.com/',
	url: `http://nypost.com/${section}`,
	location: 'us',
	section: {
		name: `${section}`,
		wrapper: 'article',
		title: 'h3, h5 a',
		description: 'div.excerpt, div.entry-content',
		link: 'a:first-of-type',
		blacklist: [],
	},
	article: { include: '.story-content p' },
})

module.exports = sections.map(schema)

