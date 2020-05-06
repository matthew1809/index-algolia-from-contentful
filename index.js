#!/usr/bin/env node

require("dotenv").config()
;(async () => {
  const algoliasearch = require("algoliasearch")
  const { createClient } = require("contentful")
  const removeMd = require("remove-markdown")

  const { ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY, ALGOLIA_INDEX } = process.env

  const space = process.env.CONTENTFUL_SPACE
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN

  const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)
  const algoliaIndex = algoliaClient.initIndex(ALGOLIA_INDEX)

  const ctfClient = createClient({
    space,
    accessToken,
  })

  try {
    const { items } = await ctfClient.getEntries({
      content_type: "blogPost",
      limit: 1000,
    })
    const posts = items.map((post) => ({
      url: post.fields.slug,
      slug: post.fields.slug,
      content: removeMd(post.fields.body),
      description: post.fields.description,
      title: post.fields.title,
      tags: post.fields.tags,
      objectID: post.sys.id,
      publishDate: post.fields.publishDate,
      heroImage: "https:" + post.fields.heroImage.fields.file.url,
    }))

    const indexedContent = await algoliaIndex.saveObjects(posts, true)

    console.log("Indexed Content:", indexedContent)
  } catch (err) {
    console.error(err)
  }
})()
