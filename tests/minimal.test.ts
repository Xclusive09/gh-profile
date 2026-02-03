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

const createNormalizedData = (overrides: Partial<GitHubData> = {}) => {
    const raw = createMockGitHubData(overrides);
    return normalize(raw);
};

describe('minimalTemplate', () => {
    describe('Metadata', () => {
        it('has correct metadata', () => {
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

    describe('Rendering - Happy path', () => {
        it('renders basic profile and repo information correctly', () => {
            const normalized = createNormalizedData();
            const output = minimalTemplate.render(normalized);

            expect(output).toContain('<h1>Test User</h1>');
            expect(output).toContain('A passionate developer');
            expect(output).toContain('img src="https://img.shields.io/badge/Location-San%20Francisco-64748b');
            expect(output).toContain('img src="https://img.shields.io/badge/Stars-50-f59e0b');
            expect(output).toContain('img src="https://img.shields.io/badge/Followers-100-0ea5e9');
            expect(output).toContain('img src="https://komarev.com/ghpvc/?username=testuser&label=PROFILE+VIEWS');

            // Text Fallback Check
            expect(output).toContain('| Total Repos | Total Stars | Total Forks |');
            expect(output).toContain('| 25 | 50 | 10 |');

            expect(output).toContain('skillicons.dev/icons?i=git,docker');
            expect(output).toContain('langs_count=10');
            expect(output).toContain('### Metrics & Languages');
            expect(output).toContain('github-readme-stats-one.vercel.app/api?username=testuser');
            expect(output).toContain('github-readme-stats-one.vercel.app/api/top-langs/?username=testuser');
            expect(output).toContain('### Featured Projects');
            expect(output).toContain('github-readme-stats-one.vercel.app/api/pin/?username=testuser&repo=test-repo');
            expect(output).toContain('img src="https://img.shields.io/badge/-Work-0f172a');
        });
    });

    describe('Rendering - Edge cases', () => {
        it('falls back to username when name is missing', () => {
            const normalized = createNormalizedData({
                user: createMockGitHubUser({ name: null }),
            });
            expect(minimalTemplate.render(normalized)).toContain("<h1>testuser</h1>");
        });

        it('omits bio when missing', () => {
            const normalized = createNormalizedData({
                user: createMockGitHubUser({ bio: null }),
            });
            const output = minimalTemplate.render(normalized);
            expect(output).not.toContain('null');
            expect(output).not.toContain('A passionate developer');
        });

        it('omits location when missing', () => {
            const normalized = createNormalizedData({
                user: createMockGitHubUser({ location: null }),
            });
            expect(minimalTemplate.render(normalized)).not.toContain('google-maps');
        });

        it('omits repositories section when no repos', () => {
            const normalized = createNormalizedData({ repos: [] });
            expect(minimalTemplate.render(normalized)).not.toContain('### Featured Work');
        });

        it('limits to 5 repositories and sorts by stars descending', () => {
            const manyRepos = Array.from({ length: 8 }, (_, i) =>
                createMockGitHubRepo({
                    name: `repo-${i}`,
                    stargazers_count: 100 - i * 10,
                    forks_count: 5,
                })
            );

            const normalized = createNormalizedData({ repos: manyRepos });
            const output = minimalTemplate.render(normalized);

            expect(output).toContain('repo-0'); // highest stars
            expect(output).toContain('repo-2');
            expect(output).toContain('repo-3'); // 4th repo should be present
            expect(output).not.toContain('repo-4'); // 5th repo should be absent

            const first = output.indexOf('repo-0');
            const second = output.indexOf('repo-1');
            expect(first).toBeLessThan(second);
        });
    });

    describe('Output quality', () => {
        it('produces deterministic output', () => {
            const data = createNormalizedData();
            expect(minimalTemplate.render(data)).toBe(minimalTemplate.render(data));
        });

        it('never contains null/undefined', () => {
            const data = createNormalizedData({
                user: createMockGitHubUser({
                    bio: null,
                    location: null,
                    company: null,
                }),
                repos: [
                    createMockGitHubRepo({ description: null }),
                    createMockGitHubRepo({ description: null }),
                ],
            });
            const output = minimalTemplate.render(data);
            expect(output).not.toContain('null');
            expect(output).not.toContain('undefined');
        });
    });
});