import { defineField, defineType } from "sanity";

export const projectSchema = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({ name: "title",            title: "Title",            type: "string",  validation: (r) => r.required() }),
    defineField({ name: "slug",             title: "Slug",             type: "slug",    options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "status",           title: "Status",           type: "string",  options: { list: ["draft", "published"] }, initialValue: "draft" }),
    defineField({ name: "featured",         title: "Featured",         type: "boolean", initialValue: false }),
    defineField({ name: "order",            title: "Order",            type: "number",  initialValue: 99 }),
    defineField({ name: "category",         title: "Category",         type: "string",  options: { list: ["Mobile App", "E-commerce", "Product UI", "SaaS / Landing Page", "Branding", "Web App", "Other"] } }),
    defineField({ name: "tags",             title: "Tags",             type: "array",   of: [{ type: "string" }] }),
    defineField({ name: "accentColor",      title: "Accent Color",     type: "string",  initialValue: "#6C63FF" }),
    defineField({ name: "shortDescription", title: "Short Description",type: "text",    rows: 2 }),
    defineField({ name: "thumbnail",        title: "Thumbnail",        type: "image",   options: { hotspot: true } }),
    defineField({ name: "role",             title: "Role",             type: "string",  initialValue: "UI/UX Designer" }),
    defineField({ name: "timeline",         title: "Timeline",         type: "string" }),
    defineField({ name: "client",           title: "Client",           type: "string" }),
    defineField({ name: "tools",            title: "Tools",            type: "array",   of: [{ type: "string" }] }),
    defineField({ name: "prototypeLink",    title: "Prototype Link",   type: "url" }),
    defineField({ name: "overview",         title: "Overview",         type: "text" }),
    defineField({ name: "problem",          title: "Problem",          type: "text" }),
    defineField({ name: "goal",             title: "Goal",             type: "text" }),
    defineField({ name: "outcome",          title: "Outcome",          type: "text" }),
    defineField({ name: "researchInsights", title: "Research Insights",type: "text" }),
    defineField({ name: "keyDecisions",     title: "Key Decisions",    type: "text" }),
    defineField({ name: "results",          title: "Results",          type: "text" }),
    defineField({ name: "learnings",        title: "Learnings",        type: "text" }),
    defineField({
      name: "metrics", title: "Metrics", type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "label", title: "Label", type: "string" },
          { name: "value", title: "Value", type: "string" },
        ],
      }],
    }),
    defineField({
      name: "images", title: "Gallery Images", type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "image",   title: "Image",   type: "image", options: { hotspot: true } },
          { name: "alt",     title: "Alt Text",type: "string" },
          { name: "caption", title: "Caption", type: "string" },
        ],
      }],
    }),
    defineField({ name: "galleryLayout",  title: "Gallery Layout",  type: "string", options: { list: ["grid", "masonry", "fullwidth"] }, initialValue: "grid" }),
    defineField({ name: "showResearch",   title: "Show Research",   type: "boolean", initialValue: true }),
    defineField({ name: "showWireframes", title: "Show Wireframes", type: "boolean", initialValue: true }),
    defineField({ name: "showPrototype",  title: "Show Prototype",  type: "boolean", initialValue: false }),
    defineField({ name: "seoTitle",       title: "SEO Title",       type: "string" }),
    defineField({ name: "seoDescription", title: "SEO Description", type: "text", rows: 2 }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "thumbnail" },
  },
  orderings: [
    { title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
});
