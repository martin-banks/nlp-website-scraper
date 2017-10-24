const sections = [
	// '/',
	'news',
	// 'tvandshowbiz',
	// 'tvandshowbiz/film/',
]

const schema = section => ({
	brand: 'The Sun',
	endpoint: 'https://www.thesun.co.uk/',
	url: `https://www.thesun.co.uk/${section}`,
	location: 'uk',
	section: {
		name: `${section}`,
		wrapper: '.teaser-item, .rail-item',
		title: 'p.teaser__subdeck, span.rail__item-sub',
		description: 'h2.teaser__lead',
		link: 'a.teaser-anchor',
		blacklist: [],
	},
	article: { include: '.story-content p' },
})

module.exports = sections.map(schema)

