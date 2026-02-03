
/**
 * Maps common user input variations to valid skillicons.dev IDs.
 */
const ICON_MAP: Record<string, string> = {
    // Frameworks
    'next.js': 'nextjs',
    'next': 'nextjs',
    'nest.js': 'nestjs',
    'nest': 'nestjs',
    'vue.js': 'vue',
    'vuejs': 'vue',
    'nuat.js': 'nuxt',  // assuming typo handling or extended map
    'nuxtjs': 'nuxtjs',
    'react.js': 'react',
    'reactjs': 'react',
    'node.js': 'nodejs',
    'node': 'nodejs',
    'express.js': 'express',
    'express': 'express',
    'django': 'django',
    'flask': 'flask',
    'spring': 'spring',
    'laravel': 'laravel',

    // Languages
    'c++': 'cpp',
    'c#': 'cs',
    'dotnet': 'dotnet',
    'golang': 'go',
    'javascript': 'js',
    'typescript': 'ts',
    'python': 'py',

    // Tools & Cloud
    'aws': 'aws',
    'amazon web services': 'aws',
    'gcp': 'gcp',
    'google cloud': 'gcp',
    'azure': 'azure',
    'docker': 'docker',
    'kubernetes': 'kubernetes',
    'k8s': 'kubernetes',
    'git': 'git',
    'github': 'github',
    'linux': 'linux',
    'jenkins': 'jenkins',
    'bash': 'bash',
    'shell': 'bash',
};

/**
 * Sanitizes a list of tools/frameworks to match skillicons.dev supported IDs.
 * Handles:
 * - Parentheses removal (e.g. "aws(ec2)" -> "aws")
 * - Common aliases (e.g. "next.js" -> "nextjs")
 * - Case insensitivity
 */
export function sanitizeTechStack(inputs: string[]): string[] {
    return inputs.map(input => {
        // 1. Lowercase and trim
        let clean = input.toLowerCase().trim();

        // 2. Remove text inside parentheses (e.g. "aws(ec2)" -> "aws")
        clean = clean.replace(/\(.*\)/, '');

        // 3. Trim again after removal
        clean = clean.trim();

        // 4. Map to valid ID if exists, otherwise keep original (best effort)
        return ICON_MAP[clean] || clean;
    }).filter(Boolean); // Remove empty strings
}
