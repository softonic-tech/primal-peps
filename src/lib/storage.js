import {
  PRODUCTS,
  PTS_PER_DOLLAR,
  findVariant,
  orderItemImg,
} from '../data/products'

const KEY = 'primal_peps_store_v1'

const DEMO_EMAIL = 'demo@primalpeps.com'
const DEMO_PASS = 'demo1234'

function catalogItem(productId, variantId, qty = 1) {
  const product = PRODUCTS.find((p) => p.id === productId)
  const variant = findVariant(product, variantId)
  return {
    productId: product.id,
    name: product.name,
    variantLabel: variant.label,
    qty,
    price: variant.price,
    img: variant.img,
  }
}

function seed() {
  const items = [
    catalogItem('reta', '5mg', 1),
    catalogItem('bpc', '10mg', 1),
  ]
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const shippingFee = 9.95
  const total = subtotal + shippingFee

  return {
    users: {
      [DEMO_EMAIL]: {
        id: 'usr_demo',
        email: DEMO_EMAIL,
        password: DEMO_PASS,
        fullName: 'Alex Morgan',
        phone: '+61 400 123 456',
        shipping: {
          line1: '42 Research Lane',
          line2: 'Unit 3',
          suburb: 'Southbank',
          state: 'VIC',
          postcode: '3006',
        },
        points: 420,
        orders: [
          {
            id: 'ORD-1001',
            createdAt: '2026-06-02T10:00:00.000Z',
            status: 'Delivered',
            items,
            subtotal,
            shippingFee,
            total,
            pointsEarned: Math.round(total * PTS_PER_DOLLAR),
            shipping: {
              fullName: 'Alex Morgan',
              email: DEMO_EMAIL,
              phone: '+61 400 123 456',
              line1: '42 Research Lane',
              line2: 'Unit 3',
              suburb: 'Southbank',
              state: 'VIC',
              postcode: '3006',
              method: 'standard',
            },
          },
        ],
        createdAt: '2026-05-01T00:00:00.000Z',
      },
    },
    sessionEmail: null,
    reviews: [
      {
        id: 'rev_demo_1',
        productId: 'reta',
        userId: 'usr_demo',
        userName: 'Alex Morgan',
        rating: 5,
        body: 'Fast dispatch and clear labelling. Exactly what I needed for the lab bench.',
        createdAt: '2026-06-10T12:00:00.000Z',
        orderId: 'ORD-1001',
      },
    ],
  }
}

function normalizeStore(store) {
  Object.values(store.users || {}).forEach((user) => {
    ;(user.orders || []).forEach((order) => {
      ;(order.items || []).forEach((item) => {
        const resolved = orderItemImg(item)
        if (resolved) item.img = resolved
      })
    })
  })
  return store
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const initial = seed()
      localStorage.setItem(KEY, JSON.stringify(initial))
      return initial
    }
    const store = normalizeStore(JSON.parse(raw))
    localStorage.setItem(KEY, JSON.stringify(store))
    return store
  } catch {
    const initial = seed()
    localStorage.setItem(KEY, JSON.stringify(initial))
    return initial
  }
}

export function saveStore(store) {
  localStorage.setItem(KEY, JSON.stringify(store))
}

export { DEMO_EMAIL, DEMO_PASS }
