declare global {
  interface Window {
    project: Project;
  }
}

export type Project = {
  id: number;
  name: string;
  slug: string;
};
