import type { GitHubUser, GitHubRepo, GitHubData } from '../github/types.js';
import type { Profile, Repository, NormalizedData } from './models.js';
import { aggregateStats } from './aggregate.js';

export function normalizeUser(user: GitHubUser): Profile {
  return {
    username: user.login,
    name: user.name || user.login,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    bio: user.bio,
    company: user.company,
    location: user.location,
    blog: user.blog || null,
    twitter: user.twitter_username,
    email: user.email,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    createdAt: new Date(user.created_at),
  };
}

export function normalizeRepo(repo: GitHubRepo): Repository {
  return {
    name: repo.name,
    fullName: repo.full_name,
    url: repo.html_url,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.watchers_count,
    issues: repo.open_issues_count,
    topics: repo.topics || [],
    homepage: repo.homepage,
    isFork: repo.fork,
    isArchived: repo.archived,
    createdAt: new Date(repo.created_at),
    updatedAt: new Date(repo.updated_at),
    pushedAt: new Date(repo.pushed_at),
  };
}

export function normalizeRepos(repos: GitHubRepo[]): Repository[] {
  return repos.map(normalizeRepo);
}

export type { NormalizedData } from './models.js';

export function sortByStars(repos: Repository[]): Repository[] {
  return [...repos].sort((a, b) => b.stars - a.stars);
}

export function sortByRecent(repos: Repository[]): Repository[] {
  return [...repos].sort(
    (a, b) => b.pushedAt.getTime() - a.pushedAt.getTime()
  );
}

export function filterOriginalRepos(repos: Repository[]): Repository[] {
  return repos.filter((repo) => !repo.isFork && !repo.isArchived);
}

export function normalize(data: GitHubData): NormalizedData {
  const profile = normalizeUser(data.user);
  const repos = normalizeRepos(data.repos);
  const stats = aggregateStats(repos);

  return { profile, repos, stats };
}

/**
 * Caches normalized/aggregated data for a given GitHubData object (by reference).
 * Prevents repeated normalization/aggregation for large profiles.
 */
export class NormalizedDataCache {
  private cache = new WeakMap<GitHubData, NormalizedData>();

  get(data: GitHubData): NormalizedData {
    let cached = this.cache.get(data);
    if (!cached) {
      cached = normalize(data);
      this.cache.set(data, cached);
    }
    return cached;
  }
}

// Singleton cache instance for use across plugins/runners
export const normalizedDataCache = new NormalizedDataCache();