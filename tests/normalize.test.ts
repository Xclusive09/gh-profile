import { describe, it, expect } from 'vitest';
import {
  normalizeUser,
  normalizeRepo,
  sortByStars,
  sortByRecent,
  filterOriginalRepos,
} from '../src/core/normalize.js';
import {
  aggregateLanguages,
  aggregateTotalStars,
  getTopRepos,
} from '../src/core/aggregate.js';
import type { GitHubUser, GitHubRepo } from '../src/github/types.js';
import type { Repository } from '../src/core/models.js';

const mockUser: GitHubUser = {
  login: 'testuser',
  id: 123,
  avatar_url: 'https://example.com/avatar.png',
  html_url: 'https://github.com/testuser',
  name: 'Test User',
  company: 'Test Co',
  blog: 'https://test.com',
  location: 'Test City',
  email: 'test@test.com',
  bio: 'A test user',
  twitter_username: 'testuser',
  public_repos: 10,
  public_gists: 5,
  followers: 100,
  following: 50,
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockRepo: GitHubRepo = {
  id: 1,
  name: 'test-repo',
  full_name: 'testuser/test-repo',
  html_url: 'https://github.com/testuser/test-repo',
  description: 'A test repo',
  fork: false,
  created_at: '2021-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  pushed_at: '2024-01-15T00:00:00Z',
  homepage: 'https://test-repo.com',
  size: 1000,
  stargazers_count: 50,
  watchers_count: 50,
  language: 'TypeScript',
  forks_count: 10,
  open_issues_count: 5,
  default_branch: 'main',
  topics: ['test', 'typescript'],
  visibility: 'public',
  archived: false,
};

describe('normalizeUser', () => {
  it('should normalize GitHub user to Profile', () => {
    const profile = normalizeUser(mockUser);

    expect(profile.username).toBe('testuser');
    expect(profile.name).toBe('Test User');
    expect(profile.followers).toBe(100);
    expect(profile.publicRepos).toBe(10);
    expect(profile.createdAt).toBeInstanceOf(Date);
  });

  it('should use login as name when name is null', () => {
    const userWithoutName = { ...mockUser, name: null };
    const profile = normalizeUser(userWithoutName);

    expect(profile.name).toBe('testuser');
  });
});

describe('normalizeRepo', () => {
  it('should normalize GitHub repo to Repository', () => {
    const repo = normalizeRepo(mockRepo);

    expect(repo.name).toBe('test-repo');
    expect(repo.stars).toBe(50);
    expect(repo.forks).toBe(10);
    expect(repo.language).toBe('TypeScript');
    expect(repo.isFork).toBe(false);
    expect(repo.pushedAt).toBeInstanceOf(Date);
  });
});

describe('sortByStars', () => {
  it('should sort repos by stars descending', () => {
    const repos: Repository[] = [
      { ...normalizeRepo(mockRepo), name: 'low', stars: 10 },
      { ...normalizeRepo(mockRepo), name: 'high', stars: 100 },
      { ...normalizeRepo(mockRepo), name: 'mid', stars: 50 },
    ];

    const sorted = sortByStars(repos);

    expect(sorted[0].name).toBe('high');
    expect(sorted[1].name).toBe('mid');
    expect(sorted[2].name).toBe('low');
  });
});

describe('sortByRecent', () => {
  it('should sort repos by pushed date descending', () => {
    const repos: Repository[] = [
      {
        ...normalizeRepo(mockRepo),
        name: 'old',
        pushedAt: new Date('2020-01-01'),
      },
      {
        ...normalizeRepo(mockRepo),
        name: 'new',
        pushedAt: new Date('2024-01-01'),
      },
      {
        ...normalizeRepo(mockRepo),
        name: 'mid',
        pushedAt: new Date('2022-01-01'),
      },
    ];

    const sorted = sortByRecent(repos);

    expect(sorted[0].name).toBe('new');
    expect(sorted[1].name).toBe('mid');
    expect(sorted[2].name).toBe('old');
  });
});

describe('filterOriginalRepos', () => {
  it('should filter out forks and archived repos', () => {
    const repos: Repository[] = [
      { ...normalizeRepo(mockRepo), name: 'original', isFork: false, isArchived: false },
      { ...normalizeRepo(mockRepo), name: 'forked', isFork: true, isArchived: false },
      { ...normalizeRepo(mockRepo), name: 'archived', isFork: false, isArchived: true },
    ];

    const filtered = filterOriginalRepos(repos);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('original');
  });
});

describe('aggregateLanguages', () => {
  it('should count languages from non-fork repos', () => {
    const repos: Repository[] = [
      { ...normalizeRepo(mockRepo), language: 'TypeScript', isFork: false },
      { ...normalizeRepo(mockRepo), language: 'TypeScript', isFork: false },
      { ...normalizeRepo(mockRepo), language: 'JavaScript', isFork: false },
      { ...normalizeRepo(mockRepo), language: 'TypeScript', isFork: true },
    ];

    const languages = aggregateLanguages(repos);

    expect(languages[0].name).toBe('TypeScript');
    expect(languages[0].count).toBe(2);
    expect(languages[1].name).toBe('JavaScript');
    expect(languages[1].count).toBe(1);
  });

  it('should calculate percentages', () => {
    const repos: Repository[] = [
      { ...normalizeRepo(mockRepo), language: 'TypeScript', isFork: false },
      { ...normalizeRepo(mockRepo), language: 'JavaScript', isFork: false },
    ];

    const languages = aggregateLanguages(repos);

    expect(languages[0].percentage).toBe(50);
    expect(languages[1].percentage).toBe(50);
  });
});

describe('aggregateTotalStars', () => {
  it('should sum all stars', () => {
    const repos: Repository[] = [
      { ...normalizeRepo(mockRepo), stars: 10 },
      { ...normalizeRepo(mockRepo), stars: 20 },
      { ...normalizeRepo(mockRepo), stars: 30 },
    ];

    const total = aggregateTotalStars(repos);

    expect(total).toBe(60);
  });
});

describe('getTopRepos', () => {
  it('should return top repos by stars excluding forks', () => {
    const repos: Repository[] = [
      { ...normalizeRepo(mockRepo), name: 'a', stars: 100, isFork: false, isArchived: false },
      { ...normalizeRepo(mockRepo), name: 'b', stars: 200, isFork: true, isArchived: false },
      { ...normalizeRepo(mockRepo), name: 'c', stars: 50, isFork: false, isArchived: false },
    ];

    const top = getTopRepos(repos, 2);

    expect(top).toHaveLength(2);
    expect(top[0].name).toBe('a');
    expect(top[1].name).toBe('c');
  });
});
