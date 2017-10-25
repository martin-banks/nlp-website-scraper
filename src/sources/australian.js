const sections = [
	'/',
	'news/nation',
	'news/world',
	// 'arts',
	// 'arts/film',
]

const schema = section => ({
	brand: 'the Australian',
	endpoint: 'http://theaustralian.com.au',
	url: `http://theaustralian.com.au/${section}`,
	location: 'aus',
	section: {
		name: `${section}`,
		wrapper: '.story-block',
		title: 'h4.heading a',
		description: '.standfirst span, p.standfirst',
		link: 'a',
		blacklist: [],
	},
	article: { include: '.story-content p' },
})

module.exports = sections.map(schema)


