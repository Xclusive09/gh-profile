import type { Template } from './types.js';
import type { NormalizedData } from '../core/models.js';

export const minimalTemplate: Template = {
    metadata: {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean, elegant, and professional – focused on simplicity',
        category: 'generic',
        version: '1.0.0',
        author: 'gh-profile',
        source: 'built-in'
    },
    render: (data: NormalizedData): string => {
        const { profile, repos, stats } = data;
        const displayName = profile.name || profile.username;
        const username = profile.username;
        const theme = 'dracula'; // Robust, professional, high-contrast
        const timestamp = new Date().getTime();

        // Helper to safely format bio for HTML
        const safeBio = profile.bio ? profile.bio.replace(/\r?\n|\r/g, ' ').trim() : '';

        let md = `<div align="left">\n`;
        md += `  <h1>${displayName}</h1>\n`;

        if (safeBio) {
            md += `  <p><em>${safeBio}</em></p>\n`;
        }

        const badges: string[] = [];
        if (profile.location) {
            badges.push(`<img src="https://img.shields.io/badge/Location-${encodeURIComponent(profile.location)}-64748b?style=flat-square&logo=google-maps&logoColor=white" alt="location" />`);
        }

        // Stable Shields.io badges for core stats
        badges.push(`<img src="https://img.shields.io/badge/Stars-${stats.totalStars}-f59e0b?style=flat-square&logo=github-sponsors&logoColor=white" alt="total stars" />`);
        badges.push(`<img src="https://img.shields.io/badge/Followers-${profile.followers}-0ea5e9?style=flat-square&logo=github&logoColor=white" alt="followers" />`);

        // Profile Views Badge
        badges.push(`<img src="https://komarev.com/ghpvc/?username=${username}&label=PROFILE+VIEWS&color=64748b&style=flat-square" alt="profile views" />`);

        if (badges.length > 0) {
            md += `  <p>${badges.join('&nbsp;&nbsp;')}</p>\n`;
        }

        md += `</div>\n\n`;

        // Tools & Frameworks
        // Map common languages to skillicons IDs
        const iconMapping: Record<string, string> = {
            'javascript': 'js', 'typescript': 'ts', 'python': 'py', 'html': 'html', 'css': 'css',
            'java': 'java', 'kotlin': 'kotlin', 'c': 'c', 'shell': 'bash', 'go': 'go', 'rust': 'rust'
        };

        const detectedLangs = stats.languages
            .map(l => l.name.toLowerCase().trim())
            .map(l => iconMapping[l])
            .filter(Boolean);

        const combinedTools = Array.from(new Set([
            ...(data.tools || []),
            ...detectedLangs
        ]));

        const toolsList = combinedTools.length ? combinedTools.join(',') : 'git,docker,vscode,linux,github,gmail,stackoverflow,twitter';
        md += `<div align="left">\n`;
        md += `  <img src="https://skillicons.dev/icons?i=${toolsList}" alt="tools" />\n`;
        md += `</div>\n\n<br>\n\n`;

        // GitHub Stats Cards - Hybrid Rendering (Text + Image)
        md += `### Metrics & Languages <img src="https://img.shields.io/badge/-Stats-0f172a?style=flat-square&logo=github&logoColor=white" alt="metrics" />\n\n`;

        // Text Fallback for Stats
        md += `| Total Repos | Total Stars | Total Forks | Contributions |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;
        md += `| ${profile.publicRepos} | ${stats.totalStars} | ${stats.totalForks} | Active |\n\n`;

        md += `<div align="left">\n`;
        md += `  <img src="https://github-readme-stats-one.vercel.app/api?username=${username}&show_icons=true&theme=${theme}&hide_border=true&t=${timestamp}" alt="GitHub Stats" />\n`;

        if (stats.languages.length > 0) {
            md += `  <img src="https://github-readme-stats-one.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=${theme}&hide_border=true&langs_count=10&t=${timestamp}" alt="Top Languages" />\n`;
        }
        md += `</div>\n\n<br>\n\n`;

        // Featured Projects - Repo Pins
        if (repos.length > 0) {
            md += `### Featured Projects <img src="https://img.shields.io/badge/-Work-0f172a?style=flat-square&logo=star&logoColor=white" alt="projects" />\n\n`;
            md += `<div align="left">\n`;

            const topRepos = [...repos]
                .sort((a, b) => b.stars - a.stars)
                .slice(0, 4);

            for (const repo of topRepos) {
                md += `  <a href="${repo.url}">\n`;
                md += `    <img src="https://github-readme-stats-one.vercel.app/api/pin/?username=${username}&repo=${repo.name}&theme=${theme}&hide_border=true&t=${timestamp}" alt="${repo.name}" />\n`;
                md += `  </a>\n`;
            }
            md += `</div>\n\n`;
        }

        md += `---\n\n`;
        md += `<div align="center">\n`;
        md += `  <sub>Generated with <a href="https://github.com/Xclusive09/gh-profile">gh-profile</a></sub>\n`;
        md += `</div>\n`;

        return md.trim();
    },
};