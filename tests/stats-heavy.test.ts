import { describe, it, expect, vi } from 'vitest';
import { statsHeavyTemplate } from '../src/templates/stats-heavy.js';
import type { NormalizedData, Profile, Repository } from '../src/core/models.js';

vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

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
        createdAt: new Date('2020-01-01T00:00:00Z'),
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
        isArchived: false,
        createdAt: new Date('2021-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        pushedAt: new Date('2024-01-15T00:00:00Z'),
        ...overrides,
    };
}

function createDefaultData(): NormalizedData {
    const repos = [
        createMockRepo({ name: 'repo-2024', createdAt: new Date('2024-01-01'), stars: 100, forks: 20 }),
        createMockRepo({ name: 'repo-2021', createdAt: new Date('2021-01-01'), stars: 50, forks: 5 }),
        createMockRepo({ name: 'repo-2020', createdAt: new Date('2020-01-01'), stars: 25, forks: 5 }),
    ];

    return {
        profile: createMockProfile(),
        repos,
        stats: {
            totalStars: 175,
            totalForks: 30,
            totalRepos: repos.length,
            languages: [
                { name: 'TypeScript', count: 3, percentage: 100 },
            ],
            topRepos: repos,
            recentRepos: repos,
        },
    };
}

describe('statsHeavyTemplate', () => {
    describe('Metadata', () => {
        it('has correct metadata', () => {
            expect(statsHeavyTemplate.metadata).toMatchObject({
                id: 'stats-heavy',
                name: 'Stats Dashboard',
                description: 'A comprehensive, data-driven dashboard for the analytical developer',
                category: 'developer',
                version: '1.0.0',
            });
        });
    });

    describe('Content Sections', () => {
        const defaultData = createDefaultData();
        const defaultOutput = statsHeavyTemplate.render(defaultData);

        it('renders account metrics and stable badges', () => {
            expect(defaultOutput).toContain('<h1>Test User | Analytics Dashboard</h1>');
            expect(defaultOutput).toContain('img src="https://img.shields.io/badge/Stars-175-f59e0b');
            expect(defaultOutput).toContain('img src="https://img.shields.io/badge/Followers-100-0ea5e9');

            expect(defaultOutput).toContain('Key Metrics');
            expect(defaultOutput).toContain('Account Age** | 6 years');
        });

        it('renders repository analytics section', () => {
            expect(defaultOutput).toContain('Repository Insights');
            expect(defaultOutput).toContain('Total Stars** | 175');
            expect(defaultOutput).toContain('Total Forks** | 30');
        });

        it('renders stats cards with dracula theme', () => {
            expect(defaultOutput).toContain('theme=dracula');
            expect(defaultOutput).toContain('github-readme-stats-one.vercel.app/api?username=testuser');
            expect(defaultOutput).toContain('langs_count=10');
        });

        it('renders tools and frameworks', () => {
            expect(defaultOutput).toContain('Tools & Frameworks');
            expect(defaultOutput).toContain('skillicons.dev/icons?i=git,docker');
        });

        it('renders repository timeline', () => {
            expect(defaultOutput).toContain('Productivity Timeline');
            expect(defaultOutput).toContain('| 2024 | 1 | 100 | 20 |');
            expect(defaultOutput).toContain('| 2021 | 1 | 50 | 5 |');
            expect(defaultOutput).toContain('| 2020 | 1 | 25 | 5 |');
        });

        it('renders featured projects with repo cards', () => {
            expect(defaultOutput).toContain('Featured Projects');
            expect(defaultOutput).toContain('github-readme-stats-one.vercel.app/api/pin/?username=testuser');
            expect(defaultOutput).toContain('repo=repo-2024');
        });
    });

    describe('Edge Cases', () => {
        it('handles empty repository list gracefully', () => {
            const emptyData: NormalizedData = {
                profile: createMockProfile({ publicRepos: 0 }),
                repos: [],
                stats: {
                    totalStars: 0,
                    totalForks: 0,
                    totalRepos: 0,
                    languages: [],
                    topRepos: [],
                    recentRepos: [],
                },
            };

            const output = statsHeavyTemplate.render(emptyData);
            expect(output).not.toContain('null');
            expect(output).toContain('Total Stars** | 0');
        });
    });
});