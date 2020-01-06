window.customElements.define('search-row', class extends HTMLElement {

  constructor() {
    super('')
    this.itemValue = ''
  }

  updateModel(data) {
    this.itemValue = data
    this.innerHTML = data
  }

})
