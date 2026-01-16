import { describe, it, expect } from 'vitest';
import { showcaseTemplate } from '../src/templates/showcase.js';
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

describe('showcaseTemplate', () => {
    describe('Metadata', () => {
        it('should have correct metadata', () => {
            expect(showcaseTemplate.metadata).toEqual({
                id: 'showcase',
                name: 'Showcase',
                description: 'A feature-rich template highlighting your best work',
                category: 'showcase',
                version: '1.0.0',
                author: 'gh-profile',
            });
        });
    });

    describe('Content Sections', () => {
        const data = createMockData();
        const output = showcaseTemplate.render(data);

        it('should render centered header with name', () => {
            expect(output).toContain('<h1 align="center">Hi 👋, I\'m Test User</h1>');
        });

        it('should render about section with all fields', () => {
            expect(output).toContain('## About Me');
            expect(output).toContain('🌍 Based in **San Francisco**');
            expect(output).toContain('💼 Currently working at **Test Corp**');
            expect(output).toContain('[website](https://testuser.dev)');
            expect(output).toContain('[Twitter](https://twitter.com/testuser)');
        });

        it('should render enhanced stats table', () => {
            expect(output).toContain('| Stars Earned | 150 |');
            expect(output).toContain('| Forks | 30 |');
            expect(output).toContain('| Followers | 100 |');
        });

        it('should render technologies with percentage bars', () => {
            expect(output).toContain('## Technologies');
            expect(output).toContain('TypeScript ████████ 40%');
            expect(output).toContain('JavaScript ██████ 32%');
        });

        it('should render featured projects with enhanced details', () => {
            expect(output).toContain('## Featured Projects');
            expect(output).toContain('### ⭐ [popular-repo]');
            expect(output).toContain('⭐ 100 stars');
            expect(output).toContain('`test`');
        });

        it('should render recent activity section', () => {
            expect(output).toContain('## Recent Activity');
            expect(output).toContain('📦 Pushed to');
        });

        it('should render centered footer with profile link', () => {
            expect(output).toContain('<p align="center">');
            expect(output).toContain('View GitHub Profile');
        });
    });

    describe('Edge Cases', () => {
        it('should handle missing optional fields gracefully', () => {
            const data = createMockData({
                profile: createMockProfile({
                    bio: null,
                    company: null,
                    blog: null,
                    twitter: null,
                }),
            });

            const output = showcaseTemplate.render(data);

            expect(output).not.toContain('null');
            expect(output).not.toContain('undefined');
            expect(output).toContain('Test User');
        });

        it('should handle empty repos list', () => {
            const data = createMockData({
                repos: [],
                stats: createMockStats({
                    topRepos: [],
                    recentRepos: [],
                }),
            });

            const output = showcaseTemplate.render(data);

            expect(output).not.toContain('## Featured Projects');
            expect(output).not.toContain('## Recent Activity');
        });
    });
});