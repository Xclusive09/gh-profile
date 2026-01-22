# Custom Templates

This guide explains how to create custom templates for gh-profile. Custom templates allow you to define your own GitHub profile README layout and style.

## Template Structure

A custom template consists of two required files:
```
your-template/ 
    ├── meta.json # Template metadata 
    └── index.ts # Template render function
```
### Metadata (meta.json)

The metadata file defines template properties and must include these required fields:
```
json 
{ 
 "id": "your-template-id",
 "name": "Your Template Name",
 "description": "A description of your template", "category": "developer", "version": "1.0.0" 
}
``` 

Required fields:
- `id`: Unique identifier for your template
- `name`: Human-readable template name
- `description`: Brief description of the template's purpose
- `category`: One of: `"developer"`, `"designer"`, `"founder"`, `"generic"`
- `version`: Semantic version number

Optional fields:
- `author`: Template creator's name
- `source`: Will be set automatically by gh-profile

### Render Function (index.ts)

The render function receives normalized GitHub data and returns markdown content. Here's the minimal structure:
```
typescript 
import type { NormalizedData } from '../../core/normalize.js';
export default function render(data: NormalizedData): string { const { profile, repos, stats } = data;
return `# ${profile.name}
${profile.bio}`; }
``` 

## Data Contract

Your template will receive normalized data with these guaranteed fields:

### Profile Data
```
typescript
 interface Profile {
  username: string; // GitHub username name: string;
   // Display name avatarUrl: string; // Profile picture URL profileUrl: string;
    // GitHub profile URL bio: string | null; // Profile bio company: string | null;
    // Company name location: string | null; blog: string | null; // Website URL twitter: string | null; // Twitter username email: string | null; followers: number; following: number; publicRepos: number; createdAt: Date; }
``` 

### Repository Data
```
typescript
 interface Repository { name: string; // Repository name fullName: string; // owner/repo url: string; // GitHub repository URL description: string | null; language: string | null; stars: number; forks: number; watchers: number; issues: number; topics: string[]; homepage: string | null; isFork: boolean; isArchived: boolean; createdAt: Date; updatedAt: Date; pushedAt: Date; }
``` 

### Stats Data
```
typescript
 interface ProfileStats { totalStars: number; // Sum of all repository stars totalForks: number; // Sum of all repository forks totalRepos: number; // Total number of repositories languages: Array<{ // Language usage statistics name: string; count: number; percentage: number; }>; topRepos: Repository[]; // Most starred repositories recentRepos: Repository[]; // Recently updated repositories }
``` 

## Testing Your Template

Create a test file alongside your template to verify its behavior:

1. Test basic rendering
2. Test handling of missing/null values
3. Test with empty repository lists
4. Verify no null/undefined appears in output

See the built-in templates' test files for examples.

## Example Template

Here's a minimal working template example:
```
typescript
 // index.ts 
 export default function render(data: NormalizedData): string { const { profile, repos } = data;
let md = `# Hi, I'm ${profile.name || profile.username} 👋\n\n`;

if (profile.bio) {
md += `${profile.bio}\n\n`;
}

if (repos.length > 0) {
md += `## Top Repositories\n\n`;
repos.slice(0, 3).forEach(repo => {
md += `- [${repo.name}](${repo.url})\n`;
});
}

return md.trim();
}
```
```
json 
// meta.json {
 "id": "example",
  "name": "Example Template",
  "description": "A simple example template",
  "category": "generic", "version": "0.3.0",
  "author": "Your Name"
   }
```

## Custom Templates

Want to create your own template? Check out our [Template Documentation](docs/templates.md) to learn how to:
- Structure your template files
- Define template metadata
- Implement the render function
- Access normalized GitHub data

Our template system ensures consistent data access while giving you complete control over the output format.
