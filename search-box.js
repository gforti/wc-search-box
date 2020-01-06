window.customElements.define('search-box', class extends HTMLElement {

    constructor() {
      super()
      this.checkBind = this.check.bind(this)
      this.finishBind = this.finish.bind(this)
      this.selectionBind = this.selection.bind(this)
      this.searchSelectedBind = this.searchSelected.bind(this)
      this.searches = []
      this.KEY_CODE = {
        DOWN: 40,
        ENTER: 13,
        UP: 38,
      }
    }
  
    generateTemplate() {
      return `
        <style>
          search-box .search-box-icon {
            cursor: pointer;
            fill: rgb(118, 120, 122);
            height: 32px;
            left: 0;
            padding: 0.5rem;
            position: absolute;
            top: 0;
          }
          search-box .search-box-icon:hover {
            fill: #00a602;
            stroke: #00a602
          }
          search-box input.animated-search-box {
            border: 0.125rem solid #e6e6e6;
            border-radius: 0.4rem;
            box-shadow: 0 4px 1.125rem rgba(0, 0, 0, 0.1);
            box-sizing : border-box;
            padding: 0.75rem 1.25rem 0.75rem 3rem;
            transition: width 0.2s ease-in-out;
            width: 100%;
          }
          search-box input.animated-search-box:focus {
            border-radius: 0.4rem 0.4rem 0 0;
            outline: none;
          }
          search-box .hide-search-box {
            visibility: hidden;
          }
          search-box .show-search-box {
            visibility: visible;
          }
          search-box .search-box-list {
            background-color: #fff;
            border: 0.125rem solid #e6e6e6;
            border-top-width: 0;
            box-shadow: 0 1rem 1.125rem rgba(0, 0, 0, 0.1);
            box-sizing : border-box;
            font-size: medium;
            margin-top: -2px;
            position: absolute;
            overflow: auto;
            width: 100%;
            z-index: 9000;
          }
          search-box .search-box-list > virtual-list {
            box-sizing : border-box;
            cursor: pointer;
            width: 100%;
            z-index: 9001;
          }
          search-box .search-box-list div.selected {
            background-color: #eee;
          }
          search-box .search-box-list div strong {
            background-color: #b2d6ff;
            font-weight: 500;
          }
        </style>
        <div class="search-box-input">
          <input type="search" name="search" placeholder="Search.." class="animated-search-box" required="required">
          <svg class="search-box-icon"  version="1.1" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <path d="m19.42712,21.42712c-1.38987,0.99036 -3.09047,1.57288 -4.92712,1.57288c-4.69442,0 -8.5,-3.80558 -8.5,-8.5c0,-4.69442 3.80558,-8.5 8.5,-8.5c4.69442,0 8.5,3.80558 8.5,8.5c0,1.83665 -0.58252,3.53725 -1.57288,4.92712l5.5848,5.5848c0.5502,0.5502 0.54561,1.43055 -0.0002,1.97636l-0.02344,0.02344c-0.54442,0.54442 -1.43066,0.5459 -1.97636,0.0002l-5.5848,-5.5848l0,0zm-4.92712,-0.42712c3.58985,0 6.5,-2.91015 6.5,-6.5c0,-3.58985 -2.91015,-6.5 -6.5,-6.5c-3.58985,0 -6.5,2.91015 -6.5,6.5c0,3.58985 2.91015,6.5 6.5,6.5l0,0z" />
          </svg>
        </div>
        <div class="search-box-list hide-search-box">
          <virtual-list></virtual-list>
        </div>
      `
    }
  
    connectedCallback() {
      this.innerHTML = this.generateTemplate()
      this.search = this.querySelector('input')
      this.list = this.querySelector('div.search-box-list')
      this.searchIcon = this.querySelector('.search-box-icon')
      this.virtualList = this.list.querySelector('virtual-list')
  
      this.virtualList.addEventListener('v-item-selected', (evt) => {
        this.search.value = this.removeHTML(evt.detail.itemValue)
      })
  
      this.search.addEventListener('focus', this.checkBind)
      this.search.addEventListener('input', this.checkBind)
      this.search.addEventListener('keydown', this.selectionBind)
      this.search.addEventListener('blur', this.finishBind)
      this.searchIcon.addEventListener('click', this.searchSelectedBind)
      this.render()
    }
  
    disconnectedCallback() {
      this.search.removeEventListener('focus', this.checkBind)
      this.search.removeEventListener('input', this.checkBind)
      this.search.removeEventListener('keydown', this.selectionBind)
      this.search.removeEventListener('blur', this.finishBind)
      this.searchIcon.removeEventListener('click', this.searchSelectedBind)
    }
  
    static get observedAttributes() {
      return ['data-placeholder']
    }
  
    attributeChangedCallback(attr, oldValue, newValue) {
      if (oldValue !== newValue) {
        this.render()
      }
    }
  
    render() {
      if (!this.search) return
      this.search.setAttribute('placeholder', this.dataset.placeholder || 'Search..')
    }
  
    setSearchList(searches) {
      if (Array.isArray(searches)) {
        this.searches = [...new Set(searches).values()]
        this.virtualList.render({
            displayAmt: 5,
            listItems: this.searches,
            tag: 'search-row'
        })
      }
    }
  
    async check(event) {
      if (Object.values(this.KEY_CODE).indexOf(event.keyCode) > -1) return
      let list = this.searches
      const find = this.search.value
      if (this.search.value.length) {
        list = list.filter(search => search.toUpperCase().includes(find.toUpperCase()) && search.toUpperCase() !== find.toUpperCase()).map((search) => {
          const findRE = new RegExp(find, 'i')
          return search.replace(findRE, function (x) {
            return `<strong>${x}</strong>`
          })
        })
      }
  
      if (list.length) {
        this.list.classList.add('show-search-box')
        await this.virtualList.render({
            displayAmt: 5,
            listItems: list,
            tag: 'search-row'
        })
      } else {
        this.list.classList.remove('show-search-box')
      }
    }
  
    selection(event) {
      if (Object.values(this.KEY_CODE).indexOf(event.keyCode) === -1) return
      if (event.keyCode === this.KEY_CODE.ENTER) {
        this.virtualList.triggerSelected()
        this.searchSelected()
      }
      if (event.keyCode === this.KEY_CODE.DOWN) {
        this.virtualList.vItemDown()
      }
      if (event.keyCode === this.KEY_CODE.UP) {
        this.virtualList.vItemUp()
      }
    }
  
    searchSelected() {
      this.dispatchEvent(new CustomEvent('search-selected', { detail: this.search.value }))
    }
  
    finish() {
      setTimeout(() => {
        this.list.classList.remove('show-search-box')
      }, 200)
    }

    removeHTML(input) {
        const doc = new DOMParser().parseFromString(input, 'text/html')
        const docEnsure = new DOMParser().parseFromString(doc.documentElement.textContent, 'text/html')
        return docEnsure.documentElement.textContent
      }
  
  })