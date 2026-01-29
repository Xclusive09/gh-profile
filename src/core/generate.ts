import { logger } from '../cli/logger.js';
import { templateRegistry } from '../templates/index.js';
import { normalize } from './normalize.js';
import { pluginRunner } from '../plugins/runner.js';
import { pluginRegistry } from '../plugins/registry.js';
import type { GitHubData } from '../github/types.js';

export async function generate(
    data: GitHubData,
    templateId: string,
): Promise<string> {
    // Get template
    const template = templateRegistry.get(templateId);
    if (!template) {
        logger.error(`Template '${templateId}' not found`);
        throw new Error(`Template '${templateId}' not found`);
    }

    try {
        // Ensure plugins are initialized before running hooks
        if (!pluginRegistry.isInitialized()) {
            await pluginRegistry.initialize();
        }

        // Normalize data
        let normalizedData = normalize(data);

        // Run beforeRender plugins (deterministic order, isolated context)
        normalizedData = await pluginRunner.runBeforeRender(normalizedData);

        // Generate initial content
        let content = template.render(normalizedData);

        // Run render plugins (deterministic order, isolated context)
        content = await pluginRunner.runRender(normalizedData, content);

        // Run afterRender plugins (deterministic order, isolated context)
        content = await pluginRunner.runAfterRender(normalizedData, content);

        return content;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Failed to generate content: ${message}`);
        throw error;
    }
}