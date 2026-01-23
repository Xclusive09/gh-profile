import type { Plugin } from './types.js';
import type { NormalizedData } from '../core/normalize.js';

export const statsPlugin: Plugin = {
    metadata: {
        id: 'stats',
        name: 'GitHub Stats',
        description: 'Adds GitHub statistics to your profile',
        version: '1.0.0',
        author: 'gh-profile'
    },

    render: async (content: string, data: NormalizedData): Promise<string> => {
        const { stats, profile } = data;

        let statsSection = '\n## GitHub Stats\n\n';

        // Overview table
        statsSection += '| Metric | Count |\n';
        statsSection += '|--------|-------|\n';
        statsSection += `| Repositories | ${stats.totalRepos.toLocaleString()} |\n`;
        statsSection += `| Stars | ${stats.totalStars.toLocaleString()} |\n`;
        statsSection += `| Followers | ${profile.followers.toLocaleString()} |\n`;
        statsSection += `| Following | ${profile.following.toLocaleString()} |\n\n`;

        // Language breakdown
        if (stats.languages.length > 0) {
            statsSection += '### Languages\n\n';

            const max = Math.max(...stats.languages.map(l => l.count));
            stats.languages
                .sort((a, b) => b.percentage - a.percentage)
                .slice(0, 8)
                .forEach(lang => {
                    const width = Math.round((lang.count / max) * 25);
                    const bar = '█'.repeat(width) + '░'.repeat(25 - width);
                    statsSection += `\`${lang.name.padEnd(12)}\` ${bar} ${lang.percentage}%\n`;
                });
        }

        return content + statsSection;
    }
};