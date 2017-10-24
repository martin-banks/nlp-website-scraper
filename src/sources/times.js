const sections = [
	'/',
]

const schema = section => ({
	brand: 'The Sun',
	endpoint: 'https://www.thetimes.co.uk/',
	url: `https://www.thetimes.co.uk/${section}`,
	location: 'uk',
	section: {
		name: `${section}`,
		wrapper: 'div.Item-content',
		title: 'h3.Item-headline a',
		description: 'p.Item-dip span, p.Strapline',
		link: 'a',
		blacklist: [],
	},
	article: { include: '.story-content p' },
})

module.exports = sections.map(schema)

