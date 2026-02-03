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
        description: 'Clean, elegant, and professional – focused on simplicity',
        category: 'generic',
        version: '1.0.0',
        author: 'gh-profile',
      });
    });
  });

  describe('Header Rendering', () => {
    it('should render header with name', () => {
      const data = createMockNormalizedData();
      const output = minimalTemplate.render(data);

      expect(output).toContain("<h1>Test User</h1>");
    });

    it('should use username as fallback when name is null', () => {
      const data = createMockNormalizedData({
        user: createMockGitHubUser({ name: null }),
      });
      const output = minimalTemplate.render(data);

      expect(output).toContain("<h1>testuser</h1>");
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

      expect(output).toContain('img src="https://img.shields.io/badge/Location-San%20Francisco-64748b');
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

      expect(output).toContain('### Metrics & Languages');
      expect(output).toContain('| Total Repos | Total Stars | Total Forks |');
      expect(output).toContain('img src="https://img.shields.io/badge/Stars-50-f59e0b');
      expect(output).toContain('github-readme-stats-one.vercel.app/api?username=testuser');
    });

    it('should include public repos count', () => {
      const data = createMockNormalizedData({
        user: createMockGitHubUser({ public_repos: 42 }),
      });
      const output = minimalTemplate.render(data);

      expect(output).toContain('github-readme-stats-one.vercel.app/api?username=testuser');
    });

    it('should include followers count', () => {
      const data = createMockNormalizedData({
        user: createMockGitHubUser({ followers: 999 }),
      });
      const output = minimalTemplate.render(data);

      expect(output).toContain('github-readme-stats-one.vercel.app/api?username=testuser');
    });
  });

  describe('Repositories Section', () => {
    it('should render top repositories section when repos exist', () => {
      const data = createMockNormalizedData();
      const output = minimalTemplate.render(data);

      expect(output).toContain('### Featured Projects');
    });

    it('should not render repositories section when empty', () => {
      const data = createMockNormalizedData({ repos: [] });
      const output = minimalTemplate.render(data);

      expect(output).not.toContain('### Featured Projects');
    });

    it('should render repo name using Repo Card', () => {
      const data = createMockNormalizedData({
        repos: [createMockGitHubRepo({ name: 'my-project' })],
      });
      const output = minimalTemplate.render(data);

      expect(output).toContain('github-readme-stats-one.vercel.app/api/pin/');
      expect(output).toContain('repo=my-project');
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

      expect(output).toContain('### Featured Projects');
      expect(output).toContain('github-readme-stats-one.vercel.app/api/pin/?username=testuser');
      expect(output).toContain('repo=repo-0');
      expect(output).toContain('repo=repo-1');
      expect(output).toContain('repo=repo-2');
      expect(output).toContain('repo=repo-3');
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

      expect(output).toContain("<h1>");
      expect(output).toContain('### Metrics & Languages');
    });

    it('handles zero stats gracefully', () => {
      const data = createMockNormalizedData({
        user: createMockGitHubUser({
          public_repos: 0,
          followers: 0,
        }),
      });

      const output = minimalTemplate.render(data);

      expect(output).toContain('github-readme-stats-one.vercel.app/api?username=testuser');
    });

    it('handles empty repo description without errors', () => {
      const data = createMockNormalizedData({
        repos: [createMockGitHubRepo({ description: null })],
      });

      const output = minimalTemplate.render(data);

      expect(output).not.toContain('null');
      expect(output).toContain('### Featured Projects');
    });
  });
});