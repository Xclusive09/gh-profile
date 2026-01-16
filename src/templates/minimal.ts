import type { Template } from './types.js';
import type { NormalizedData } from '../core/normalize.js';

export const minimalTemplate: Template = {
    metadata: {
        id: 'minimal',
        name: 'Minimal',
        description: 'A clean, minimal GitHub profile README template',
        category: 'minimal',
        version: '1.0.0',
        author: 'gh-profile',
    },

    render(data: NormalizedData): string {
        const { profile, repos } = data;

        let markdown = `# Hi, I'm ${profile.name} 👋\n\n`;

        if (profile.bio) {
            markdown += `${profile.bio}\n\n`;
        }

        if (profile.location) {
            markdown += `📍 ${profile.location}\n\n`;
        }

        // Optional: add more profile fields if you want
        if (profile.company) {
            markdown += `🏢 ${profile.company}\n\n`;
        }

        // Stats section — use fields from Profile + you can use stats later
        markdown += `## Stats\n\n`;
        markdown += `| Metric       | Value |\n`;
        markdown += `|--------------|-------|\n`;
        markdown += `| Public Repos | ${profile.publicRepos} |\n`;
        markdown += `| Followers    | ${profile.followers}   |\n\n`;

        // Top repositories section
        if (repos.length > 0) {
            markdown += `## Top Repositories\n\n`;

            // Optional: sort by stars (recommended)
            const sortedRepos = [...repos]
                .sort((a, b) => b.stars - a.stars)
                .slice(0, 5);

            sortedRepos.forEach(repo => {
                markdown += `### [${repo.name}](${repo.url})\n`;

                if (repo.description) {
                    markdown += `${repo.description}\n\n`;
                }

                markdown += `⭐ ${repo.stars} • 🍴 ${repo.forks}\n\n`;
            });
        }

        return markdown;
    },
};