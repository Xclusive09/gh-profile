import type { Template } from './types.js';
import { GitHubData } from '../github/types.js';

export const defaultTemplate: Template = {
  metadata: {
    id: 'default',
    name: 'Default',
    description: 'A minimal, readable GitHub profile README template',
    category: 'minimal',
    version: '1.0.0',
    author: 'gh-profile',
  },
  render(data: GitHubData): string {
    const { user, repos } = data;

    // Your existing template rendering logic here
    let markdown = `# Hi, I'm ${user.name || user.login} 👋\n\n`;

    if (user.bio) {
      markdown += `${user.bio}\n\n`;
    }

    if (user.location) {
      markdown += `📍 ${user.location}\n\n`;
    }

    // Add other sections as needed
    markdown += `## Stats\n\n`;
    markdown += `| Metric | Count |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Public Repos | ${user.public_repos} |\n`;
    markdown += `| Followers | ${user.followers} |\n\n`;

    if (repos.length > 0) {
      markdown += `## Top Repositories\n\n`;
      repos.slice(0, 5).forEach(repo => {
        markdown += `### [${repo.name}](${repo.html_url})\n`;
        if (repo.description) {
          markdown += `${repo.description}\n\n`;
        }
        markdown += `⭐ ${repo.stargazers_count} • 🍴 ${repo.forks_count}\n\n`;
      });
    }

    return markdown;
  },
};