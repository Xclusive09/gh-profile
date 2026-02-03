import type { Template } from './types.js';
import type { NormalizedData, Repository } from '../core/models.js';

export const statsHeavyTemplate: Template = {
    metadata: {
        id: 'stats-heavy',
        name: 'Stats Dashboard',
        description: 'A comprehensive, data-driven dashboard for the analytical developer',
        category: 'developer',
        version: '1.0.0',
        author: 'gh-profile',
        source: 'built-in'
    },


    render: (data: NormalizedData): string => {
        const { profile, repos, stats } = data;
        const username = profile.username;

        const theme = 'dracula';
        const timestamp = new Date().getTime();

        let markdown = `<div align="center">\n`;
        markdown += `  <h1>${profile.name} | Analytics Dashboard</h1>\n`;

        const headerBadges: string[] = [];
        headerBadges.push(`<img src="https://img.shields.io/badge/Stars-${stats.totalStars}-f59e0b?style=flat-square&logo=github-sponsors&logoColor=white" alt="total stars" />`);
        headerBadges.push(`<img src="https://img.shields.io/badge/Followers-${profile.followers}-0ea5e9?style=flat-square&logo=github&logoColor=white" alt="followers" />`);
        headerBadges.push(`<img src="https://komarev.com/ghpvc/?username=${username}&label=PROFILE+VIEWS&color=0f172a&style=flat-square" alt="profile views" />`);

        markdown += `  <p>${headerBadges.join('&nbsp;&nbsp;')}</p>\n`;
        markdown += `</div>\n\n`;

        // GitHub Stats Cards - Hybrid Rendering
        markdown += `<div align="center">\n`;
        markdown += `  <img src="https://github-readme-stats-one.vercel.app/api?username=${username}&show_icons=true&theme=${theme}&hide_border=true&count_private=true&t=${timestamp}" alt="GitHub Stats" />\n`;
        markdown += `  <img src="https://github-readme-stats-one.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=${theme}&hide_border=true&langs_count=10&t=${timestamp}" alt="Top Languages" />\n`;
        markdown += `</div>\n\n`;

        // Text Fallback for Languages
        if (stats.languages.length > 0) {
            markdown += `<p align="center"><strong>Top Languages:</strong> ${stats.languages.slice(0, 5).map(l => `${l.name} (${l.percentage}%)`).join(', ')}</p>\n\n`;
        }

        markdown += `<div align="center">\n`;
        markdown += `  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=${theme}&hide_border=true" alt="GitHub Streak" />\n`;
        markdown += `</div>\n\n<br>\n\n`;

        // Account Statistics Section
        markdown += `### Key Metrics <img src="https://img.shields.io/badge/-Stats-0f172a?style=flat-square&logo=chart-bar&logoColor=white" alt="metrics" />\n\n`;
        markdown += `| Metric | Value | Detail |\n`;
        markdown += `| :--- | :--- | :--- |\n`;
        markdown += `| **Account Age** | ${getAccountAge(profile.createdAt)} years | Joined ${formatDate(profile.createdAt)} |\n`;
        markdown += `| **Total Repos** | ${profile.publicRepos} | ${countOriginal(repos)} Original |\n`;
        markdown += `| **Community** | ${profile.followers} | ${calculateRatio(profile.followers, profile.following)} Ratio |\n\n`;

        // Repository Analysis Section
        markdown += `### Repository Insights <img src="https://img.shields.io/badge/-Insights-0f172a?style=flat-square&logo=git-branch&logoColor=white" alt="insights" />\n\n`;
        markdown += `| Aspect | Count | Efficiency |\n`;
        markdown += `| :--- | :--- | :--- |\n`;
        markdown += `| **Total Stars** | ${stats.totalStars} | ${calculateAverage(stats.totalStars, stats.totalRepos)} avg/repo |\n`;
        markdown += `| **Total Forks** | ${stats.totalForks} | ${calculateAverage(stats.totalForks, stats.totalRepos)} avg/repo |\n`;
        markdown += `| **Active Projects** | ${countActive(repos)} | ${calculatePercentage(countActive(repos), repos.length)}% activity |\n\n`;

        // Repository Timeline
        markdown += `### Productivity Timeline <img src="https://img.shields.io/badge/-Timeline-0f172a?style=flat-square&logo=clock&logoColor=white" alt="timeline" />\n\n`;
        markdown += `| Year | New Repos | Stars | Forks |\n`;
        markdown += `| :--- | :--- | :--- | :--- |\n`;

        const timeline = calculateTimeline(repos);
        Object.entries(timeline)
            .sort((a, b) => Number(b[0]) - Number(a[0]))
            .forEach(([year, s]) => {
                markdown += `| ${year} | ${s.count} | ${s.stars} | ${s.forks} |\n`;
            });
        markdown += '\n';

        // Tools & Frameworks
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
        markdown += `### Tools & Frameworks <img src="https://img.shields.io/badge/-Tools-0f172a?style=flat-square&logo=tools&logoColor=white" alt="tools" />\n\n`;
        markdown += `<div align="center">\n`;
        markdown += `  <img src="https://skillicons.dev/icons?i=${toolsList}" alt="tools" />\n`;
        markdown += `</div>\n\n<br>\n\n`;

        // Featured Projects - Repo Pins
        markdown += `### Featured Projects <img src="https://img.shields.io/badge/-Projects-0f172a?style=flat-square&logo=star&logoColor=white" alt="top" />\n\n`;
        markdown += `<div align="center">\n`;

        const topRepos = [...repos]
            .sort((a, b) => b.stars - a.stars)
            .slice(0, 4);

        for (const repo of topRepos) {
            markdown += `  <a href="${repo.url}">\n`;
            markdown += `    <img src="https://github-readme-stats-one.vercel.app/api/pin/?username=${username}&repo=${repo.name}&theme=${theme}&hide_border=true&t=${timestamp}" alt="${repo.name}" />\n`;
            markdown += `  </a>\n`;
        }
        markdown += `</div>\n\n`;

        // Footer
        markdown += `<hr>\n\n`;
        markdown += `<hr>\n\n`;
        markdown += `<div align="center">\n`;
        markdown += `  <sub>Generated with <a href="https://github.com/Xclusive09/gh-profile">gh-profile</a> • ${new Date().getFullYear()}</sub>\n`;
        markdown += `</div>\n`;

        return markdown;
    },
};

// ── Helper functions

function getAccountAge(date: Date): number {
    const diff = new Date().getTime() - date.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24 * 365) * 10) / 10;
}

function calculateRatio(followers: number, following: number): string {
    return (followers / (following || 1)).toFixed(2);
}

function calculateAverage(total: number, count: number): string {
    return (total / (count || 1)).toFixed(1);
}

function calculatePercentage(part: number, total: number): number {
    return Math.round((part / (total || 1)) * 100);
}

// function countOpenSource(repos: Repository[]): number {
//     return repos.filter(r => !r.isArchived && r.language !== null).length;
// }

function countOriginal(repos: Repository[]): number {
    return repos.filter(r => !r.isFork).length;
}

function countActive(repos: Repository[]): number {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return repos.filter(r => !r.isArchived && r.pushedAt > threeMonthsAgo).length;
}

interface LanguageStat {
    count: number;
    stars: number;
    percentage: number;
}

// function calculateLanguageStats(repos: Repository[]): Record<string, LanguageStat> {
//     const stats: Record<string, LanguageStat> = {};

//     repos.forEach(repo => {
//         if (!repo.language) return;

//         if (!stats[repo.language]) {
//             stats[repo.language] = { count: 0, stars: 0, percentage: 0 };
//         }

//         stats[repo.language].count++;
//         stats[repo.language].stars += repo.stars;
//     });

//     const total = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0);

//     Object.values(stats).forEach(stat => {
//         stat.percentage = calculatePercentage(stat.count, total);
//     });

//     return stats;
// }

interface TimelineStat {
    count: number;
    stars: number;
    forks: number;
}

function calculateTimeline(repos: Repository[]): Record<string, TimelineStat> {
    const timeline: Record<string, TimelineStat> = {};

    repos.forEach(repo => {
        const year = repo.createdAt.getFullYear().toString();

        if (!timeline[year]) {
            timeline[year] = { count: 0, stars: 0, forks: 0 };
        }

        timeline[year].count++;
        timeline[year].stars += repo.stars;
        timeline[year].forks += repo.forks;
    });

    return timeline;
}

// function getTopRepos(repos: Repository[], limit: number): Repository[] {
//     return [...repos]
//         .sort((a, b) => b.stars - a.stars)
//         .slice(0, limit);
// }

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}