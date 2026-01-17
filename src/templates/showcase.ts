import type { Template } from './types.js';
import type { NormalizedData } from '../core/normalize.js';

export const showcaseTemplate: Template = {
    metadata: {
        id: 'showcase',
        name: 'Showcase',
        description: 'Beautiful, modern layout highlighting your best work and personality',
        category: 'showcase',
        version: '1.1.0',
        author: 'gh-profile',
    },

    render(data: NormalizedData): string {
        const { profile, stats } = data;
        const name = profile.name || profile.username;

        let md = `<div align="center">\n`;

        md += `  <h1>Hey there 👋 I'm ${name}</h1>\n\n`;

        if (profile.bio) {
            md += `  <h3>${profile.bio}</h3>\n\n`;
        }

        md += `</div>\n\n`;

        // Connect section
        md += `## Connect with me\n\n`;

        const links: string[] = [];

        if (profile.location) links.push(`🌍 ${profile.location}`);
        if (profile.company) links.push(`💼 ${profile.company}`);
        if (profile.blog) links.push(`🌐 [${profile.blog.replace(/^https?:\/\//, '')}](${profile.blog})`);
        if (profile.twitter) links.push(`🐦 [@${profile.twitter}](https://twitter.com/${profile.twitter})`);
        if (profile.email) links.push(`✉️ [${profile.email}](mailto:${profile.email})`);

        md += links.map(item => `**${item}**`).join('  ·  ') + '\n\n';

        // Stats overview
        md += `## GitHub at a Glance\n\n`;

        md += `| Metric            | Value              |\n`;
        md += `|-------------------|--------------------|\n`;
        md += `| Repositories      | ${stats.totalRepos.toLocaleString()} |\n`;
        md += `| Total Stars       | ${stats.totalStars.toLocaleString()} ⭐ |\n`;
        md += `| Forks             | ${stats.totalForks.toLocaleString()} 🍴 |\n`;
        md += `| Followers         | ${profile.followers.toLocaleString()} 👥 |\n`;
        md += `| Following         | ${profile.following.toLocaleString()} 👀 |\n\n`;

        // Languages with progress bars
        if (stats.languages.length > 0) {
            md += `## Top Technologies\n\n`;

            const max = Math.max(...stats.languages.map(l => l.count));

            stats.languages
                .sort((a, b) => b.percentage - a.percentage)
                .forEach(lang => {
                    const width = Math.round((lang.count / max) * 25);
                    const bar = '█'.repeat(width) + '░'.repeat(25 - width);
                    md += `\`${lang.name.padEnd(14)}\` ${bar} **${lang.percentage}%**\n`;
                });

            md += '\n';
        }

        // Featured work
        if (stats.topRepos.length > 0) {
            md += `## Featured Projects\n\n`;

            stats.topRepos.slice(0, 6).forEach(r => {
                md += `### [${r.name}](${r.url})\n`;

                if (r.description) {
                    md += `> ${r.description.trim()}\n\n`;
                }

                const info = [
                    r.stars > 0 ? `⭐ ${r.stars.toLocaleString()}` : '',
                    r.forks > 0 ? `🍴 ${r.forks}` : '',
                    r.language ? `💻 ${r.language}` : '',
                ].filter(Boolean);

                if (info.length) md += info.join(' · ') + '\n\n';

                if (r.topics?.length) {
                    md += r.topics.map(t => `\`${t}\``).join(' ') + '\n\n';
                }
            });
        }

        // Recent updates
        if (stats.recentRepos.length > 0) {
            md += `## Recent Activity\n\n`;

            stats.recentRepos.slice(0, 5).forEach(r => {
                const date = r.pushedAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                });
                md += `- 📦 Updated [**${r.name}**](${r.url}) — ${date}\n`;
            });

            md += '\n';
        }

        md += `---\n\n`;
        md += `<p align="center">\n`;
        md += `  <sub>Generated with <a href="https://github.com/yourusername/gh-profile">gh-profile</a> • ${new Date().getFullYear()}</sub>\n`;
        md += `</p>\n`;

        return md.trim();
    },
};