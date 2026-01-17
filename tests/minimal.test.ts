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
                description: 'A clean, minimal GitHub profile README template',
                category: 'minimal',
                version: '0.1.0',
                author: 'gh-profile',
            });
        });
    });

    describe('Rendering - Happy path', () => {
        it('renders basic profile and repo information correctly', () => {
            const normalized = createNormalizedData();
            const output = minimalTemplate.render(normalized);

            expect(output).toContain("# Hi, I'm Test User 👋");
            expect(output).toContain('A passionate developer');
            expect(output).toContain('📍 San Francisco');
            expect(output).toContain('## Stats');
            expect(output).toContain('| Public Repos | 25 |');
            expect(output).toContain('| Followers    | 100   |');
            expect(output).toContain('## Top Repositories');
            expect(output).toContain('[test-repo](https://github.com/testuser/test-repo)');
            expect(output).toContain('A test repository');
            expect(output).toContain('⭐ 50 • 🍴 10');
        });
    });

    describe('Rendering - Edge cases', () => {
        it('falls back to username when name is missing', () => {
            const normalized = createNormalizedData({
                user: createMockGitHubUser({ name: null }),
            });
            expect(minimalTemplate.render(normalized)).toContain("# Hi, I'm testuser 👋");
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
            expect(minimalTemplate.render(normalized)).not.toContain('📍');
        });

        it('omits repositories section when no repos', () => {
            const normalized = createNormalizedData({ repos: [] });
            expect(minimalTemplate.render(normalized)).not.toContain('## Top Repositories');
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
            expect(output).toContain('repo-4');
            expect(output).not.toContain('repo-5'); // outside top 5
            expect(output).not.toContain('repo-7');

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