import { describe, it, expect } from 'vitest';
import { minimalTemplate } from '../src/templates/minimal.js';
import { normalize } from '../src/core/normalize.js';
import type { GitHubUser, GitHubRepo, GitHubData } from '../src/github/types.js';

const createMockGitHubUser = (overrides: Partial<GitHubUser> = {}): GitHubUser => ({
  login: 'testuser',
  id: 123,
  avatar_url: 'https://example.com/avatar.png',
  html_url: 'https://github.com/testuser',
  name: 'Test User',
  company: 'Test Corp',
  blog: 'https://testuser.dev',
  location: 'San Francisco',
  email: 'test@test.com',
  bio: 'A passionate developer',
  twitter_username: 'testuser',
  public_repos: 25,
  public_gists: 5,
  followers: 100,
  following: 50,
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

const createMockGitHubRepo = (overrides: Partial<GitHubRepo> = {}): GitHubRepo => ({
  id: 1,
  name: 'test-repo',
  full_name: 'testuser/test-repo',
  html_url: 'https://github.com/testuser/test-repo',
  description: 'A test repository',
  fork: false,
  created_at: '2021-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  pushed_at: '2024-01-15T00:00:00Z',
  homepage: null,
  size: 1000,
  stargazers_count: 50,
  watchers_count: 50,
  language: 'TypeScript',
  forks_count: 10,
  open_issues_count: 5,
  default_branch: 'main',
  topics: ['test'],
  visibility: 'public',
  archived: false,
  ...overrides,
});

const createMockGitHubData = (overrides: Partial<GitHubData> = {}): GitHubData => ({
  user: createMockGitHubUser(),
  repos: [createMockGitHubRepo()],
  ...overrides,
});

// Helper to get normalized data (recommended approach)
const createMockNormalizedData = (overrides: Partial<GitHubData> = {}) => {
  const rawData = createMockGitHubData(overrides);
  return normalize(rawData);
};

describe('minimalTemplate', () => {
  describe('Metadata', () => {
    it('should have correct id', () => {
      expect(minimalTemplate.metadata.id).toBe('minimal');
    });

    it('should have correct metadata', () => {
      expect(minimalTemplate.metadata).toMatchObject({
        id: 'minimal',
        name: 'Minimal',
        description: 'A clean, minimal GitHub profile README template',
        category: 'generic',
        version: '0.3.0',
        author: 'gh-profile',
      });
    });
  });

  describe('Header Rendering', () => {
    it('should render header with name', () => {
      const data = createMockNormalizedData();
      const output = minimalTemplate.render(data);

      expect(output).toContain("# Hi, I'm Test User 👋");
    });

    it('should use username as fallback when name is null', () => {
      const data = createMockNormalizedData({
        user: createMockGitHubUser({ name: null }),
      });
      const output = minimalTemplate.render(data);

      expect(output).toContain("# Hi, I'm testuser 👋");
    });
  });

  describe('Bio Section', () => {
    it('should render bio when present', () => {
      const data = createMockNormalizedData();
      const output = minimalTemplate.render(data);

      expect(output).toContain('A passionate developer');
    });

    it('should not render bio section when bio is null', () => {
      const data = createMockNormalizedData({
        user: createMockGitHubUser({ bio: null }),
      });
      const output = minimalTemplate.render(data);

      expect(output).not.toContain('null');
      expect(output).not.toContain('A passionate developer');
    });
  });

  describe('Location Section', () => {
    it('should render location when present', () => {
      const data = createMockNormalizedData();
      const output = minimalTemplate.render(data);

      expect(output).toContain('📍 San Francisco');
    });

    it('should not render location when null', () => {
      const data = createMockNormalizedData({
        user: createMockGitHubUser({ location: null }),
      });
      const output = minimalTemplate.render(data);

      expect(output).not.toContain('📍');
    });
  });

  describe('Stats Section', () => {
    it('should render stats table', () => {
      const data = createMockNormalizedData();
      const output = minimalTemplate.render(data);

      expect(output).toContain('## Stats');
      expect(output).toContain('| Metric       | Value |');
      expect(output).toContain('| Public Repos | 25 |');
      expect(output).toContain('| Followers    | 100   |');
    });

    it('should include public repos count', () => {
      const data = createMockNormalizedData({
        user: createMockGitHubUser({ public_repos: 42 }),
      });
      const output = minimalTemplate.render(data);

      expect(output).toContain('| Public Repos | 42 |');
    });

    it('should include followers count', () => {
      const data = createMockNormalizedData({
        user: createMockGitHubUser({ followers: 999 }),
      });
      const output = minimalTemplate.render(data);

      expect(output).toContain('| Followers    | 999   |');
    });
  });

  describe('Repositories Section', () => {
    it('should render top repositories section when repos exist', () => {
      const data = createMockNormalizedData();
      const output = minimalTemplate.render(data);

      expect(output).toContain('## Top Repositories');
    });

    it('should not render repositories section when empty', () => {
      const data = createMockNormalizedData({ repos: [] });
      const output = minimalTemplate.render(data);

      expect(output).not.toContain('## Top Repositories');
    });

    it('should render repo name as markdown link', () => {
      const data = createMockNormalizedData({
        repos: [createMockGitHubRepo({ name: 'my-project' })],
      });
      const output = minimalTemplate.render(data);

      expect(output).toContain('[my-project]');
      expect(output).toContain('(https://github.com/testuser/test-repo)');
    });

    it('should render repo description when present', () => {
      const data = createMockNormalizedData({
        repos: [createMockGitHubRepo({ description: 'My awesome project' })],
      });
      const output = minimalTemplate.render(data);

      expect(output).toContain('My awesome project');
    });

    it('should render repo stats (stars and forks)', () => {
      const data = createMockNormalizedData({
        repos: [createMockGitHubRepo({ stargazers_count: 42, forks_count: 7 })],
      });
      const output = minimalTemplate.render(data);

      expect(output).toContain('⭐ 42');
      expect(output).toContain('🍴 7');
    });

    it('should limit to 5 repositories and sort by stars descending', () => {
      const manyRepos = Array.from({ length: 10 }, (_, i) =>
          createMockGitHubRepo({
            id: i,
            name: `repo-${i}`,
            stargazers_count: 100 - i * 10, // decreasing stars
            forks_count: 5,
          })
      );

      const data = createMockNormalizedData({ repos: manyRepos });
      const output = minimalTemplate.render(data);

      // Should contain first 5 (highest stars)
      expect(output).toContain('repo-0');
      expect(output).toContain('repo-4');
      expect(output).not.toContain('repo-5');
      expect(output).not.toContain('repo-9');
    });
  });

  describe('Output Quality & Edge Cases', () => {
    it('produces deterministic output for same input', () => {
      const data = createMockNormalizedData();
      const output1 = minimalTemplate.render(data);
      const output2 = minimalTemplate.render(data);

      expect(output1).toBe(output2);
    });

    it('never contains null or undefined strings', () => {
      const data = createMockNormalizedData({
        user: createMockGitHubUser({
          bio: null,
          company: null,
          location: null,
          blog: null,
          twitter_username: null,
          email: null,
        }),
        repos: [createMockGitHubRepo({ description: null })],
      });

      const output = minimalTemplate.render(data);

      expect(output).not.toContain('null');
      expect(output).not.toContain('undefined');
    });

    it('always renders header and stats section (even with minimal data)', () => {
      const data = createMockNormalizedData({
        user: createMockGitHubUser({
          name: null,
          bio: null,
          location: null,
          public_repos: 0,
          followers: 0,
        }),
        repos: [],
      });

      const output = minimalTemplate.render(data);

      expect(output).toContain("# Hi, I'm");
      expect(output).toContain('## Stats');
    });

    it('handles zero stats gracefully', () => {
      const data = createMockNormalizedData({
        user: createMockGitHubUser({
          public_repos: 0,
          followers: 0,
        }),
      });

      const output = minimalTemplate.render(data);

      expect(output).toContain('| Public Repos | 0 |');
      expect(output).toContain('| Followers    | 0   |');
    });

    it('handles empty repo description without errors', () => {
      const data = createMockNormalizedData({
        repos: [createMockGitHubRepo({ description: null })],
      });

      const output = minimalTemplate.render(data);

      expect(output).not.toContain('null');
      expect(output).toContain('## Top Repositories');
    });
  });
});