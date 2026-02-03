import type { Template } from './types.js';
import type { NormalizedData } from '../core/normalize.js';

export const showcaseTemplate: Template = {
    metadata: {
        id: 'showcase',
        name: 'Project Showcase',
        description: 'High-impact, premium showcase for professional developers',
        category: 'developer',
        version: '1.0.0',
        author: 'gh-profile',
        source: 'built-in'
    },

    render: (data: NormalizedData): string => {
        const { profile, stats } = data;
        const username = profile.username;
        const name = profile.name || username;

        // const baseUrl = 'https://skillicons.dev/icons?i=';
        const iconMapping: Record<string, string> = {
            'javascript': 'js',
            'typescript': 'ts',
            'python': 'py',
            'html': 'html',
            'css': 'css',
            'java': 'java',
            'kotlin': 'kotlin',
            'c': 'c',
            'shell': 'bash',
        };
        const defaultIcon = 'code';

        const theme = 'dracula';
        const timestamp = new Date().getTime();

        let md = '';

        // Helper to safely format bio for HTML
        const safeBio = profile.bio ? profile.bio.replace(/\r?\n|\r/g, ' ').trim() : '';

        // Hero Section
        md += `<div align="center">\n`;
        md += `  <h1>${name}</h1>\n`;
        if (safeBio) {
            md += `  <p align="center"><strong>${safeBio}</strong></p>\n`;
        }
        md += `</div>\n\n<br>\n\n`;

        // Profile Views & Core Stats
        md += `<div align="center">\n`;
        const profileBadges: string[] = [];
        profileBadges.push(`<img src="https://img.shields.io/badge/Stars-${stats.totalStars}-f59e0b?style=flat-square&logo=github-sponsors&logoColor=white" alt="total stars" />`);
        profileBadges.push(`<img src="https://img.shields.io/badge/Followers-${profile.followers}-0ea5e9?style=flat-square&logo=github&logoColor=white" alt="followers" />`);
        profileBadges.push(`<img src="https://komarev.com/ghpvc/?username=${username}&label=PROFILE+VIEWS&color=0f172a&style=flat-square" alt="profile views" />`);

        md += `  <p>${profileBadges.join('&nbsp;&nbsp;')}</p>\n`;
        md += `</div>\n\n<br>\n\n`;

        // Social Connections
        md += `<div align="center">\n`;
        md += `  <h3>Social Connections</h3>\n\n`;

        const socials: string[] = [];
        if (profile.location) {
            socials.push(`<img src="https://img.shields.io/badge/Location-${encodeURIComponent(profile.location)}-0f172a?style=flat-square&logo=google-maps&logoColor=white" alt="location">`);
        }
        if (profile.blog) {
            socials.push(`<a href="${profile.blog}"><img src="https://img.shields.io/badge/Portfolio-0f172a?style=flat-square&logo=google-chrome&logoColor=white" alt="website"></a>`);
        }
        if (profile.twitter) {
            socials.push(`<a href="https://twitter.com/${profile.twitter}"><img src="https://img.shields.io/badge/Twitter-0f172a?style=flat-square&logo=twitter&logoColor=white" alt="twitter"></a>`);
        }

        md += `${socials.join('&nbsp;&nbsp;')}\n`;
        md += `</div>\n\n<br><br>\n\n`;

        // GitHub Performance - Hybrid Rendering
        md += `<div align="center">\n`;
        md += `  <h3>GitHub Performance</h3>\n\n`;

        // Text Fallback Table
        md += `| Repos | Stars | Forks | Commits |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;
        md += `| ${profile.publicRepos} | ${stats.totalStars} | ${stats.totalForks} | Active |\n\n`;

        md += `  <img src="https://github-readme-stats-one.vercel.app/api?username=${username}&show_icons=true&theme=${theme}&hide_border=true&include_all_commits=true&t=${timestamp}" alt="github stats" />\n`;
        md += `</div>\n\n<br>\n\n`;

        // Technologies Section
        if (stats.languages.length > 0) {
            md += `<div align="center">\n`;
            md += `  <h3>Tech Stack</h3>\n\n`;

            const processedLangs = stats.languages
                .sort((a, b) => b.percentage - a.percentage)
                .slice(0, 10)
                .map(lang => lang.name.toLowerCase().trim())
                .map(lang => iconMapping[lang] || defaultIcon)
                .filter(Boolean);

            // Combine manual tools with auto-detected languages (deduplicated)
            const combinedStack = Array.from(new Set([
                ...(data.tools || []),
                ...processedLangs
            ]));

            const techStack = combinedStack.join(',');

            md += `  <img src="https://skillicons.dev/icons?i=${techStack}" alt="tech stack" />\n`;
            md += `  <br><br>\n`;
            md += `  <img src="https://github-readme-stats-one.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=${theme}&hide_border=true&langs_count=10&t=${timestamp}" alt="top languages" />\n`;
            md += `</div>\n\n<br>\n\n`;
        }

        // Featured Projects Section
        if (stats.topRepos.length > 0) {
            md += `<div align="center">\n`;
            md += `  <h3>Featured Projects</h3>\n\n`;

            const featured = stats.topRepos.slice(0, 4);
            for (let i = 0; i < featured.length; i += 2) {
                md += `  <img src="https://github-readme-stats-one.vercel.app/api/pin/?username=${username}&repo=${encodeURIComponent(featured[i].name)}&theme=${theme}&hide_border=true&t=${timestamp}" alt="${featured[i].name}" />\n`;
                if (i + 1 < featured.length) {
                    md += `  <img src="https://github-readme-stats-one.vercel.app/api/pin/?username=${username}&repo=${encodeURIComponent(featured[i + 1].name)}&theme=${theme}&hide_border=true&t=${timestamp}" alt="${featured[i + 1].name}" />\n`;
                }
                if (i + 2 < featured.length) md += `<br><br>\n`;
            }
            md += `</div>\n\n<br><br>\n\n`;
        }

        // Footer
        md += `<hr>\n\n`;
        md += `<div align="center">\n`;
        md += `  <sub>Generated with <a href="https://github.com/Xclusive09/gh-profile">gh-profile</a> • ${new Date().getFullYear()}</sub>\n`;
        md += `</div>\n`;

        return md.trim();
    },
};