import * as scripts from 'micromanager'
import { on, fetchCart } from 'slater/cart'
import { getSizedImageUrl, imageSize } from 'slater/images'
import { formatMoney } from 'slater/currency'

const X = `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentcolor" stroke-width="3" style="display:inline-block;vertical-align:middle;overflow:visible;"><path d="M1.0606601717798212 1.0606601717798212 L14.939339828220179 14.939339828220179"></path><path d="M14.939339828220179 1.0606601717798212 L1.0606601717798212 14.939339828220179"></path></svg>`

function createItem ({
  variant_id: id,
  product_title: title,
  line_price: price,
  variant_title: color,
  image,
  url,
  quantity,
  ...item
}) {
  const img = image ? getSizedImageUrl(
    image.replace('_' + imageSize(image), ''), '200x' // TODO hacky af
  ) : 'https://source.unsplash.com/R9OS29xJb-8/2000x1333'

  return `
<div class='cart-drawer__item' data-component='cart-drawer-item' data-id=${id}>
  <div class='f aic'>
    <a href='${url}'>
      <img src='${img}' />
    </a>
    <div class='__content pl1 f fill-h ais jcb'>
      <div>
        <a href='${url}' class='serif mv0 p mv0'>${title}</a>
        <div class='small sans track mt025 mb05 book'>${formatMoney(price)}</div>
        ${color ? `<div class='xsmall sans caps track cm mv025 book'>${color.split(':')[0]}</div>` : ``}
      </div>

      <button class='button--reset'>${X}</button>
    </div>
  </div>
</div>
`
}

function renderItems (items) {
  return items.length > 0 ? (
    items.reduce((markup, item) => {
      markup += createItem(item)
      return markup
    }, '')
  ) : (
    `<div class='pv1'><p class='pv1 mv05 sans small cm i ac'>Your cart is empty</p></div>`
  )
}

export default outer => {
  let isOpen = false

  const overlay = outer.querySelector('.js-overlay')
  const closeButton = outer.querySelector('.js-close')
  const subtotal = outer.querySelector('.js-subtotal')
  const itemsRoot = outer.querySelector('.js-items')
  const loading = itemsRoot.innerHTML

  function render () {
    fetchCart().then(cart => {
      itemsRoot.innerHTML = renderItems(cart.items)
      subtotal.innerHTML = formatMoney(cart.total_price)
      setTimeout(() => {
        scripts.mount()
      }, 0)
    })
  }

  function open () {
    outer.classList.add('is-active')

    itemsRoot.innerHTML = loading

    setTimeout(() => {
      outer.classList.add('is-visible')
      isOpen = true
      setTimeout(render, 10)
    }, 50)
  }

  function close () {
    outer.classList.remove('is-visible')

    setTimeout(() => {
      outer.classList.remove('is-active')
      isOpen = false
    }, 400)
  }

  on('updated', ({ cart }) => {
    isOpen ? render() : open()
  })
  overlay.addEventListener('click', close)
  closeButton.addEventListener('click', close)

  return {
    open,
    close: close
  }
}
