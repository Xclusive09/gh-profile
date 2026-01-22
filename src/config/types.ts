export interface Config {
    template: string;
    output: string;
    templatesPath?: string;
    github: {
        includePrivate: boolean;
        excludeRepos: string[];
        pinnedRepos: string[];
    };
    customize: {
        showLanguages: boolean;
        showStats: boolean;
        showSocial: boolean;
        sections: string[];
    };
}

export interface LoadConfigOptions {
    configPath?: string;
}