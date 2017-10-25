const articleList = document.querySelectorAll('[data-type="articlelist"]')

function toggleList() {
	const isHidden = [...this.classList].includes('hidden')
	this.classList[isHidden ? 'remove' : 'add']('hidden')
}
articleList.forEach(x => x.addEventListener('click', toggleList))
