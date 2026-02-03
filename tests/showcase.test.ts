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
                name: 'Project Showcase',
                description: 'High-impact, premium showcase for professional developers',
                category: 'developer',
                version: '1.0.0',
            });
        });
    });

    describe('Content Sections', () => {
        const data = createMockData();
        const output = showcaseTemplate.render(data);

        it('renders centered header with name', () => {
            expect(output).toContain('<div align="center">');
            expect(output).toContain('<h1>Test User</h1>');
            expect(output).toContain('<p align="center"><strong>A passionate developer</strong></p>');
        });

        it('renders connect section with profile fields', () => {
            expect(output).toContain('<h3>Social Connections</h3>');
            expect(output).toContain('img src="https://img.shields.io/badge/Location-San%20Francisco-0f172a');
            expect(output).toContain('img src="https://img.shields.io/badge/Portfolio-0f172a');
            expect(output).toContain('img src="https://img.shields.io/badge/Twitter-0f172a');
        });

        it('renders stats and stable badges', () => {
            expect(output).toContain('img src="https://img.shields.io/badge/Stars-150-f59e0b');
            expect(output).toContain('img src="https://img.shields.io/badge/Followers-100-0ea5e9');
            expect(output).toContain('img src="https://komarev.com/ghpvc/?username=testuser&label=PROFILE+VIEWS');

            // Performance Text Fallback
            expect(output).toContain('| Repos | Stars | Forks | Commits |');
            expect(output).toContain('| 25 | 150 | 30 |');
        });

        it('renders technologies', () => {
            expect(output).toContain('<h3>Tech Stack</h3>');
            expect(output).toContain('skillicons.dev/icons?i=ts');
            expect(output).toContain('langs_count=10');
        });

        it('renders featured projects', () => {
            expect(output).toContain('<h3>Featured Projects</h3>');
            expect(output).toContain('github-readme-stats-one.vercel.app/api/pin/?username=testuser');
            expect(output).toContain('repo=popular-repo');
        });

        // Recent activity removed in v1.0.0 showcase

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
            expect(output).toContain('<h1>Test User</h1>');
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

            expect(output).not.toContain('<h3>Featured Projects</h3>');
            expect(output).not.toContain('<h3>Tech Stack</h3>');
        });
    });
});