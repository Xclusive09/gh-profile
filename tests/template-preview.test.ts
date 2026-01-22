import { describe, it, expect, beforeEach } from 'vitest';
import type { NormalizedData, Profile, Repository } from '../src/core/models.js';
import { generatePreview } from '../src/templates/preview.js';
import type { TemplateCategory } from '../src/templates/types.js';

// Mock data factory functions
function createMockProfile(overrides: Partial<Profile> = {}): Profile {
    return {
        username: 'testuser',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
        profileUrl: 'https://github.com/testuser',
        bio: 'A test user bio',
        company: 'Test Company',
        location: 'Test Location',
        blog: 'https://test.blog',
        twitter: 'testtwitter',
        email: 'test@example.com',
        followers: 100,
        following: 50,
        publicRepos: 10,
        createdAt: new Date('2020-01-01'),
        ...overrides
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
        watchers: 20,
        issues: 5,
        topics: ['test'],
        homepage: null,
        isFork: false,
        isArchived: false,
        createdAt: new Date('2021-01-01'),
        updatedAt: new Date('2024-01-01'),
        pushedAt: new Date('2024-01-15'),
        ...overrides
    };
}

describe('Template Preview System', () => {
    let mockData: NormalizedData;

    beforeEach(() => {
        // Create consistent mock data for each test
        mockData = {
            profile: createMockProfile(),
            repos: [
                createMockRepo({ stars: 100, name: 'popular-repo' }),
                createMockRepo({ stars: 50, name: 'medium-repo' }),
                createMockRepo({ stars: 10, name: 'small-repo' })
            ],
            stats: {
                totalStars: 160,
                totalForks: 30,
                totalRepos: 3,
                languages: [
                    { name: 'TypeScript', count: 3, percentage: 100 }
                ],
                topRepos: [],
                recentRepos: []
            }
        };
    });

    describe('Output Determinism', () => {
        it('maintains consistent ordering of dynamic elements', () => {
            const template = {
                metadata: {
                    id: 'test',
                    name: 'Test Template',
                    description: 'A test template',
                    category: 'generic' as TemplateCategory,
                    version: '1.0.0',
                },
                render: (data: NormalizedData) => {
                    // Sort by stars to ensure consistent ordering
                    return data.repos
                        .sort((a, b) => b.stars - a.stars)
                        .map(r => r.name)
                        .join('\n');
                }
            };

            const firstRender = generatePreview(template, mockData);
            const secondRender = generatePreview(template, mockData);

            expect(firstRender).toBe(secondRender);
            expect(firstRender).toBe('popular-repo\nmedium-repo\nsmall-repo');
        });

        it('preserves markdown formatting while sanitizing', () => {
            const template = {
                metadata: {
                    id: 'test',
                    name: 'Test Template',
                    description: 'A test template',
                    category: 'generic' as TemplateCategory,                    version: '1.0.0'
                },
                render: () => {
                    return `# Header\n## Subheader\n### Another header`;
                }
            };

            const result = generatePreview(template, mockData);

            expect(result).toMatch(/# Header/);
            expect(result).toMatch(/## Subheader/);
            expect(result).toMatch(/### Another header/);
        });
    });

    describe('Preview Sanitization', () => {
        it('removes sensitive information from preview', () => {
            const template = {
                metadata: {
                    id: 'test',
                    name: 'Test Template',
                    description: 'A test template',
                    category: 'generic' as TemplateCategory,                    version: '1.0.0'
                },
                render: (data: NormalizedData) => {
                    return `Email: ${data.profile.email}\nLocation: ${data.profile.location}`;
                }
            };

            const result = generatePreview(template, mockData);

            expect(result).not.toContain(mockData.profile.email);
            expect(result).not.toContain(mockData.profile.location);
        });

        it('preserves markdown formatting while sanitizing', () => {
            const template = {
                metadata: {
                    id: 'test',
                    name: 'Test Template',
                    description: 'A test template',
                    category: 'generic' as TemplateCategory,                    version: '1.0.0'
                },
                render: (data: NormalizedData) => {
                    return `# Header\n## ${data.profile.email}\n### Subheader`;
                }
            };

            const result = generatePreview(template, mockData);

            expect(result).toMatch(/# Header/);
            expect(result).toMatch(/### Subheader/);
            expect(result).not.toContain(mockData.profile.email);
        });
    });

    describe('Error Handling', () => {
        it('handles template render errors gracefully', () => {
            const template = {
                metadata: {
                    id: 'test',
                    name: 'Test Template',
                    description: 'A test template',
                    category: 'generic' as TemplateCategory,                    version: '1.0.0'
                },
                render: () => {
                    throw new Error('Template error');
                }
            };

            expect(() => {
                generatePreview(template, mockData);
            }).toThrow(/failed to generate preview/i);
        });

        it('validates preview output is a string', () => {
            const template = {
                metadata: {
                    id: 'test',
                    name: 'Test Template',
                    description: 'A test template',
                    category: 'generic' as TemplateCategory,                    version: '1.0.0'
                },
                render: () => {
                    return { invalid: 'output' } as never;
                }
            };

            expect(() => {
                generatePreview(template, mockData);
            }).toThrow(/invalid template output/i);
        });
    });
});