# TYPO3 PWA Demo Workshops

# BACKEND PART

## Modify core content element response
Using typoscript, we can override and any field, so we will try to add one field with static value declared in typoscript.

Let's take tt_content with CType text with default response which look like this.
```
{
    id: 78,
    pid: 3,
    type: "text",
    colPos: 0,
    categories: "",
    appearance: {
        layout: "default",
        frameClass: "ruler-after",
        spaceBefore: "",
        spaceAfter: "",
    },
    content: {
        header: "",
        subheader: "",
        headerLayout: 0,
        headerPosition: "",
        headerLink: "",
        bodytext: ""
    }
}
```

 For this case we should create file `Text.typoscript` in
```
public/typo3conf/ext/site_package/Configuration/TypoScript/Plain/ContentElement/
```
with following content

```
tt_content.text {
    fields {
        appearance {
            fields {
                class = TEXT
                class {
                    value = full-width
                }
            }
        }
    }
}
```

we don't have to declare JSON content object, because it's already declared in headless.
Save, clear TYPO3 cache and take a look at response now.

```
{
    id: 78,
    pid: 3,
    type: "text",
    colPos: 0,
    categories: "",
    appearance: {
        layout: "default",
        frameClass: "ruler-after",
        spaceBefore: "",
        spaceAfter: "",
        class: "full-width"
    },
    content: {
        header: "",
        subheader: "",
        headerLayout: 0,
        headerPosition: "",
        headerLink: "",
        bodytext: ""
    }
}
```

We can see, that we have additional field in appearance with value "full-width". As we know what typoscript is capable of,
we can basically insert any value into our fields.

## Custom content element in TYPO3PWA approach
### Backend part
We have prepared custom content element "Image with description" implemented in EXT:site_package without content element rendering definition,
your task is to add it.

Those files are responsible for content element declaration.

```
public/typo3conf/ext/site_package/Configuration/TSConfig/Mod/ContentElements/ImageWithDescription.tsconfig
public/typo3conf/ext/site_package/Configuration/TCA/Overrides/tt_content_image_with_description.php
```

And when we try to display this element on frontend we can see that it has no rendering definition.

```
{
    id: 77,
    pid: 3,
    type: "sitepackage_image_with_description",
    colPos: 0,
    categories: "",
    appearance: {
        layout: "default",
        frameClass: "default",
        spaceBefore: "",
        spaceAfter: ""
    },
    content: {
        error: "Content Element with uid "77" and type "sitepackage_image_with_description" has no rendering definition!"
    }
}
```

So we need to add one. Usually, we added typoscript with FLUDTEMPLATE along with fluid html file, but in headless case,
we define everything in typoscript. So to achieve this, let's see what fields we need to add.

We want to use 4 fields

```
'header', type: string
'headerLink', type: string typolink
'bodytext', type: string RTE
'assets', type: dataProcessing media

```

Let's create file in following path

`public/typo3conf/ext/site_package/Configuration/TypoScript/Plain/ContentElement/Text.typoscript`

With content

```
tt_content.sitepackage_image_with_description =< lib.contentElement
tt_content.sitepackage_image_with_description {
    fields {
        content {
            fields {
                header = TEXT
                header {
                    field = header
                }
                headerLink = TEXT
                headerLink {
                    field = header_link
                    htmlSpecialChars = 1
                    typolink {
                        parameter {
                            field = header_link
                        }
                        returnLast = url
                    }
                }
                bodytext = TEXT
                bodytext {
                    field = bodytext
                    parseFunc =< lib.parseFunc_links
                }
                assets = TEXT
                assets {
                    dataProcessing {
                        10 = FriendsOfTYPO3\Headless\DataProcessing\FilesProcessor
                        10 {
                            references.fieldName = assets
                            as = assets
                        }
                    }
                }
            }
        }
    }
}
```

Quick explanation, let's break it part by part

```
tt_content.sitepackage_image_with_description =< lib.contentElement
```
in this line, we copy value from lib.contentElement which holds JSON content object with default fields such as uid, pid, etc.
and assign it to tt_content with CType sitepackage_image_with_description
then, we declare fields, and first field is content, which is nested one more time, and then we can see 4 fields

```
header = TEXT
header {
    field = header
}
```
it's easy one, we just take field header from DB

```
headerLink = TEXT
headerLink {
    field = header_link
    htmlSpecialChars = 1
    typolink {
        parameter {
            field = header_link
        }
        returnLast = url
    }
}
```

in headerLink field, we declare that we want to use field header_link, but also, create typolink from it.

```
bodytext = TEXT
bodytext {
    field = bodytext
    parseFunc =< lib.parseFunc_links
}
```

in bodytext, we take RTE content, so we need to parse it first, so typolinks are parsed etc. etc.

```
assets = TEXT
assets {
    dataProcessing {
        10 = FriendsOfTYPO3\Headless\DataProcessing\FilesProcessor
        10 {
            references.fieldName = assets
            as = assets
        }
    }
}
```

field assets holds reference to files. Every file should be processed by FilesProcess, which takes care of rendering of
file based on filetype. In case of images, we need to process them.

At the end, take a look at response.

```
{
    id: 77,
    pid: 3,
    type: "sitepackage_image_with_description",
    colPos: 0,
    categories: "",
    appearance: {
        layout: "default",
        frameClass: "default",
        spaceBefore: "",
        spaceAfter: ""
    },
    content: {
        header: "wegwe",
        headerLink: "",
        bodytext: "",
        assets: [
            {
                publicUrl: "https://api.pwa-demo.ddev.site/fileadmin/introduction/images/background/background-orange.jpg",
                properties: {
                    title: null,
                    alternative: null,
                    description: null,
                    mimeType: "image/jpeg",
                    type: "image",
                    filename: "background-orange.jpg",
                    originalUrl: "fileadmin/introduction/images/background/background-orange.jpg",
                    fileReferenceUid: 54,
                    size: "87 KB",
                    link: null,
                    dimensions: {
                        width: 2048,
                        height: 1152
                    },
                    cropDimensions: {
                        width: 2048,
                        height: 1152
                    },
                    autoplay: null,
                    extension: "jpg"
                }
            }
        ]
    }
}
```

# FRONTEND PART

## 1. Work with frontend sources on DDEV
To see realtime console output we will log in to ddev by execute `ddev ssh` in `pwa-demo` directory. Your ddev environment should be ready before (`ddev start`)

```bash
ddev ssh
```

Then go to front directory and run command to kill current process on port:3000 and run development process.

```bash
cd front && ./kill_node_server.sh && yarn dev
```

Now node process is watching for changes in your `front` directory.

## 2. Override core content element

`nuxt-typo3` provides core content elements with the basic logic and markup by default. One thing you have to make it nicer is add some styles, but you can also override HTML markup or JS logic.


### We will add some styles for bullets content element:

create `components/content/CeBullets.vue`:

```html
<script src="~typo3/components/content/elements/CeBullets.vue" />
<style lang="postcss">
.ce-bullets {
  ul {
    list-style: initial;
  }
}
</style>

```

### Add overrided component to application

To override components from nuxt-typo3 you need to add your component and register it as global. Thing to do is add them to main instance of Nuxt application as a plugin. [Read more](https://nuxtjs.org/guide/plugins/)

create `plugins/components.js`:
```js
import Vue from 'vue'
import CeBullets from '~/components/content/CeBullets'

const components = {
  CeBullets
}

export default ({ app }) => {
  Object.keys(components).forEach(key => {
    Vue.component(key, components[key])
  })
}

```

edit `nuxt.config.js`

```js
export default {
  ...
  plugins: ['~/plugins/components'],
  ...
}
```

## 3. Create custom content element

### Before you add first custom content element

📍 Each content element should contains base and common props.

📍 Each content element has `Ce` prefix ( We would like to avoid conflicts with other libraries or with your UI components )


Base props are used by [render components](lib/templates/components/content/CeDynamic.js):

```js
 props: {
    ...{
      id: this.data.uid,
      type: this.data.type,
      appearance: this.data.appearance
    },
    ...this.data.content
 }
```

📍 ```this.data.content``` contains all custom data delivered with content element by API. Fields from this object are accessible directly in your components.

## Create frontend component for new backend content element

Backend delivered new content element and now we want to handle it. ( Good practice is discuss all the new fields you want to get with backend developer ).

**Response for new content element:**

```json
{
   "id":76,
   "pid":3,
   "type":"sitepackage_image_with_description",
   "colPos":0,
   "appearance":{
      "layout":"default",
      "frameClass":"default",
      "spaceBefore":"",
      "spaceAfter":""
   },
   "content":{
      "header":"Some header",
      "headerLink":"http://site.com",
      "bodytext":"<p>Lorem lipsum<\/p>",
      "assets":[
         {
            "publicUrl":"https:\/\/api.pwa-demo.ddev.site\/fileadmin\/introduction\/images\/introduction-package.svg",
            "properties":{
               "title":null,
               "alternative":null,
               "description":null,
               "mimeType":"image\/svg+xml",
               "type":"image",
               "filename":"introduction-package.svg",
               "originalUrl":"fileadmin\/introduction\/images\/introduction-package.svg",
               "fileReferenceUid":54,
               "size":"5 KB",
               "link":null,
               "dimensions":{
                  "width":244,
                  "height":68
               },
               "cropDimensions":{
                  "width":244,
                  "height":68
               },
               "autoplay":null,
               "extension":"svg"
            }
         }
      ]
   }
}
```

So we know we have to handle properties:
- `header`,
- `headerLink`,
- `bodytext`,
- `assets`

We also know that type of new component is `sitepackage_image_with_description`

### 1. Create new custom element as vuejs component

create `components/content/CeSitepackage_image_with_description.vue`:

```html
<template>
  <div>
    <a :href="headerLink">
      <h2>{{ header }}</h2>
    </a>
    <p>{{ bodytext }}</p>
    <img :src="assets[0].publicUrl" :alt="assets[0].properties.alternative" />
  </div>
</template>
<script>
export default {
  name: 'CeImageWithDescription',
  props: {
    header: {
      type: String,
      required: false,
      default: ''
    },
    headerLink: {
      type: String,
      required: false,
      default: ''
    },
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
```

This is the simplest version of new component. But you have to know that is not bulletproff - there is a lot of edge cases to handle. We can back to this later. Now just display it!


### 2. Add new content element to global components

If you have created `plugins/components.js` before, you can add new component for your component list:

`plugins/components.js`:

```js
/* eslint-disable camelcase */
import Vue from 'vue'
import CeBullets from '~/components/content/CeBullets'
import CeSitepackage_image_with_description from '~/components/content/CeSitepackage_image_with_description.vue'

const components = {
  CeBullets,
  CeSitepackage_image_with_description
}

export default () => {
  Object.keys(components).forEach((key) => {
    Vue.component(key, components[key])
  })
}
```

Add you should add `plugins/components.js` for nuxt.config.js

edit `nuxt.config.js`

```js
export default {
  ...
  plugins: ['~/plugins/components'],
  ...
}
```

### 3. Refactore it!

We added simple component markup, but to handle some default fields we should use default content elements.

1. Most of the content elements use header field - we can use `baseCe` mixin.
2. Header field should be render by `CeHeader` content element - to handle all header layouts etc.
3. Bodytext should be display as HTML content, should be render by `html-parser` component.
4. Assets can has different type (image/video/other) - we should render it as `file` component.
5. Assets are array, we should render it inside of loop. - use v-for

edit `CeSitepackage_image_with_description.vue`:
```html
<template>
  <div>
    <ce-header v-bind="$props" />
    <html-parser :content="bodytext" />
    <file v-for="(file, key) in assets" :key="key" :file="file" />
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
```

## Resources
1) Access frontend in your browser: https://pwa-demo.ddev.site.
2) Access TYPO3 backend: https://api.pwa-demo.ddev.site/typo3, Credentials to TYPO3 backend are: ```admin:password```
3) https://github.com/TYPO3-Initiatives/nuxt-typo3
4) https://github.com/TYPO3-Initiatives/headless

## Development
Development for this extension is happening as part of the TYPO3 PWA initiative, see https://typo3.org/community/teams/typo3-development/initiatives/pwa/
