import { Ctrl } from 'tms-koa'
import Helper from './helper'

class Base extends Ctrl {
  constructor(...args) {
    super(...args)
    this["helper"] = new Helper(this)
  }
  async tmsBeforeEach() {
    this["clPreset"] = this["helper"].clPreset
  }
}

export default Base