
import type { NormalizedData } from '../core/normalize.js';

/**
 * Plugin metadata interface
 */
export type { NormalizedData } from '../core/normalize.js';

export interface PluginMetadata {
    /** Unique identifier for the plugin */
    id: string;

    /** Human-readable name of the plugin */
    name: string;

    /** Description of what the plugin does */
    description: string;

    /** Plugin version in semver format */
    version: string;

    /** Plugin author */
    author: string;

    /** Optional homepage URL */
    homepage?: string;
}

/**
 * Plugin initialization options
 */
export interface PluginOptions {
    /** Whether the plugin is enabled */
    enabled?: boolean;

    /** Plugin-specific configuration */
    config?: Record<string, unknown>;
}

/**
 * Context object passed to plugin hooks
 */
export interface PluginContext {
    /** Current template rendering data */
    data: NormalizedData;

    /** Current markdown content */
    content: string;

    /** Plugin-specific configuration */
    config: Record<string, unknown>;
}

/**
 * Plugin hook return types
 */
export type HookResult = void | Promise<void>;
export type RenderHookResult = string | Promise<string>;

/**
 * Core plugin interface
 */
export interface Plugin {
    /** Plugin metadata */
    readonly metadata: PluginMetadata;

    /**
     * Initialize the plugin
     * Called when the plugin is first loaded
     */
    init?(options: PluginOptions): HookResult;

    /**
     * Called before template rendering starts
     * Use this to prepare any resources or modify data
     */
    beforeRender?(context: PluginContext): HookResult;

    /**
     * Called during the render phase
     * Can modify or transform the markdown content
     */
    render?(content: string, data: NormalizedData): RenderHookResult;

    /**
     * Called after rendering is complete
     * Use this for cleanup or final content modifications
     */
    afterRender?(content: string, data: NormalizedData): RenderHookResult;
}

/**
 * Plugin error types
 */
export class PluginError extends Error {
    constructor(
        message: string,
        public readonly pluginId: string,
        public readonly phase: 'init' | 'beforeRender' | 'render' | 'afterRender'
    ) {
        super(`Plugin ${pluginId} failed during ${phase}: ${message}`);
        this.name = 'PluginError';
    }
}

/**
 * Valid plugin hook names
 */
export type PluginHook = 'init' | 'beforeRender' | 'render' | 'afterRender';