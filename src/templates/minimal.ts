import type { Template } from './types.js';
import type { NormalizedData } from '../core/models.js';

export const minimalTemplate: Template = {
    metadata: {
        id: 'minimal',
        name: 'Minimal',
        description: 'A clean, minimal GitHub profile README template',
        category: 'minimal',
        version: '0.1.0',
        author: 'gh-profile',
    },

    render(data: NormalizedData): string {
        const { profile, repos } = data;
        const displayName = profile.name || profile.username;

        let md = `# Hi, I'm ${displayName} 👋\n\n`;

        if (profile.bio) {
            md += `${profile.bio}\n\n`;
        }

        if (profile.location) {
            md += `📍 ${profile.location}\n\n`;
        }

        if (profile.company) {
            md += `🏢 ${profile.company}\n\n`;
        }

        // Simple stats
        md += `## Stats\n\n`;
        md += `| Metric       | Value |\n`;
        md += `|--------------|-------|\n`;
        md += `| Public Repos | ${profile.publicRepos} |\n`;
        md += `| Followers    | ${profile.followers}   |\n\n`;

        // Top repositories (limited to 5, sorted by stars)
        if (repos.length > 0) {
            md += `## Top Repositories\n\n`;

            const topRepos = [...repos]
                .sort((a, b) => b.stars - a.stars)
                .slice(0, 5);

            topRepos.forEach(repo => {
                md += `### [${repo.name}](${repo.url})\n`;

                if (repo.description) {
                    md += `${repo.description}\n\n`;
                }

                md += `⭐ ${repo.stars} • 🍴 ${repo.forks}\n\n`;
            });
        }

        return md.trim();
    },
};