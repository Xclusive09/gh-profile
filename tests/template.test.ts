import { describe, it, expect } from 'vitest';
import { defaultTemplate } from '../src/templates/default.js';
import type { GitHubUser, GitHubRepo, GitHubData } from '../src/github/types.js';

// Mock factories matching GitHub API types
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

describe('defaultTemplate', () => {
  describe('Metadata', () => {
    it('should have id "default"', () => {
      expect(defaultTemplate.metadata.id).toBe('default');
    });

    it('should have correct metadata', () => {
      expect(defaultTemplate.metadata).toMatchObject({
        id: 'default',
        name: 'Default',
        category: 'minimal',
        version: '1.0.0',
      });
    });
  });

  describe('Header Rendering', () => {
    it('should render header with name', () => {
      const data = createMockGitHubData();
      const output = defaultTemplate.render(data);

      expect(output).toContain("# Hi, I'm Test User 👋");
    });

    it('should use login as fallback when name is null', () => {
      const data = createMockGitHubData({
        user: createMockGitHubUser({ name: null }),
      });
      const output = defaultTemplate.render(data);

      expect(output).toContain("# Hi, I'm testuser 👋");
    });
  });

  describe('Bio Section', () => {
    it('should render bio when present', () => {
      const data = createMockGitHubData();
      const output = defaultTemplate.render(data);

      expect(output).toContain('A passionate developer');
    });

    it('should not render bio when null', () => {
      const data = createMockGitHubData({
        user: createMockGitHubUser({ bio: null }),
      });
      const output = defaultTemplate.render(data);

      expect(output).not.toContain('null');
    });
  });

  describe('Location Section', () => {
    it('should render location when present', () => {
      const data = createMockGitHubData();
      const output = defaultTemplate.render(data);

      expect(output).toContain('📍 San Francisco');
    });

    it('should not render location when null', () => {
      const data = createMockGitHubData({
        user: createMockGitHubUser({ location: null }),
      });
      const output = defaultTemplate.render(data);

      expect(output).not.toContain('📍');
    });
  });

  describe('Stats Section', () => {
    it('should render stats table', () => {
      const data = createMockGitHubData();
      const output = defaultTemplate.render(data);

      expect(output).toContain('## Stats');
      expect(output).toContain('| Metric | Count |');
    });

    it('should include public repos count', () => {
      const data = createMockGitHubData({
        user: createMockGitHubUser({ public_repos: 42 }),
      });
      const output = defaultTemplate.render(data);

      expect(output).toContain('| Public Repos | 42 |');
    });

    it('should include followers count', () => {
      const data = createMockGitHubData({
        user: createMockGitHubUser({ followers: 999 }),
      });
      const output = defaultTemplate.render(data);

      expect(output).toContain('| Followers | 999 |');
    });
  });

  describe('Repositories Section', () => {
    it('should render top repositories section when repos exist', () => {
      const data = createMockGitHubData();
      const output = defaultTemplate.render(data);

      expect(output).toContain('## Top Repositories');
    });

    it('should not render repositories section when empty', () => {
      const data = createMockGitHubData({ repos: [] });
      const output = defaultTemplate.render(data);

      expect(output).not.toContain('## Top Repositories');
    });

    it('should render repo name as link', () => {
      const data = createMockGitHubData({
        repos: [createMockGitHubRepo({ name: 'my-project' })],
      });
      const output = defaultTemplate.render(data);

      expect(output).toContain('[my-project]');
      expect(output).toContain('https://github.com/testuser/test-repo');
    });

    it('should render repo description when present', () => {
      const data = createMockGitHubData({
        repos: [createMockGitHubRepo({ description: 'My awesome project' })],
      });
      const output = defaultTemplate.render(data);

      expect(output).toContain('My awesome project');
    });

    it('should render repo stats (stars and forks)', () => {
      const data = createMockGitHubData({
        repos: [createMockGitHubRepo({ stargazers_count: 42, forks_count: 7 })],
      });
      const output = defaultTemplate.render(data);

      expect(output).toContain('⭐ 42');
      expect(output).toContain('🍴 7');
    });

    it('should limit to 5 repos max', () => {
      const repos = Array.from({ length: 10 }, (_, i) =>
          createMockGitHubRepo({ id: i, name: `repo-${i}` })
      );
      const data = createMockGitHubData({ repos });
      const output = defaultTemplate.render(data);

      // Should contain first 5
      expect(output).toContain('repo-0');
      expect(output).toContain('repo-4');
      // Should not contain last 5
      expect(output).not.toContain('repo-5');
      expect(output).not.toContain('repo-9');
    });
  });

  describe('Output Quality', () => {
    it('should produce deterministic output', () => {
      const data = createMockGitHubData();
      const output1 = defaultTemplate.render(data);
      const output2 = defaultTemplate.render(data);

      expect(output1).toBe(output2);
    });

    it('should not contain null or undefined strings', () => {
      const data = createMockGitHubData({
        user: createMockGitHubUser({
          bio: null,
          company: null,
          location: null,
          blog: null,
          twitter_username: null,
          email: null,
        }),
      });
      const output = defaultTemplate.render(data);

      expect(output).not.toContain('null');
      expect(output).not.toContain('undefined');
    });

    it('should always render header and stats', () => {
      const data = createMockGitHubData({
        user: createMockGitHubUser({
          bio: null,
          location: null,
        }),
        repos: [],
      });
      const output = defaultTemplate.render(data);

      expect(output).toContain("# Hi, I'm");
      expect(output).toContain('## Stats');
    });

    it('should return valid markdown string', () => {
      const data = createMockGitHubData();
      const output = defaultTemplate.render(data);

      expect(typeof output).toBe('string');
      expect(output.length).toBeGreaterThan(0);
      expect(output).toMatch(/^#/); // Starts with heading
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty description', () => {
      const data = createMockGitHubData({
        repos: [createMockGitHubRepo({ description: null })],
      });
      const output = defaultTemplate.render(data);

      expect(output).not.toContain('null');
      expect(output).toContain('## Top Repositories');
    });

    it('should handle zero stats', () => {
      const data = createMockGitHubData({
        user: createMockGitHubUser({
          public_repos: 0,
          followers: 0,
          following: 0,
        }),
      });
      const output = defaultTemplate.render(data);

      expect(output).toContain('| Public Repos | 0 |');
      expect(output).toContain('| Followers | 0 |');
    });
  });
});