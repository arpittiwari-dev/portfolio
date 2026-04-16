import { Project } from "./types";

const token = () =>
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "")
    : "";

const headers = () => ({
  "Content-Type": "application/json",
  "x-admin-token": token(),
});

export async function apiGetProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function apiCreateProject(project: Project): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function apiUpdateProject(project: Project): Promise<Project> {
  const res = await fetch(`/api/projects/${project._id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

export async function apiDeleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Failed to delete project");
}

/** Upload an image file — returns the CDN URL and asset ID */
export async function apiUploadImage(file: File): Promise<{ url: string; assetId: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "x-admin-token": token() },
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}
