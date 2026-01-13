import type { NormalizedData, Repository, LanguageStats } from '../core/models.js';
import type { Template } from './types.js';

function renderHeader(data: NormalizedData): string {
  const { profile } = data;
  const lines: string[] = [];

  lines.push(`# Hi, I'm ${profile.name} 👋`);
  lines.push('');

  if (profile.bio) {
    lines.push(profile.bio);
    lines.push('');
  }

  return lines.join('\n');
}

function renderAbout(data: NormalizedData): string {
  const { profile } = data;
  const lines: string[] = [];
  const items: string[] = [];

  if (profile.location) {
    items.push(`📍 ${profile.location}`);
  }
  if (profile.company) {
    items.push(`🏢 ${profile.company}`);
  }
  if (profile.blog) {
    items.push(`🔗 [${profile.blog}](${profile.blog})`);
  }
  if (profile.twitter) {
    items.push(`🐦 [@${profile.twitter}](https://twitter.com/${profile.twitter})`);
  }

  if (items.length > 0) {
    lines.push('## About');
    lines.push('');
    for (const item of items) {
      lines.push(`- ${item}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function renderStats(data: NormalizedData): string {
  const { profile, stats } = data;
  const lines: string[] = [];

  lines.push('## Stats');
  lines.push('');
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Public Repos | ${profile.publicRepos} |`);
  lines.push(`| Total Stars | ${stats.totalStars} |`);
  lines.push(`| Total Forks | ${stats.totalForks} |`);
  lines.push(`| Followers | ${profile.followers} |`);
  lines.push(`| Following | ${profile.following} |`);
  lines.push('');

  return lines.join('\n');
}

function renderLanguages(languages: LanguageStats[]): string {
  if (languages.length === 0) return '';

  const lines: string[] = [];
  const topLanguages = languages.slice(0, 8);

  lines.push('## Languages');
  lines.push('');

  for (const lang of topLanguages) {
    lines.push(`- **${lang.name}**: ${lang.count} repos (${lang.percentage}%)`);
  }
  lines.push('');

  return lines.join('\n');
}

function renderRepoCard(repo: Repository): string {
  const lines: string[] = [];
  lines.push(`### [${repo.name}](${repo.url})`);

  if (repo.description) {
    lines.push(repo.description);
  }

  const badges: string[] = [];
  if (repo.language) {
    badges.push(`\`${repo.language}\``);
  }
  badges.push(`⭐ ${repo.stars}`);
  badges.push(`🍴 ${repo.forks}`);

  lines.push('');
  lines.push(badges.join(' • '));

  return lines.join('\n');
}

function renderTopRepos(repos: Repository[]): string {
  if (repos.length === 0) return '';

  const lines: string[] = [];

  lines.push('## Top Repositories');
  lines.push('');

  for (const repo of repos) {
    lines.push(renderRepoCard(repo));
    lines.push('');
  }

  return lines.join('\n');
}

function renderFooter(data: NormalizedData): string {
  const { profile } = data;
  const lines: string[] = [];

  lines.push('---');
  lines.push('');
  lines.push(`📫 Find me on [GitHub](${profile.profileUrl})`);

  return lines.join('\n');
}

export const defaultTemplate: Template = {
  name: 'default',

  render(data: NormalizedData): string {
    const sections: string[] = [
      renderHeader(data),
      renderAbout(data),
      renderStats(data),
      renderLanguages(data.stats.languages),
      renderTopRepos(data.stats.topRepos),
      renderFooter(data),
    ];

    return sections.filter(Boolean).join('\n');
  },
};
