# Plugin Development Guide

## Overview

`gh-profile` plugins are modular components that extend the README generation process. Each plugin can:

- Add new sections to the README
- Transform existing content
- Modify data before rendering
- Perform cleanup after rendering

## Plugin Structure

A plugin is a TypeScript object that implements the `Plugin` interface:

```ts
interface Plugin {
  metadata: {
    id: string;          // Unique identifier
    name: string;        // Human-readable name
    description: string; // What the plugin does
    version: string;     // Semver format
    author: string;      // Plugin author
    homepage?: string;   // Optional URL
  };

  init?(options: PluginOptions): Promise<void> | void;
  beforeRender?(context: PluginContext): Promise<void> | void;
  render?(content: string, data: NormalizedData): Promise<string> | string;
  afterRender?(context: PluginContext): Promise<void> | void;
}
```

## Lifecycle Hooks

Plugins can implement any of these hooks:

1. **init**  
   Called when the plugin is first loaded.
    - Set up resources
    - Validate configuration
    - Initialize external services

2. **beforeRender**  
   Called before template rendering.
    - Modify or enhance data
    - Prepare content transformations
    - Load additional resources

3. **render**  
   Called during content generation.
    - Add new sections
    - Transform existing content
    - Most plugins will use this hook

4. **afterRender**  
   Called after content is generated.
    - Final content modifications
    - Cleanup resources
    - Logging/analytics

## Data Contracts

### Plugin Options

```ts
interface PluginOptions {
  enabled?: boolean;
  config?: Record<string, unknown>;
}
```

### Plugin Context

```ts
interface PluginContext {
  data: NormalizedData;     // GitHub data
  content: string;          // Current markdown
  config: Record<string, unknown>;
}
```

### NormalizedData

Core data structure containing:

- Profile information
- Repository stats
- Languages
- Contributions
- User customization

## Common Pitfalls

1. **Content Modification**
    - Always append/prepend sections
    - Don't modify existing content unexpectedly
    - Use clear section markers

2. **Error Handling**
    - Catch and log errors
    - Provide fallback content
    - Don't throw in render phase

3. **Performance**
    - Minimize async operations
    - Cache external resources
    - Use efficient transforms

4. **Configuration**
    - Validate all inputs
    - Provide sensible defaults
    - Document config options

## Minimal Working Example

```ts
import type { Plugin } from '../types.js';
import type { NormalizedData } from '../core/normalize.js';

export const minimalPlugin: Plugin = {
  metadata: {
    id: 'minimal-example',
    name: 'Minimal Example',
    description: 'Adds a simple greeting section',
    version: '1.0.0',
    author: 'Your Name',
  },

  render: async (content: string, data: NormalizedData): Promise<string> => {
    const greeting = `\n## Hello ${data.profile.name}!\n\n`;
    return content + greeting;
  },
};
```

## Configuration

Plugins can be enabled/disabled via:

1. **CLI flags**:

```bash
gh-profile generate --enable-plugin stats
gh-profile generate --disable-plugin socials
```

2. **Config file**:

```json
{
  "plugins": {
    "stats": true,
    "socials": false
  }
}
```

## Testing

1. **Create test fixtures**:

```ts
const mockData: NormalizedData = {
  profile: { name: 'Test User' },
  // ... other required data
};
```

2. **Test plugin output**:

```ts
const result = await plugin.render('# Existing Content\n', mockData);
expect(result).toContain('Hello Test User');
```

## Best Practices

1. **Modularity**
    - One responsibility per plugin
    - Clear separation of concerns
    - Minimal dependencies

2. **Documentation**
    - Clear description
    - Configuration options
    - Example output

3. **Validation**
    - Check input data
    - Validate configuration
    - Handle edge cases gracefully

4. **Error Handling**
    - Use try/catch in hooks
    - Log warnings instead of throwing
    - Provide fallback behavior