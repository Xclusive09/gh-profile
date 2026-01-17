import { describe, it, expect } from 'vitest';
import { showcaseTemplate } from '../src/templates/showcase.js';
import type { NormalizedData, Profile, Repository } from '../src/core/models.js';

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
        name: 'popular-repo',
        fullName: 'testuser/popular-repo',
        url: 'https://github.com/testuser/popular-repo',
        description: 'A very popular repo',
        language: 'TypeScript',
        stars: 100,
        forks: 30,
        watchers: 50,
        issues: 5,
        topics: ['test', 'awesome'],
        homepage: null,
        isFork: false,
        isArchived: false,
        createdAt: new Date('2021-01-01'),
        updatedAt: new Date('2024-01-01'),
        pushedAt: new Date('2024-01-15'),
        ...overrides,
    };
}

function createMockData(overrides: Partial<NormalizedData> = {}): NormalizedData {
    const repos = [
        createMockRepo(),
        createMockRepo({ name: 'another-repo', stars: 50 }),
    ];

    return {
        profile: createMockProfile(),
        repos,
        stats: {
            totalStars: 150,
            totalForks: 30,
            totalRepos: 2,
            languages: [
                { name: 'TypeScript', count: 2, percentage: 100 },
            ],
            topRepos: repos,
            recentRepos: repos,
            ...overrides.stats,
        },
        ...overrides,
    };
}

describe('showcaseTemplate', () => {
    describe('Metadata', () => {
        it('has correct metadata', () => {
            expect(showcaseTemplate.metadata).toMatchObject({
                id: 'showcase',
                name: 'Showcase',
                category: 'showcase',
            });
        });
    });

    describe('Content Sections', () => {
        const data = createMockData();
        const output = showcaseTemplate.render(data);

        it('renders centered header with name', () => {
            expect(output).toContain('<div align="center">');
            expect(output).toContain('<h1>Hey there 👋 I\'m Test User</h1>');
        });

        it('renders connect section with profile fields', () => {
            expect(output).toContain('## Connect with me');
            expect(output).toContain('🌍 San Francisco');
            expect(output).toContain('💼 Test Corp');
            expect(output).toContain('[testuser.dev](https://testuser.dev)');
            expect(output).toContain('[@testuser](https://twitter.com/testuser)');
        });

        it('renders stats overview table', () => {
            expect(output).toContain('## GitHub at a Glance');
            expect(output).toContain('Total Stars');
            expect(output).toContain('150 ⭐');
            expect(output).toContain('Forks');
            expect(output).toContain('30 🍴');
            expect(output).toContain('Followers');
            expect(output).toContain('100 👥');
        });

        it('renders technologies with progress bars', () => {
            expect(output).toContain('## Top Technologies');
            expect(output).toContain('`TypeScript');
            expect(output).toContain('█'); // at least some bar
            expect(output).toContain('100%');
        });

        it('renders featured projects', () => {
            expect(output).toContain('## Featured Projects');
            expect(output).toContain('[popular-repo]');
            expect(output).toContain('A very popular repo');
            expect(output).toContain('⭐ 100');
            expect(output).toContain('`test`');
            expect(output).toContain('`awesome`');
        });

        it('renders recent activity', () => {
            expect(output).toContain('## Recent Activity');
            expect(output).toContain('Updated [**popular-repo**]');
            expect(output).toContain('Jan 15, 2024');
        });

        it('renders footer with attribution', () => {
            expect(output).toContain('<div align="center">');
            expect(output).toContain('Generated with');
            expect(output).toContain('gh-profile');
        });
    });

    describe('Edge Cases', () => {
        it('handles missing optional fields gracefully', () => {
            const data = createMockData({
                profile: createMockProfile({
                    bio: null,
                    company: null,
                    blog: null,
                    twitter: null,
                    location: null,
                }),
            });

            const output = showcaseTemplate.render(data);

            expect(output).not.toContain('null');
            expect(output).not.toContain('undefined');
            expect(output).toContain('Hey there 👋 I\'m Test User');
        });

        it('handles empty repos list', () => {
            const data = createMockData({
                repos: [],
                stats: {
                    totalStars: 0,
                    totalForks: 0,
                    topRepos: [],
                    totalRepos: 0,
                    recentRepos: [],
                    languages: [],
                },
            });

            const output = showcaseTemplate.render(data);

            expect(output).not.toContain('## Featured Projects');
            expect(output).not.toContain('## Recent Activity');
            expect(output).not.toContain('## Top Technologies');
        });
    });
});