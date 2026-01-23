
import { logger } from '../cli/logger.js';
import { templateRegistry } from '../templates/index.js';
import { normalize } from './normalize.js';
import { pluginRunner } from '../plugins/runner.js';
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
        // Normalize data
        let normalizedData = normalize(data);

        // Run beforeRender plugins
        normalizedData = await pluginRunner.runBeforeRender(normalizedData);

        // Generate initial content
        let content = template.render(normalizedData);

        // Run render plugins
        content = await pluginRunner.runRender(normalizedData, content);

        // Run afterRender plugins
        content = await pluginRunner.runAfterRender(normalizedData, content);

        return content;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Failed to generate content: ${message}`);
        throw error;
    }
}