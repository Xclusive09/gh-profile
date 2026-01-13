import { describe, it, expect } from 'vitest';
import { defaultTemplate } from '../src/templates/default.js';
import type { NormalizedData, Profile, Repository, ProfileStats } from '../src/core/models.js';

function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    username: 'testuser',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    profileUrl: 'https://github.com/testuser',
    bio: 'A passionate developer',
    company: 'Test Corp',
    location: 'San Francisco',
    blog: 'https://testuser.dev',
    twitter: 'testuser',
    email: 'test@test.com',
    followers: 100,
    following: 50,
    publicRepos: 25,
    createdAt: new Date('2020-01-01'),
    ...overrides,
  };
}

function createMockRepo(overrides: Partial<Repository> = {}): Repository {
  return {
    name: 'test-repo',
    fullName: 'testuser/test-repo',
    url: 'https://github.com/testuser/test-repo',
    description: 'A test repository',
    language: 'TypeScript',
    stars: 50,
    forks: 10,
    watchers: 50,
    issues: 5,
    topics: ['test'],
    homepage: null,
    isFork: false,
    isArchived: false,
    createdAt: new Date('2021-01-01'),
    updatedAt: new Date('2024-01-01'),
    pushedAt: new Date('2024-01-15'),
    ...overrides,
  };
}

function createMockStats(overrides: Partial<ProfileStats> = {}): ProfileStats {
  return {
    totalStars: 150,
    totalForks: 30,
    totalRepos: 25,
    languages: [
      { name: 'TypeScript', count: 10, percentage: 40 },
      { name: 'JavaScript', count: 8, percentage: 32 },
      { name: 'Python', count: 7, percentage: 28 },
    ],
    topRepos: [
      createMockRepo({ name: 'popular-repo', stars: 100 }),
      createMockRepo({ name: 'another-repo', stars: 50 }),
    ],
    recentRepos: [
      createMockRepo({ name: 'recent-repo', pushedAt: new Date('2024-01-15') }),
    ],
    ...overrides,
  };
}

function createMockData(overrides: Partial<NormalizedData> = {}): NormalizedData {
  return {
    profile: createMockProfile(),
    repos: [createMockRepo()],
    stats: createMockStats(),
    ...overrides,
  };
}

describe('defaultTemplate', () => {
  it('should have name "default"', () => {
    expect(defaultTemplate.name).toBe('default');
  });

  it('should render header with name', () => {
    const data = createMockData();
    const output = defaultTemplate.render(data);

    expect(output).toContain("# Hi, I'm Test User 👋");
  });

  it('should render bio when present', () => {
    const data = createMockData();
    const output = defaultTemplate.render(data);

    expect(output).toContain('A passionate developer');
  });

  it('should not render bio when null', () => {
    const data = createMockData({
      profile: createMockProfile({ bio: null }),
    });
    const output = defaultTemplate.render(data);

    expect(output).not.toContain('null');
  });

  it('should render about section with location', () => {
    const data = createMockData();
    const output = defaultTemplate.render(data);

    expect(output).toContain('📍 San Francisco');
  });

  it('should render stats table', () => {
    const data = createMockData();
    const output = defaultTemplate.render(data);

    expect(output).toContain('## Stats');
    expect(output).toContain('| Public Repos | 25 |');
    expect(output).toContain('| Total Stars | 150 |');
    expect(output).toContain('| Followers | 100 |');
  });

  it('should render languages section', () => {
    const data = createMockData();
    const output = defaultTemplate.render(data);

    expect(output).toContain('## Languages');
    expect(output).toContain('**TypeScript**: 10 repos (40%)');
    expect(output).toContain('**JavaScript**: 8 repos (32%)');
  });

  it('should render top repositories', () => {
    const data = createMockData();
    const output = defaultTemplate.render(data);

    expect(output).toContain('## Top Repositories');
    expect(output).toContain('[popular-repo]');
    expect(output).toContain('⭐ 100');
  });

  it('should render footer with GitHub link', () => {
    const data = createMockData();
    const output = defaultTemplate.render(data);

    expect(output).toContain('📫 Find me on [GitHub](https://github.com/testuser)');
  });

  it('should produce deterministic output', () => {
    const data = createMockData();
    const output1 = defaultTemplate.render(data);
    const output2 = defaultTemplate.render(data);

    expect(output1).toBe(output2);
  });

  it('should handle missing optional fields gracefully', () => {
    const data = createMockData({
      profile: createMockProfile({
        bio: null,
        company: null,
        location: null,
        blog: null,
        twitter: null,
      }),
    });

    const output = defaultTemplate.render(data);

    expect(output).not.toContain('null');
    expect(output).not.toContain('undefined');
    expect(output).toContain("# Hi, I'm Test User 👋");
  });
});
