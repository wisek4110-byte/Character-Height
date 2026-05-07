export interface Character {
  id: string;
  name: string;
  height: number;
  gender: 'male' | 'female' | 'object';
  description: string;
  notionUrl: string;
  color: string;
  series?: string;
  order?: number;
  projectId?: string;
  width?: number; // Added for objects
  yOffset?: number; // Added for objects like chalkboard
  isObject?: boolean;
}
