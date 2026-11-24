export const CATEGORIES = ['Gitar', 'Keyboard', 'Ukulele', 'Aksesoris'] as const
export type Category = (typeof CATEGORIES)[number]

export type Product = {
  id: number
  name: string
  category: Category
  sub: string
  price: number
  stock: number
  tag: string
  image: string
  cutout: boolean
  desc: string
  spec: string
  model: string
}

export type CartLine = { id: number; qty: number }
