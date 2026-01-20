import type { NormalizedData } from '../core/normalize.js';

/**
 * Valid template categories
 */
export type TemplateCategory = 'developer' | 'designer' | 'founder' | 'generic';

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
  /** Template category */
  category: TemplateCategory;
  /** Version of the template */
  version: string;
  /** Author of the template */
  author?: string;
  /** Source of the template (built-in or local) */
  source?: 'built-in' | 'local';
  /** Path to the template if it's local */
  path?: string;
}

/**
 * A template function that generates markdown from GitHub data
 */
export type TemplateFunction = (data: NormalizedData) => string;

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

/**
 * Local template file structure
 */
export interface LocalTemplateFiles {
  metaPath: string;
  indexPath: string;
}