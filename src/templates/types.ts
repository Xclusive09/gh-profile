import { GitHubData } from '../github/types.js';

/**
 * Metadata that describes a template
 */
export interface TemplateMetadata {
  /** Unique identifier for the template */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of the template's purpose */
  description: string;
  /** Template category (e.g., 'minimal', 'showcase', 'stats-heavy') */
  category: 'minimal' | 'showcase' | 'stats-heavy' | 'developer' | 'designer' | 'founder' | string;
  /** Version of the template */
  version: string;
  /** Author of the template */
  author?: string;
}

/**
 * A template function that generates markdown from GitHub data
 */
export type TemplateFunction = (data: GitHubData) => string;

/**
 * A complete template with metadata and render function
 */
export interface Template {
  metadata: TemplateMetadata;
  render: TemplateFunction;
}

/**
 * Template registry entry
 */
export interface TemplateRegistryEntry {
  template: Template;
  builtIn: boolean;
}
