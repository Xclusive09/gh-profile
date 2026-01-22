import type { Template } from './types.js';
import type { NormalizedData } from '../core/normalize.js';

export function generatePreview(template: Template, data: NormalizedData): string {
    try {
        const output = template.render(data);

        if (typeof output !== 'string') {
            throw new Error('Invalid template output: must be a string');
        }

        return sanitizePreview(output);
    } catch (error) {
        throw new Error(`Failed to generate preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

function sanitizePreview(content: string): string {
    // List of sensitive fields to redact
    const sensitiveFields = [
        'email',
        'location',
        'phone',
        'address',
        'private'
    ];

    // Replace sensitive information with placeholder
    let sanitized = content;
    sensitiveFields.forEach(field => {
        const regex = new RegExp(`${field}:.*$`, 'gim');
        sanitized = sanitized.replace(regex, `${field}: [REDACTED]`);
    });

    // Additionally, sanitize email addresses that appear without labels
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    sanitized = sanitized.replace(emailRegex, '[REDACTED]');

    return sanitized;
}