import type { NormalizedData } from '../core/models.js';

export interface Template {
  name: string;
  render(data: NormalizedData): string;
}

export interface TemplateSection {
  id: string;
  render(data: NormalizedData): string;
}
