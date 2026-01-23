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

    /**
     * Optional plugin enable/disable overrides.
     * Keys = plugin IDs, Values = true (enabled) / false (disabled).
     * Missing plugins → use default (usually enabled).
     */
    plugins?: Record<string, boolean>;
}

export interface LoadConfigOptions {
    configPath?: string;
}