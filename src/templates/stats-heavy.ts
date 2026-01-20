import type { Template } from './types.js';
import type { NormalizedData, Repository } from '../core/models.js';

export const statsHeavyTemplate: Template = {
    metadata: {
        id: 'stats-heavy',
        name: 'Stats Heavy',
        description: 'A data-focused template with comprehensive statistics',
        category: 'stats-heavy',
        version: '1.0.0',
        author: 'gh-profile',
    },

    render(data: NormalizedData): string {
        const { profile, repos, stats } = data;

        let markdown = `# ${profile.name} | GitHub Statistics\n\n`;

        // Account Statistics
        markdown += '## Account Metrics\n\n';
        markdown += '| Metric | Value |\n';
        markdown += '|--------|-------|\n';
        markdown += `| Account Age | ${getAccountAge(profile.createdAt)} years |\n`;
        markdown += `| Public Repositories | ${profile.publicRepos} |\n`;
        markdown += `| Followers | ${profile.followers} |\n`;
        markdown += `| Following | ${profile.following} |\n`;
        markdown += `| Following Ratio | ${calculateRatio(profile.followers, profile.following)} |\n\n`;

        // Repository Statistics
        markdown += '## Repository Analytics\n\n';
        markdown += '| Metric | Count | Per Repository |\n';
        markdown += '|--------|-------|----------------|\n';
        markdown += `| Total Stars | ${stats.totalStars} | ${calculateAverage(stats.totalStars, stats.totalRepos)} |\n`;
        markdown += `| Total Forks | ${stats.totalForks} | ${calculateAverage(stats.totalForks, stats.totalRepos)} |\n`;
        markdown += `| Open Source | ${countOpenSource(repos)} | ${calculatePercentage(countOpenSource(repos), repos.length)}% |\n`;
        markdown += `| Original Work | ${countOriginal(repos)} | ${calculatePercentage(countOriginal(repos), repos.length)}% |\n`;
        markdown += `| Active Projects | ${countActive(repos)} | ${calculatePercentage(countActive(repos), repos.length)}% |\n\n`;

        // Language Distribution
        markdown += '## Language Distribution\n\n';
        markdown += '| Language | Repositories | Percentage | Stars |\n';
        markdown += '|----------|--------------|------------|-------|\n';

        const languageStats = calculateLanguageStats(repos);
        Object.entries(languageStats)
            .sort(([, a], [, b]) => b.count - a.count)
            .forEach(([language, stats]) => {
                markdown += `| ${language} | ${stats.count} | ${stats.percentage}% | ${stats.stars} |\n`;
            });
        markdown += '\n';

        // Repository Timeline
        markdown += '## Repository Timeline\n\n';
        markdown += '| Year | New Repositories | Total Stars | Forks |\n';
        markdown += '|------|------------------|-------------|-------|\n';

        const timeline = calculateTimeline(repos);
        Object.entries(timeline)
            .sort((a, b) => Number(b[0]) - Number(a[0]))
            .forEach(([year, stats]) => {
                markdown += `| ${year} | ${stats.count} | ${stats.stars} | ${stats.forks} |\n`;
            });
        markdown += '\n';

        // Top Performing Repositories
        markdown += '## Top Performing Repositories\n\n';
        markdown += '| Repository | Stars | Forks | Issues | Created | Last Push |\n';
        markdown += '|------------|-------|-------|--------|---------|-----------|\n';

        getTopRepos(repos, 5).forEach(repo => {
            markdown += `| [${repo.name}](${repo.url}) | ${repo.stars} | ${repo.forks} | ${repo.issues} | `;
            markdown += `${formatDate(repo.createdAt)} | ${formatDate(repo.pushedAt)} |\n`;
        });

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

function countOpenSource(repos: Repository[]): number {
    return repos.filter(r => !r.isArchived && r.language !== null).length;
}

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

function calculateLanguageStats(repos: Repository[]): Record<string, LanguageStat> {
    const stats: Record<string, LanguageStat> = {};

    repos.forEach(repo => {
        if (!repo.language) return;

        if (!stats[repo.language]) {
            stats[repo.language] = { count: 0, stars: 0, percentage: 0 };
        }

        stats[repo.language].count++;
        stats[repo.language].stars += repo.stars;
    });

    const total = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0);

    Object.values(stats).forEach(stat => {
        stat.percentage = calculatePercentage(stat.count, total);
    });

    return stats;
}

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

function getTopRepos(repos: Repository[], limit: number): Repository[] {
    return [...repos]
        .sort((a, b) => b.stars - a.stars)
        .slice(0, limit);
}

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}