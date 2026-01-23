
import type { Plugin } from './types.js';
import type { NormalizedData } from '../core/normalize.js';

export const socialsPlugin: Plugin = {
    metadata: {
        id: 'socials',
        name: 'Social Links',
        description: 'Adds social media links to your profile',
        version: '1.0.0',
        author: 'gh-profile'
    },

    render: async (content: string, data: NormalizedData): Promise<string> => {
        const { profile } = data;

        const links: string[] = [];

        if (profile.location) links.push(`🌍 ${profile.location}`);
        if (profile.company) links.push(`💼 ${profile.company}`);
        if (profile.blog) {
            const url = profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`;
            links.push(`🌐 [${profile.blog.replace(/^https?:\/\//, '')}](${url})`);
        }
        if (profile.twitter) {
            links.push(`🐦 [@${profile.twitter}](https://twitter.com/${profile.twitter})`);
        }
        if (profile.email) {
            links.push(`✉️ [${profile.email}](mailto:${profile.email})`);
        }

        if (!links.length) {
            return content;
        }

        const socialsSection = '\n## Connect\n\n' +
            links.map(link => `**${link}**`).join('  ·  ') + '\n';

        return content + socialsSection;
    }
};