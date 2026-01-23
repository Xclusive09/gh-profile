import type { Plugin } from './types.js';
import type { NormalizedData } from '../core/normalize.js';

export const projectsPlugin: Plugin = {
    metadata: {
        id: 'projects',
        name: 'Projects Section',
        description: 'Adds a featured projects section to your profile',
        version: '1.0.0',
        author: 'gh-profile'
    },

    render: async (content: string, data: NormalizedData): Promise<string> => {
        const { stats } = data;

        if (!stats.topRepos.length) {
            return content;
        }

        let projectsSection = '\n## Featured Projects\n\n';

        stats.topRepos.slice(0, 6).forEach(repo => {
            projectsSection += `### [${repo.name}](${repo.url})\n`;

            if (repo.description) {
                projectsSection += `> ${repo.description.trim()}\n\n`;
            }

            const stats = [
                repo.stars > 0 ? `⭐ ${repo.stars}` : '',
                repo.forks > 0 ? `🍴 ${repo.forks}` : '',
                repo.language ? `💻 ${repo.language}` : ''
            ].filter(Boolean);

            if (stats.length) {
                projectsSection += stats.join(' · ') + '\n\n';
            }

            if (repo.topics?.length) {
                projectsSection += repo.topics.map(t => `\`${t}\``).join(' ') + '\n\n';
            }
        });

        return content + projectsSection;
    }
};