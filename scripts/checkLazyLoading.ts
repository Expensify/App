#!/usr/bin/env ts-node

/**
 * Script to check if icons and illustrations are using lazy loading
 * This script scans the codebase for direct imports from deprecated eager loading files
 * and provides detailed feedback about violations.
 */
import fs from 'fs';
import {glob} from 'glob';

const DEPRECATED_IMPORTS = {
    ILLUSTRATIONS: '@components/Icon/Illustrations',
    EXPENSICONS: '@components/Icon/Expensicons',
} as const;

const LAZY_LOADING_HOOKS = {
    ILLUSTRATIONS: 'useMemoizedLazyIllustrations',
    EXPENSIFY_ICONS: 'useMemoizedLazyExpensifyIcons',
} as const;

type Violation = {
    file: string;
    line: number;
    content: string;
    type: 'illustration' | 'expensicon';
    suggestedFix: string;
};

type ImportCheckConfig = {
    deprecatedImport: string;
    type: 'illustration' | 'expensicon';
    hookName: string;
};

const IMPORT_CHECKS: ImportCheckConfig[] = [
    {
        deprecatedImport: DEPRECATED_IMPORTS.ILLUSTRATIONS,
        type: 'illustration',
        hookName: LAZY_LOADING_HOOKS.ILLUSTRATIONS,
    },
    {
        deprecatedImport: DEPRECATED_IMPORTS.EXPENSICONS,
        type: 'expensicon',
        hookName: LAZY_LOADING_HOOKS.EXPENSIFY_ICONS,
    },
];

function hasDeprecatedImport(line: string, deprecatedImport: string): boolean {
    const trimmedLine = line.trim();
    return (
        (trimmedLine.includes(`from '${deprecatedImport}'`) || trimmedLine.includes(`from "${deprecatedImport}"`)) && !trimmedLine.startsWith('//') // Skip comments
    );
}
function checkFile(filePath: string): Violation[] {
    const violations: Violation[] = [];

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        for (const [index, line] of lines.entries()) {
            const lineNumber = index + 1;

            for (const check of IMPORT_CHECKS) {
                if (hasDeprecatedImport(line, check.deprecatedImport)) {
                    violations.push({
                        file: filePath,
                        line: lineNumber,
                        content: line.trim(),
                        type: check.type,
                        suggestedFix: `Use ${check.hookName} hook from @hooks/useLazyAsset instead`,
                    });
                }
            }
        }
    } catch (error) {
        console.warn(`⚠️  Warning: Could not read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }

    return violations;
}

async function main() {
    const allViolations: Violation[] = [];
    const excludePatterns = [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/__mocks__/**',
        '**/vendor/**',
        '**/Mobile-Expensify/**',
        '**/modules/**',
        '**/chunks/**', // Allow imports in chunk files themselves
        '**/*.config.js',
        '**/*.config.mjs',
        '**/eslint.config.mjs', // ESLint config itself might reference these for the rule
    ];

    // Find all TypeScript files in src directory
    const files = await glob('src/**/*.{ts,tsx}', {
        ignore: excludePatterns,
    });

    console.log(`Checking ${files.length} files for lazy loading violations...\n`);

    for (const file of files) {
        const violations = checkFile(file);
        allViolations.push(...violations);
    }

    if (allViolations.length === 0) {
        console.log('✅ No lazy loading violations found! All icons and illustrations are using lazy loading.');
        process.exit(0);
    }

    // Group violations by file
    const violationsByFile = new Map<string, Violation[]>();
    for (const violation of allViolations) {
        const existing = violationsByFile.get(violation.file) ?? [];
        existing.push(violation);
        violationsByFile.set(violation.file, existing);
    }

    for (const [file, violations] of violationsByFile.entries()) {
        console.error(`\n📄 ${file}`);
        for (const violation of violations) {
            const iconType = violation.type === 'illustration' ? 'Illustration' : 'Expensify Icon';
            console.error(`   Line ${violation.line}: ${iconType} import detected`);
            console.error(`   ❌ ${violation.content}`);
            console.error(`   ✅ ${violation.suggestedFix}`);
        }
    }

    console.error(`\n❌ Found ${allViolations.length} lazy loading violation(s) in ${violationsByFile.size} file(s):\n`);
    console.error(`\n\n💡 For migration help, see: docs/LAZY_ICONS_AND_ILLUSTRATIONS.md`);

    process.exit(1);
}

main().catch((error) => {
    console.error('Error running lazy loading check:', error);
    process.exit(1);
});
