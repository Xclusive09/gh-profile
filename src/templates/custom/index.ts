import type { NormalizedData } from '../../core/normalize.js';

export default function render(data: NormalizedData): string {
    return `# ${data.profile.name}
${data.profile.bio}`;
}