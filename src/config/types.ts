export interface Config {
    template?: string;
    output?: string;
    token?: string;
    force?: boolean;
}

export interface LoadConfigOptions {
    configPath?: string;
}