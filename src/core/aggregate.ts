import type { Repository, LanguageStats, ProfileStats } from './models.js';

export function aggregateLanguages(repos: Repository[]): LanguageStats[] {
  const languageCounts = new Map<string, number>();

  for (const repo of repos) {
    if (repo.language && !repo.isFork) {
      const count = languageCounts.get(repo.language) || 0;
      languageCounts.set(repo.language, count + 1);
    }
  }

  const total = Array.from(languageCounts.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  const languages: LanguageStats[] = Array.from(languageCounts.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return languages;
}

export function aggregateTotalStars(repos: Repository[]): number {
  return repos.reduce((total, repo) => total + repo.stars, 0);
}

export function aggregateTotalForks(repos: Repository[]): number {
  return repos.reduce((total, repo) => total + repo.forks, 0);
}

export function getTopRepos(repos: Repository[], limit = 6): Repository[] {
  return [...repos]
    .filter((repo) => !repo.isFork && !repo.isArchived)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, limit);
}

export function getRecentRepos(repos: Repository[], limit = 6): Repository[] {
  return [...repos]
    .filter((repo) => !repo.isFork && !repo.isArchived)
    .sort((a, b) => b.pushedAt.getTime() - a.pushedAt.getTime())
    .slice(0, limit);
}

export function aggregateStats(repos: Repository[]): ProfileStats {
  return {
    totalStars: aggregateTotalStars(repos),
    totalForks: aggregateTotalForks(repos),
    totalRepos: repos.length,
    languages: aggregateLanguages(repos),
    topRepos: getTopRepos(repos),
    recentRepos: getRecentRepos(repos),
  };
}
