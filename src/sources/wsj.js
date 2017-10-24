const sections = [
	// '/',
	'news/whats-news',
	'news/world',
]

const schema = section => ({
	brand: 'Wall Street Journal',
	endpoint: 'https://wsj.com',
	url: `https://wsj.com/${section}`,
	location: 'us',
	section: {
		name: `${section}`,
		wrapper: 'div.wsj-card',
		title: 'h3.wsj-headline a',
		description: 'p.wsj-sumary span',
		link: 'a.wsj-headline-link',
		blacklist: [],
	},
	article: { include: '.story-content p' },
})

module.exports = sections.map(schema)

