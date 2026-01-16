import { describe, it, expect } from 'vitest';
import { statsHeavyTemplate } from '../src/templates/stats-heavy.js';
import type { NormalizedData, Profile, Repository } from '../src/core/models.js';

// ── Test Factories ───────────────────────────────────────────────────────

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

// Default happy-path data (used by most tests)
function createDefaultData(): NormalizedData {
    const repos = [
        createMockRepo({ language: 'TypeScript', stars: 100 }),
        createMockRepo({ language: 'JavaScript', stars: 50 }),
        createMockRepo({ language: 'Python', stars: 25 }),
    ];

    return {
        profile: createMockProfile(),
        repos,
        stats: {
            totalStars: 175,
            totalForks: 30,
            totalRepos: repos.length,
            languages: [
                { name: 'TypeScript', count: 1, percentage: 33 },
                { name: 'JavaScript', count: 1, percentage: 33 },
                { name: 'Python', count: 1, percentage: 33 },
            ],
            topRepos: repos,
            recentRepos: repos,
        },
    };
}

describe('statsHeavyTemplate', () => {
    describe('Metadata', () => {
        it('should have correct metadata', () => {
            expect(statsHeavyTemplate.metadata).toMatchObject({
                id: 'stats-heavy',
                name: 'Stats Heavy',
                category: 'stats-heavy',
            });
        });
    });

    describe('Content Sections', () => {
        const defaultData = createDefaultData();
        const defaultOutput = statsHeavyTemplate.render(defaultData);

        it('should render account metrics', () => {
            expect(defaultOutput).toContain('## Account Metrics');
            expect(defaultOutput).toContain('Account Age | 6 years');
            expect(defaultOutput).toContain('Followers | 100');
            expect(defaultOutput).toContain('Following | 50');
        });

        it('should render repository analytics', () => {
            expect(defaultOutput).toContain('## Repository Analytics');
            expect(defaultOutput).toContain('Total Stars | 175');
            expect(defaultOutput).toContain('Total Forks | 30');
        });

        it('should render language distribution', () => {
            expect(defaultOutput).toContain('## Language Distribution');
            expect(defaultOutput).toContain('TypeScript');
            expect(defaultOutput).toContain('JavaScript');
            expect(defaultOutput).toContain('Python');
        });

        it('should render repository timeline with multiple years', () => {
            // ── Special data just for timeline test ─────────────────────────
            const timelineRepos = [
                createMockRepo({
                    name: 'repo-2021',
                    createdAt: new Date('2021-06-12'),
                    stars: 100,
                    language: 'TypeScript'
                }),
                createMockRepo({
                    name: 'repo-2023',
                    createdAt: new Date('2023-11-05'),
                    stars: 60,
                    language: 'JavaScript'
                }),
                createMockRepo({
                    name: 'repo-2024',
                    createdAt: new Date('2024-09-28'),
                    stars: 40,
                    language: 'Python'
                }),
            ];

            const timelineData: NormalizedData = {
                profile: createMockProfile(),
                repos: timelineRepos,
                stats: {
                    totalStars: 200,
                    totalForks: 30,
                    totalRepos: 3,
                    languages: [
                        { name: 'TypeScript', count: 1, percentage: 33 },
                        { name: 'JavaScript', count: 1, percentage: 33 },
                        { name: 'Python', count: 1, percentage: 33 },
                    ],
                    topRepos: timelineRepos,
                    recentRepos: timelineRepos,
                },
            };

            const output = statsHeavyTemplate.render(timelineData);

            expect(output).toContain('## Repository Timeline');
            expect(output).toContain('| 2024 |');
            expect(output).toContain('| 2023 |');
            expect(output).toContain('| 2021 |');
        });

        it('should render top performing repositories', () => {
            expect(defaultOutput).toContain('## Top Performing Repositories');
            expect(defaultOutput).toContain('Stars | Forks | Issues |');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty repository list', () => {
            const data = { ...createDefaultData(), repos: [], stats: { ...createDefaultData().stats, totalStars: 0, totalForks: 0, totalRepos: 0 } };
            const output = statsHeavyTemplate.render(data);

            expect(output).not.toContain('null');
            expect(output).not.toContain('NaN');
            expect(output).toContain('Total Stars | 0');
        });

        it('should handle repositories without language', () => {
            const data = createDefaultData();
            data.repos = [createMockRepo({ language: null })];

            const output = statsHeavyTemplate.render(data);

            expect(output).not.toContain('null');
            expect(output).toContain('## Language Distribution');
        });

        it('should handle zero followers/following', () => {
            const data = createDefaultData();
            data.profile = createMockProfile({ followers: 0, following: 0 });

            const output = statsHeavyTemplate.render(data);

            expect(output).toContain('Followers | 0');
            expect(output).toContain('Following | 0');
            expect(output).not.toContain('NaN');
        });
    });
});