import type { NormalizedData } from '../core/normalize.js';

/**
 * Plugin metadata interface
 */
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
 * Lifecycle hooks that every plugin can implement
 * Strictly typed interfaces for each hook phase
 */
export interface PluginLifecycleHooks {
    /**
     * Initialize the plugin
     * Called when the plugin is first loaded
     * @param options Plugin initialization options
     */
    init?(options: PluginOptions): HookResult;

    /**
     * Called before template rendering starts
     * Use this to prepare any resources or modify data
     * @param context Plugin context with data and content
     */
    beforeRender?(context: PluginContext): HookResult;

    /**
     * Called during the render phase
     * Can modify or transform the markdown content
     * @param content Current markdown content
     * @param data Normalized template data
     * @returns Transformed content
     */
    render?(content: string, data: NormalizedData): RenderHookResult;

    /**
     * Called after rendering is complete
     * Use this for cleanup or final content modifications
     * @param content Current markdown content
     * @param data Normalized template data
     * @returns Final content
     */
    afterRender?(content: string, data: NormalizedData): RenderHookResult;
}

/**
 * Core plugin interface - combines metadata with lifecycle hooks
 * This defines what a plugin IS in the system
 */
export interface Plugin extends PluginLifecycleHooks {
    /** Plugin metadata - required for all plugins */
    readonly metadata: PluginMetadata;
}

/**
 * Type guard to check if an object is a valid plugin
 * Enforces the contract at runtime
 */
export function isPlugin(obj: unknown): obj is Plugin {
    if (!obj || typeof obj !== 'object') return false;

    const plugin = obj as Plugin;
    return (
        typeof plugin.metadata === 'object' &&
        typeof plugin.metadata?.id === 'string' &&
        typeof plugin.metadata?.name === 'string' &&
        typeof plugin.metadata?.description === 'string' &&
        typeof plugin.metadata?.version === 'string' &&
        typeof plugin.metadata?.author === 'string' &&
        // At least one lifecycle hook should be implemented
        (
            typeof plugin.init === 'function' ||
            typeof plugin.beforeRender === 'function' ||
            typeof plugin.render === 'function' ||
            typeof plugin.afterRender === 'function'
        )
    );
}

/**
 * Plugin error types
 */
export class PluginError extends Error {
    constructor(
        message: string,
        public readonly pluginId: string,
        public readonly phase: PluginHook
    ) {
        super(`Plugin ${pluginId} failed during ${phase}: ${message}`);
        this.name = 'PluginError';
    }
}

/**
 * Valid plugin hook names
 * Used for strict type checking in plugin execution
 */
export type PluginHook = 'init' | 'beforeRender' | 'render' | 'afterRender';

/**
 * Utility type to extract the return type of a specific hook
 */
export type HookReturnType<T extends PluginHook> =
    T extends 'init' | 'beforeRender' ? HookResult :
        T extends 'render' | 'afterRender' ? RenderHookResult :
            never;

/**
 * Plugin registration record
 * Used by the plugin registry to track loaded plugins
 */
export interface PluginRegistration {
    plugin: Plugin;
    options: PluginOptions;
    enabled: boolean;
}

/**
 * Plugin execution context with additional metadata
 */
export interface PluginExecutionContext extends PluginContext {
    /** The plugin being executed */
    plugin: Plugin;
    /** Current hook being executed */
    hook: PluginHook;
}