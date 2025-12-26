import { config, fields, singleton } from "@keystatic/core";

const REPO_OWNER = oortsky
const REPO_NAME = eona


export default config({
  storage: {
    kind: "github",
    repo: `${REPO_OWNER}/${REPO_NAME}`
  },
  ui: {
    brand: {
      name: "EONA - Dashboard CMS"
    }
  },
  singletons: {
    intro: singleton({
      label: "Introduction",
      path: "src/content/intro",
      schema: {
        title: fields.text({ label: "Title" }),
        content: fields.markdoc({ label: "Content" }),
        avatar: fields.image({ label: "Avatar", directory: "public/images" })
      }
    }),

    privacy: singleton({
      label: "Privacy Policy",
      path: "src/content/privacy",
      schema: {
        title: fields.text({ label: "Title" }),
        content: fields.markdoc({ label: "Content" }),
        date: fields.date({ label: "Effective Date" })
      }
    }),

    terms: singleton({
      label: "Terms of Service",
      path: "src/content/terms",
      schema: {
        title: fields.text({ label: "Title" }),
        content: fields.markdoc({ label: "Content" }),
        date: fields.date({ label: "Effective Date" })
      }
    }),

    faq: singleton({
      label: "FAQ",
      path: "src/content/faq",
      schema: {
        items: fields.array(
          fields.object({
            question: fields.text({ label: "Question" }),
            answer: fields.markdoc({ label: "Answer" })
          }),
          {
            label: "FAQ Items",
            itemLabel: item =>
              item.fields.question.value
                .replace(/-/g, " ")
                .replace(/\b\w/g, c => c.toUpperCase()) || "Untitled FAQ"
          }
        )
      }
    })
  }
});
