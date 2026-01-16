
import type { Template } from './types.js';
import type { NormalizedData } from '../core/normalize.js';

export const showcaseTemplate: Template = {
    metadata: {
        id: 'showcase',
        name: 'Showcase',
        description: 'A feature-rich template highlighting your best work',
        category: 'showcase',
        version: '1.0.0',
        author: 'gh-profile',
    },

    render(data: NormalizedData): string {
        const { profile, stats } = data;

        let markdown = `<h1 align="center">Hi 👋, I'm ${profile.name}</h1>`;

        // Rich header with centered layout
        if (profile.bio) {
            markdown += `\n<h3 align="center">${profile.bio}</h3>\n\n`;
        }

        // Extended About section with icons
        markdown += '\n## About Me\n\n';

        const aboutItems: string[] = [];

        if (profile.location) {
            aboutItems.push(`🌍 Based in **${profile.location}**`);
        }

        if (profile.company) {
            aboutItems.push(`💼 Currently working at **${profile.company}**`);
        }

        if (profile.blog) {
            aboutItems.push(`🌐 Visit my [website](${profile.blog})`);
        }

        if (profile.twitter) {
            aboutItems.push(`🐦 Follow me on [Twitter](https://twitter.com/${profile.twitter})`);
        }

        if (profile.email) {
            aboutItems.push(`✉️ Contact me at [${profile.email}](mailto:${profile.email})`);
        }

        markdown += aboutItems.join('\n\n') + '\n\n';

        // Expanded Stats section with more metrics
        markdown += '## Stats\n\n';
        markdown += '| Metric | Count |\n';
        markdown += '|--------|-------|\n';
        markdown += `| Repositories | ${stats.totalRepos} |\n`;
        markdown += `| Stars Earned | ${stats.totalStars} |\n`;
        markdown += `| Forks | ${stats.totalForks} |\n`;
        markdown += `| Followers | ${profile.followers} |\n`;
        markdown += `| Following | ${profile.following} |\n\n`;

        // Technologies section
        if (stats.languages.length > 0) {
            markdown += '## Technologies\n\n';

            // Show language distribution with percentage bars
            stats.languages.forEach(lang => {
                const bar = '█'.repeat(Math.round(lang.percentage / 5)); // 20 chars max
                markdown += `${lang.name} ${bar} ${lang.percentage}%\n`;
            });

            markdown += '\n';
        }

        // Featured Projects section
        if (stats.topRepos.length > 0) {
            markdown += '## Featured Projects\n\n';

            stats.topRepos.slice(0, 4).forEach(repo => {
                markdown += `### ⭐ [${repo.name}](${repo.url})\n\n`;

                if (repo.description) {
                    markdown += `> ${repo.description}\n\n`;
                }

                // Enhanced project stats
                const stats: string[] = [];

                if (repo.stars > 0) stats.push(`⭐ ${repo.stars} stars`);
                if (repo.forks > 0) stats.push(`🍴 ${repo.forks} forks`);
                if (repo.watchers > 0) stats.push(`👀 ${repo.watchers} watchers`);
                if (repo.language) stats.push(`💻 ${repo.language}`);

                markdown += stats.join(' · ') + '\n\n';

                if (repo.topics && repo.topics.length > 0) {
                    markdown += repo.topics.map(topic => `\`${topic}\``).join(' ') + '\n\n';
                }
            });
        }

        // Recent Activity section
        if (stats.recentRepos.length > 0) {
            markdown += '## Recent Activity\n\n';

            stats.recentRepos.slice(0, 3).forEach(repo => {
                const date = repo.pushedAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                markdown += `- 📦 Pushed to [${repo.name}](${repo.url}) on ${date}\n`;
            });

            markdown += '\n';
        }

        // Footer with GitHub profile link
        markdown += `---\n\n`;
        markdown += `<p align="center">`;
        markdown += `<a href="${profile.profileUrl}">View GitHub Profile</a>`;
        markdown += `</p>\n`;

        return markdown;
    },
};