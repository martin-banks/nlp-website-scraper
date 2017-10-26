// logs all names in order of popularity to cli
// depricated in favour of client side app
const data = require('../data_store/20171024__181705/session.json')

const output = Object.keys(data)
	.map(key => ({ name: key, count: data[key].count }))
	.sort((a, b) => b.count - a.count)

console.log(output)