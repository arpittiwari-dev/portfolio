import { Project } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromSanityProject(doc: any): Project {
  return {
    _id:              doc._id,
    title:            doc.title            ?? "",
    slug:             doc.slug?.current    ?? doc.slug ?? "",
    status:           doc.status           ?? "draft",
    featured:         doc.featured         ?? false,
    order:            doc.order            ?? 99,
    category:         doc.category         ?? "",
    tags:             doc.tags             ?? [],
    accentColor:      doc.accentColor      ?? "#6C63FF",
    shortDescription: doc.shortDescription ?? "",
    thumbnail:        doc.thumbnail        ?? "",    role:             doc.role             ?? "UI/UX Designer",
    timeline:         doc.timeline         ?? "",
    client:           doc.client           ?? "",
    tools:            doc.tools            ?? [],
    prototypeLink:    doc.prototypeLink     ?? "",
    overview:         doc.overview         ?? "",
    problem:          doc.problem          ?? "",
    goal:             doc.goal             ?? "",
    outcome:          doc.outcome          ?? "",
    researchInsights: doc.researchInsights ?? "",
    keyDecisions:     doc.keyDecisions     ?? "",
    results:          doc.results          ?? "",
    learnings:        doc.learnings        ?? "",
    metrics:          doc.metrics          ?? [],
    images:           (doc.images ?? []).map((img: any) => ({
      url:     img.url     ?? img.image?.asset?.url ?? "",
      alt:     img.alt     ?? "",
      caption: img.caption ?? "",
    })),    galleryLayout:    doc.galleryLayout    ?? "grid",
    showResearch:     doc.showResearch     ?? true,
    showWireframes:   doc.showWireframes   ?? true,
    showPrototype:    doc.showPrototype    ?? false,
    seoTitle:         doc.seoTitle         ?? "",
    seoDescription:   doc.seoDescription   ?? "",
    updatedAt:        doc._updatedAt       ?? doc.updatedAt ?? new Date().toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toSanityProject(p: Partial<Project>): any {
  const doc: any = { _type: "project" };

  if (p.title            !== undefined) doc.title            = p.title;
  if (p.slug             !== undefined) doc.slug             = { _type: "slug", current: p.slug };
  if (p.status           !== undefined) doc.status           = p.status;
  if (p.featured         !== undefined) doc.featured         = p.featured;
  if (p.order            !== undefined) doc.order            = p.order;
  if (p.category         !== undefined) doc.category         = p.category;
  if (p.tags             !== undefined) doc.tags             = p.tags;
  if (p.accentColor      !== undefined) doc.accentColor      = p.accentColor;
  if (p.shortDescription !== undefined) doc.shortDescription = p.shortDescription;
  if (p.role             !== undefined) doc.role             = p.role;
  if (p.timeline         !== undefined) doc.timeline         = p.timeline;
  if (p.client           !== undefined) doc.client           = p.client;
  if (p.tools            !== undefined) doc.tools            = p.tools;
  if (p.prototypeLink    !== undefined) doc.prototypeLink    = p.prototypeLink;
  if (p.overview         !== undefined) doc.overview         = p.overview;
  if (p.problem          !== undefined) doc.problem          = p.problem;
  if (p.goal             !== undefined) doc.goal             = p.goal;
  if (p.outcome          !== undefined) doc.outcome          = p.outcome;
  if (p.researchInsights !== undefined) doc.researchInsights = p.researchInsights;
  if (p.keyDecisions     !== undefined) doc.keyDecisions     = p.keyDecisions;
  if (p.results          !== undefined) doc.results          = p.results;
  if (p.learnings        !== undefined) doc.learnings        = p.learnings;
  if (p.metrics          !== undefined) doc.metrics          = p.metrics;
  if (p.galleryLayout    !== undefined) doc.galleryLayout    = p.galleryLayout;
  if (p.showResearch     !== undefined) doc.showResearch     = p.showResearch;
  if (p.showWireframes   !== undefined) doc.showWireframes   = p.showWireframes;
  if (p.showPrototype    !== undefined) doc.showPrototype    = p.showPrototype;
  if (p.seoTitle         !== undefined) doc.seoTitle         = p.seoTitle;
  if (p.seoDescription   !== undefined) doc.seoDescription   = p.seoDescription;

  // Thumbnail: store as plain URL string (asset already uploaded via /api/upload)
  if (p.thumbnail !== undefined) {
    doc.thumbnail = p.thumbnail || null;
  }

  // Images array
  if (p.images !== undefined) {
    doc.images = p.images.map((img, i) => ({
      _key:    `img_${i}_${Date.now()}`,
      _type:   "object",
      url:     img.url ?? "",
      alt:     img.alt,
      caption: img.caption ?? "",
    }));
  }

  return doc;
}
