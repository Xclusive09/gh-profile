import { describe, it, expect } from 'vitest';
import { templateRegistry, getTemplate, getAllTemplates } from '../src/templates/index.js';
import type { Template, GitHubData } from '../src/templates/types.js';
import type { GitHubUser, GitHubRepo } from '../src/github/types.js';

// Reuse mock data setup to avoid redundancy with template.test.ts
const createMockGitHubUser = (overrides: Partial<GitHubUser> = {}): GitHubUser => ({
    login: 'testuser',
    id: 123,
    avatar_url: 'https://example.com/avatar.png',
    html_url: 'https://github.com/testuser',
    name: 'Test User',
    company: 'Test Co',
    blog: 'https://test.com',
    location: 'Test City',
    email: 'test@test.com',
    bio: 'A test user',
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
    description: 'A test repo',
    fork: false,
    created_at: '2021-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    pushed_at: '2024-01-15T00:00:00Z',
    homepage: 'https://test-repo.com',
    size: 1000,
    stargazers_count: 50,
    watchers_count: 50,
    language: 'TypeScript',
    forks_count: 10,
    open_issues_count: 5,
    default_branch: 'main',
    topics: ['test', 'typescript'],
    visibility: 'public',
    archived: false,
    ...overrides,
});

const createMockGitHubData = (overrides: Partial<GitHubData> = {}): GitHubData => ({
    user: createMockGitHubUser(),
    repos: [createMockGitHubRepo()],
    ...overrides,
});

describe('TemplateRegistry', () => {
    describe('Built-in Templates', () => {
        it('should have default template registered', () => {
            const template = getTemplate('default');
            expect(template).toBeDefined();
        });

        it('should have correct metadata for default template', () => {
            const template = getTemplate('default');
            expect(template?.metadata).toMatchObject({
                id: 'default',
                name: 'Default',
                category: 'minimal',
                version: '1.0.0',
            });
        });
    });

    describe('Registry Methods', () => {
        it('should get template by id', () => {
            const template = getTemplate('default');
            expect(template).toBeDefined();
            expect(template?.metadata.id).toBe('default');
        });

        it('should return undefined for non-existent template', () => {
            const template = getTemplate('nonexistent');
            expect(template).toBeUndefined();
        });

        it('should list all templates', () => {
            const all = getAllTemplates();
            expect(all.length).toBeGreaterThan(0);
            expect(all.some(t => t.metadata.id === 'default')).toBe(true);
        });

        it('should get built-in templates only', () => {
            const builtIn = templateRegistry.getBuiltIn();
            expect(builtIn.length).toBeGreaterThan(0);
            expect(builtIn.every(t => t.metadata.id === 'default')).toBe(true);
        });

        it('should filter templates by category', () => {
            const minimal = templateRegistry.getByCategory('minimal');
            expect(minimal.length).toBeGreaterThan(0);
            expect(minimal.every(t => t.metadata.category === 'minimal')).toBe(true);
        });

        it('should list metadata for CLI display', () => {
            const metadata = templateRegistry.listMetadata();
            expect(metadata.length).toBeGreaterThan(0);

            const defaultMeta = metadata.find(m => m.id === 'default');
            expect(defaultMeta).toMatchObject({
                id: expect.any(String),
                name: expect.any(String),
                description: expect.any(String),
                category: expect.any(String),
                version: expect.any(String),
            });
        });

        it('should check if template exists', () => {
            expect(templateRegistry.has('default')).toBe(true);
            expect(templateRegistry.has('nonexistent')).toBe(false);
        });

        it('should throw error when registering duplicate template', () => {
            const duplicateTemplate: Template = {
                metadata: {
                    id: 'default',
                    name: 'Duplicate',
                    description: 'This should fail',
                    category: 'minimal',
                    version: '1.0.0',
                },
                render: () => 'duplicate',
            };

            expect(() => {
                templateRegistry.register(duplicateTemplate);
            }).toThrow("Template with id 'default' is already registered");
        });
    });

    describe('Template Rendering', () => {
        it('should render default template with valid GitHub data', () => {
            const template = getTemplate('default');
            const data = createMockGitHubData();

            const output = template?.render(data);

            expect(output).toBeDefined();
            expect(typeof output).toBe('string');
            expect(output).toContain('Test User');
        });

        it('should render template with minimal GitHub data', () => {
            const template = getTemplate('default');
            const data = createMockGitHubData({
                user: createMockGitHubUser({
                    name: null,
                    bio: null,
                    location: null,
                }),
                repos: [],
            });

            const output = template?.render(data);

            expect(output).toBeDefined();
            expect(output).toContain('testuser');
            expect(output).not.toContain('null');
            expect(output).not.toContain('undefined');
        });

        it('should render template with multiple repos', () => {
            const template = getTemplate('default');
            const data = createMockGitHubData({
                repos: [
                    createMockGitHubRepo({ name: 'repo-1', stargazers_count: 100 }),
                    createMockGitHubRepo({ name: 'repo-2', stargazers_count: 50 }),
                    createMockGitHubRepo({ name: 'repo-3', stargazers_count: 25 }),
                ],
            });

            const output = template?.render(data);

            expect(output).toContain('repo-1');
            expect(output).toContain('repo-2');
            expect(output).toContain('repo-3');
        });

        it('should produce consistent output for same input', () => {
            const template = getTemplate('default');
            const data = createMockGitHubData();

            const output1 = template?.render(data);
            const output2 = template?.render(data);

            expect(output1).toBe(output2);
        });
    });

    describe('Template System Contract', () => {
        it('all templates should have required metadata fields', () => {
            getAllTemplates().forEach(template => {
                expect(template.metadata).toHaveProperty('id');
                expect(template.metadata).toHaveProperty('name');
                expect(template.metadata).toHaveProperty('description');
                expect(template.metadata).toHaveProperty('category');
                expect(template.metadata).toHaveProperty('version');
                expect(typeof template.metadata.id).toBe('string');
                expect(typeof template.metadata.name).toBe('string');
                expect(typeof template.metadata.version).toBe('string');
            });
        });

        it('all templates should have a render function', () => {
            getAllTemplates().forEach(template => {
                expect(typeof template.render).toBe('function');
            });
        });

        it('render function should accept GitHubData and return string', () => {
            const template = getTemplate('default');
            const data = createMockGitHubData();

            expect(template?.render).toBeDefined();
            const result = template?.render(data);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });
});