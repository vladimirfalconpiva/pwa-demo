<template>
  <div class="image-width-description inline-block p-12 border">
    <div class="flex items-center">
      <div class="flex-1 mr-8">
        <ce-header v-bind="$props" />
        <html-parser :content="bodytext" />
      </div>
      <div>
        <file v-for="(file, key) in assets" :key="key" :file="file" />
      </div>
    </div>
  </div>
</template>
<script>
import baseCe from '~typo3/components/content/mixins/baseCe'
import File from '~typo3/components/content/elements/media/File'
export default {
  name: 'CeImageWithDescription',
  components: {
    File
  },
  extends: baseCe,
  props: {
    bodytext: {
      type: String,
      required: false,
      default: ''
    },
    assets: {
      type: Array,
      required: false,
      default: () => []
    }
  }
}
</script>
