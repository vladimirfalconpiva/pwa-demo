/* eslint-disable camelcase */
import Vue from 'vue'
import CeBullets from '~/components/content/CeBullets'
import CeSitepackage_image_with_description from '~/components/content/CeSitepackage_image_with_description.vue'

const components = {
  CeBullets,
  CeSitepackage_image_with_description
}

export default ({ app }) => {
  Object.keys(components).forEach((key) => {
    Vue.component(key, components[key])
  })
}
