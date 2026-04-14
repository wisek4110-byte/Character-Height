export interface Character {
  id: string;
  name: string;
  height: number;
  gender: 'male' | 'female';
  description: string;
  notionUrl: string;
  color: string;
  series?: string;
  order?: number;
  projectId?: string;
}
