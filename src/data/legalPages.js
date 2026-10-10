/**
 * Legal / policy pages for the storefront.
 * Paths are flat for clear footer & SEO links.
 */

export const LEGAL_NAV = [
  { slug: 'shipping-policy', title: 'Shipping Policy' },
  { slug: 'returns', title: 'Return & Refund Policy' },
  { slug: 'privacy', title: 'Privacy Policy' },
  { slug: 'terms', title: 'Terms of Service' },
  { slug: 'legal', title: 'Legal & compliance' },
]

const LAST_UPDATED = '11 October 2026'

export const LEGAL_PAGES = {
  'shipping-policy': {
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    description:
      'Primal Peps shipping policy — Australia-only dispatch, discreet packaging, tracking, and free shipping thresholds.',
    updated: LAST_UPDATED,
    sections: [
      {
        heading: 'Where we ship',
        paragraphs: [
          'We currently ship within Australia only. International orders are not accepted at this time.',
        ],
      },
      {
        heading: 'Dispatch',
        paragraphs: [
          'Orders are processed after PayID payment clears. We aim to dispatch within 24 hours of cleared payment on business days (excluding public holidays).',
          'All parcels leave in secure, discreet packaging with no product branding on the outer carton.',
        ],
      },
      {
        heading: 'Delivery times',
        paragraphs: [
          'Typical Australia Post delivery is about 2–4 business days for Express and 5–8 business days for Standard, depending on your location. These windows are estimates only and may be affected by carrier delays or public holidays.',
        ],
      },
      {
        heading: 'Shipping fees',
        paragraphs: [
          'Shipping is calculated at checkout. Orders over the free-shipping threshold shown at checkout (currently $150 unless updated on site) may qualify for free shipping.',
        ],
      },
      {
        heading: 'Tracking',
        paragraphs: [
          'Once your order ships, we email a tracking number where available. You can also look up status on our Track order page using your order ID and checkout email.',
          'If you do not see shipping emails, check your spam / junk folder and add us to your contacts.',
        ],
      },
      {
        heading: 'Failed delivery & address errors',
        paragraphs: [
          'Please double-check your Australian shipping address before submitting. Extra carrier fees caused by incorrect addresses may be charged to the customer or may delay redelivery.',
        ],
      },
    ],
  },

  returns: {
    slug: 'returns',
    title: 'Return & Refund Policy',
    description:
      'Primal Peps return and refund policy for research peptides — damaged, incorrect, or defective orders.',
    updated: LAST_UPDATED,
    sections: [
      {
        heading: 'Cold-chain & research products',
        paragraphs: [
          'Our products are temperature-sensitive research compounds. For integrity and compliance reasons, we do not accept returns of opened, used, or stored products for change of mind or research outcome.',
        ],
      },
      {
        heading: 'Damaged, incorrect, or defective items',
        paragraphs: [
          'If your order arrives damaged, incorrect, or clearly defective, photograph the outer packaging and product as soon as you receive it and contact us within 7 days of delivery with your order ID.',
          'We will assess each case on its merits and, at our discretion, arrange a replacement or refund of the affected item(s).',
        ],
      },
      {
        heading: 'Payment & cancellations',
        paragraphs: [
          'Orders are paid by PayID. If you transfer the wrong amount or need help matching a payment, contact support with your order ID and transfer receipt.',
          'If an order is cancelled before dispatch (for example, unpaid after a reasonable period, or stock unavailable), we will advise you by email. Nothing in this policy excludes rights under the Australian Consumer Law that cannot lawfully be excluded.',
        ],
      },
      {
        heading: 'How to contact us',
        paragraphs: [
          'Use the email or phone listed in the site footer, and include your order ID so we can help quickly.',
        ],
      },
    ],
  },

  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    description:
      'How Primal Peps collects, uses, and protects personal information for orders and support.',
    updated: LAST_UPDATED,
    sections: [
      {
        heading: 'What we collect',
        paragraphs: [
          'We collect information needed to fulfil orders and provide support: name, email, phone, shipping address, order details, and account information if you create an account.',
          'PayID payments are completed through your bank. We do not store bank login credentials or full card numbers.',
        ],
      },
      {
        heading: 'How we use your information',
        paragraphs: [
          'We use your information to process and fulfil orders, send order-related emails (confirmation, payment, shipping, and similar updates), manage accounts and loyalty points, improve the storefront, and respond to support requests.',
          'We do not sell your personal information for third-party marketing.',
        ],
      },
      {
        heading: 'Email & marketing',
        paragraphs: [
          'Transactional emails about your order are necessary to fulfil the purchase. Optional newsletter or promo emails can be unsubscribed via the link in those messages where provided.',
          'Order emails sometimes land in spam — please check junk folders for confirmation and shipping updates.',
        ],
      },
      {
        heading: 'Cookies & local storage',
        paragraphs: [
          'We use cookies and browser storage to keep your cart, session, and basic site preferences working. Analytics or advertising tools may also set cookies if enabled on the site.',
        ],
      },
      {
        heading: 'Sharing',
        paragraphs: [
          'We may share information with service providers who help us operate (for example hosting, email delivery, and carriers such as Australia Post for shipping). They may only use the information to perform those services.',
          'We may also disclose information if required by law.',
        ],
      },
      {
        heading: 'Retention & security',
        paragraphs: [
          'We keep order and account records for as long as needed for fulfilment, accounting, dispute resolution, and legal obligations. We take reasonable steps to protect personal information, but no online transmission is completely secure.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          'For privacy questions, contact us using the details in the site footer and include enough information for us to identify your request.',
        ],
      },
    ],
  },

  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    description:
      'Primal Peps terms of service — research use only, eligibility, ordering, payment, and liability.',
    updated: LAST_UPDATED,
    sections: [
      {
        heading: '1. Acceptance',
        paragraphs: [
          'By accessing this website or placing an order with Primal Peps, you agree to these Terms of Service and our related policies (Privacy, Shipping, Returns, and Legal & compliance). If you do not agree, do not use the site or purchase products.',
        ],
      },
      {
        heading: '2. Research use only',
        paragraphs: [
          'All products are intended strictly for laboratory and research use only. They are not medicines, supplements, or therapeutic goods and are not intended for human or veterinary consumption or use.',
          'By ordering, you represent that you will use products only for lawful research purposes and will comply with applicable laws for purchase, handling, storage, and use.',
        ],
      },
      {
        heading: '3. Eligibility',
        paragraphs: [
          'You must be 18 years of age or older and have legal capacity to enter a binding contract. By purchasing, you acknowledge that you meet this age requirement.',
        ],
      },
      {
        heading: '4. Products & information',
        paragraphs: [
          'We aim to keep product descriptions, pricing, and documentation accurate. Certificates of Analysis (where available) relate to the applicable manufacturing batch. We may correct errors and update information at any time without notice.',
        ],
      },
      {
        heading: '5. Ordering & payment',
        paragraphs: [
          'Submitting an order is an offer to purchase. All orders are subject to acceptance and availability. Prices are shown in Australian dollars (AUD) unless stated otherwise.',
          'Payment is by PayID transfer. Your order remains awaiting payment until funds clear and are matched to your order ID. We may cancel unpaid orders.',
        ],
      },
      {
        heading: '6. Shipping & returns',
        paragraphs: [
          'Shipping and delivery are described in our Shipping Policy. Returns and refunds are described in our Return & Refund Policy. Risk of loss generally passes when the parcel is handed to the carrier.',
        ],
      },
      {
        heading: '7. Disclaimer & liability',
        paragraphs: [
          'To the maximum extent permitted by law, the site and products are provided as is. We are not liable for misuse of research compounds or for indirect or consequential loss.',
          'Nothing in these Terms excludes rights under the Australian Consumer Law that cannot lawfully be excluded. Where liability cannot be excluded, it is limited to resupply of the goods or payment of the cost of resupply, where permitted.',
        ],
      },
      {
        heading: '8. Intellectual property',
        paragraphs: [
          'Site content, branding, and product imagery are owned by Primal Peps or its licensors and may not be copied or reused without permission.',
        ],
      },
      {
        heading: '9. Governing law',
        paragraphs: [
          'These Terms are governed by the laws of Australia. Courts in Australia may hear disputes arising from these Terms or your orders.',
        ],
      },
      {
        heading: '10. Changes',
        paragraphs: [
          'We may update these Terms from time to time. The version published on this page applies to new orders placed after the update.',
        ],
      },
    ],
  },

  legal: {
    slug: 'legal',
    title: 'Legal & compliance',
    description:
      'Primal Peps legal and compliance notice — research use only, age restriction, and regulatory position.',
    updated: LAST_UPDATED,
    sections: [
      {
        heading: 'Research use only (RUO)',
        paragraphs: [
          'All products sold by Primal Peps are intended strictly for laboratory and research use only. They are not medicines, supplements, or therapeutic goods and are not intended for human or veterinary consumption or use.',
        ],
      },
      {
        heading: 'Age restriction',
        paragraphs: [
          'You must be 18 years of age or older to purchase from Primal Peps. By completing checkout you acknowledge that you meet this requirement.',
        ],
      },
      {
        heading: 'Regulatory status',
        paragraphs: [
          'Products have not been evaluated or approved by the Therapeutic Goods Administration (TGA) as therapeutic goods for human use. Buyers are responsible for ensuring their intended research use is lawful in their jurisdiction.',
        ],
      },
      {
        heading: 'Quality documentation',
        paragraphs: [
          'Where available, Certificates of Analysis are provided for research documentation. Browse the COA Library on this site. COAs describe tested batch attributes and do not constitute medical advice or a guarantee of suitability for any non-research purpose.',
        ],
      },
      {
        heading: 'Related policies',
        paragraphs: [
          'Please also read our Terms of Service, Privacy Policy, Shipping Policy, and Return & Refund Policy. Together they form part of the conditions of sale.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          'For compliance or legal questions about our storefront, contact us using the details in the site footer.',
        ],
      },
    ],
  },
}

export function getLegalPage(slug) {
  return LEGAL_PAGES[slug] || null
}
