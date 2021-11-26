export interface PContentItem {
  content: string
  rendered: string
}

export interface PCell {
  // autogenerated by database
  key: number
  // manually setted by lexorank strategy
  rank: string
  content: PContentItem
}
