#!/usr/bin/env ts-node

/**
 * React Compiler Development Tool
 *
 * A companion tool for local development that provides quick checks
 * and insights about React Compiler compatibility.
 */
import {execSync} from 'child_process';
import {existsSync, readFileSync} from 'fs';
import {join, relative} from 'path';
import ReactCompilerTracker, {shouldProcessFile} from './react-compiler-tracker';

type ReactCompilerConfig = {
    excludedFolderPatterns: string[];
    checkedFileEndings: string[];
};

// Load React Compiler configuration from shared config file
const reactCompilerConfig = JSON.parse(readFileSync(join(process.cwd(), 'react-compiler-config.json'), 'utf8')) as ReactCompilerConfig;

type ComponentInfo = {
    name: string;
    file: string;
    canCompile: boolean;
    lastChecked: string;
    isHook: boolean;
};

type ReactCompilerUsageInfo = {
    line: number;
    content: string;
};

class ReactCompilerDevTool {
    private tracker: ReactCompilerTracker;

    constructor() {
        this.tracker = new ReactCompilerTracker();
    }

    private getComponentInfo(filePath: string): ComponentInfo | null {
        try {
            const content = readFileSync(filePath, 'utf8');

            // Look for component definitions
            const componentRegex = /(?:export\s+)?(?:const|function|class)\s+([A-Z][a-zA-Z0-9]*)/g;
            const hookRegex = /(?:export\s+)?(?:const|function)\s+(use[A-Z][a-zA-Z0-9]*)/g;

            let match;
            const components: string[] = [];
            const hooks: string[] = [];

            match = componentRegex.exec(content);
            while (match !== null) {
                components.push(match[1]);
                match = componentRegex.exec(content);
            }

            match = hookRegex.exec(content);
            while (match !== null) {
                hooks.push(match[1]);
                match = hookRegex.exec(content);
            }

            const allIdentifiers = [...components, ...hooks];
            if (allIdentifiers.length === 0) {
                return null;
            }

            // For now, we'll use the first component/hook found
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const identifier = allIdentifiers.at(0)!;
            const isHook = identifier.startsWith('use');

            return {
                name: identifier,
                file: filePath,
                canCompile: false, // Will be updated by tracker
                lastChecked: '',
                isHook,
            };
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
            return null;
        }
    }

    private findReactFiles(directory = 'src'): string[] {
        try {
            const fileExtensions = reactCompilerConfig.checkedFileEndings.map((ending) => `-name "*${ending}"`).join(' -o ');
            const output = execSync(`find ${directory} ${fileExtensions}`, {
                encoding: 'utf8',
            });
            return output
                .trim()
                .split('\n')
                .filter((file) => file.length > 0)
                .filter((file) => shouldProcessFile(file));
        } catch (error) {
            console.error('Error finding React files:', error);
            return [];
        }
    }

    public quickCheck(filePath?: string): void {
        console.log('🔍 React Compiler Quick Check\n');

        if (filePath) {
            // Check specific file
            const fullPath = join(process.cwd(), filePath);
            if (!existsSync(fullPath)) {
                console.error(`❌ File not found: ${filePath}`);
                return;
            }

            // Check if file should be processed by React Compiler
            if (!shouldProcessFile(filePath)) {
                console.log(`⚠️  ${filePath} is not processed by React Compiler (excluded by babel config)`);
                console.log('💡 This file is excluded from React Compiler processing based on babel configuration.');
                return;
            }

            const componentInfo = this.getComponentInfo(fullPath);
            if (!componentInfo) {
                console.log(`⚠️  No React components found in ${filePath}`);
                return;
            }

            console.log(`📄 Checking: ${filePath}`);
            console.log(`🏷️  Component: ${componentInfo.name} (${componentInfo.isHook ? 'hook' : 'component'})`);

            const canCompile = this.tracker.checkSpecificFile(filePath);

            if (canCompile) {
                console.log('✅ This component can be compiled by React Compiler!');
                console.log('💡 You can remove manual memoization (React.memo, useMemo, useCallback) if present.');
            } else {
                console.log('❌ This component cannot be compiled by React Compiler.');
                console.log('🔧 Consider adding manual memoization or fixing Rules of React violations.');

                // Show detailed failure reason if available
                const failureInfo = this.tracker.getDetailedFailureInfo(filePath);
                if (failureInfo?.reason) {
                    const location = failureInfo.line && failureInfo.column ? `:${failureInfo.line}:${failureInfo.column}` : '';
                    console.log(`\n📋 Detailed failure information:`);
                    console.log(`   File: ${failureInfo.file}${location}`);
                    console.log(`   Reason: ${failureInfo.reason}`);
                } else {
                    console.log('📖 Run `npm run react-compiler-tracker report` for detailed error information.');
                }
            }
        } else {
            // Check current directory or common locations
            const currentDir = process.cwd();
            const reactFiles = this.findReactFiles();

            if (reactFiles.length === 0) {
                console.log('⚠️  No React files found in src directory');
                return;
            }

            console.log(`📁 Found ${reactFiles.length} React files\n`);

            // Show a few examples
            const examples = reactFiles.slice(0, 5);
            for (const file of examples) {
                const componentInfo = this.getComponentInfo(file);
                if (componentInfo) {
                    const relativePath = relative(currentDir, file);
                    console.log(`📄 ${relativePath}`);
                    console.log(`   🏷️  ${componentInfo.name} (${componentInfo.isHook ? 'hook' : 'component'})`);
                }
            }

            if (reactFiles.length > 5) {
                console.log(`   ... and ${reactFiles.length - 5} more files`);
            }

            console.log('\n💡 Use `npm run react-compiler-tracker check-file <path>` to check a specific file');
        }
    }

    public analyzeDirectory(directory = 'src'): void {
        console.log(`🔍 Analyzing React Compiler compatibility in ${directory}/\n`);

        const reactFiles = this.findReactFiles(directory);
        if (reactFiles.length === 0) {
            console.log('⚠️  No React files found');
            return;
        }

        console.log(`📊 Found ${reactFiles.length} React files\n`);

        const results = this.tracker.runDetailedCompilerHealthcheck();
        const currentDir = process.cwd();

        let compilableCount = 0;
        let nonCompilableCount = 0;
        const nonCompilableFiles: string[] = [];

        for (const file of reactFiles) {
            const relativePath = relative(currentDir, file);
            const canCompile = results.success.includes(relativePath);

            if (canCompile) {
                compilableCount++;
            } else {
                nonCompilableCount++;
                nonCompilableFiles.push(relativePath);
            }
        }

        console.log(`✅ Compilable: ${compilableCount} files`);
        console.log(`❌ Non-compilable: ${nonCompilableCount} files`);

        if (nonCompilableFiles.length > 0) {
            console.log('\n❌ Non-compilable files:');
            nonCompilableFiles.slice(0, 10).forEach((file) => {
                console.log(`  - ${file}`);
            });

            if (nonCompilableFiles.length > 10) {
                console.log(`  ... and ${nonCompilableFiles.length - 10} more files`);
            }
        }

        const percentage = Math.round((compilableCount / reactFiles.length) * 100);
        console.log(`\n📈 Compiler compatibility: ${percentage}%`);

        if (percentage < 80) {
            console.log('⚠️  Consider improving React Compiler compatibility for better performance');
        } else if (percentage === 100) {
            console.log('🎉 Perfect! All components are React Compiler compatible!');
        }
    }

    public suggestOptimizations(filePath: string): void {
        console.log(`💡 Optimization suggestions for ${filePath}\n`);

        const fullPath = join(process.cwd(), filePath);
        if (!existsSync(fullPath)) {
            console.error(`❌ File not found: ${filePath}`);
            return;
        }

        // Check if file should be processed by React Compiler
        if (!shouldProcessFile(filePath)) {
            console.log(`⚠️  ${filePath} is not processed by React Compiler (excluded by babel config)`);
            console.log('💡 This file is excluded from React Compiler processing based on babel configuration.');
            return;
        }

        const content = readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        // Look for manual memoization that might be unnecessary

        const memoUsage: ReactCompilerUsageInfo[] = [];
        const useMemoUsage: ReactCompilerUsageInfo[] = [];
        const useCallbackUsage: ReactCompilerUsageInfo[] = [];

        lines.forEach((line, index) => {
            if (line.includes('React.memo') || line.includes('memo(')) {
                memoUsage.push({line: index + 1, content: line.trim()});
            }
            if (line.includes('useMemo(')) {
                useMemoUsage.push({line: index + 1, content: line.trim()});
            }
            if (line.includes('useCallback(')) {
                useCallbackUsage.push({line: index + 1, content: line.trim()});
            }
        });

        const canCompile = this.tracker.checkSpecificFile(filePath);

        if (canCompile) {
            console.log('✅ This component can be compiled by React Compiler!');

            if (memoUsage.length > 0 || useMemoUsage.length > 0 || useCallbackUsage.length > 0) {
                console.log('\n💡 Optimization suggestions:');
                console.log('Since React Compiler can optimize this component, you may be able to remove manual memoization:');

                if (memoUsage.length > 0) {
                    console.log('\n🔧 Consider removing React.memo:');
                    memoUsage.forEach((usage) => {
                        console.log(`  Line ${usage.line}: ${usage.content}`);
                    });
                }

                if (useMemoUsage.length > 0) {
                    console.log('\n🔧 Consider removing useMemo:');
                    useMemoUsage.forEach((usage) => {
                        console.log(`  Line ${usage.line}: ${usage.content}`);
                    });
                }

                if (useCallbackUsage.length > 0) {
                    console.log('\n🔧 Consider removing useCallback:');
                    useCallbackUsage.forEach((usage) => {
                        console.log(`  Line ${usage.line}: ${usage.content}`);
                    });
                }

                console.log('\n⚠️  Always test performance after removing manual memoization!');
            } else {
                console.log('🎉 No manual memoization found - React Compiler will handle optimization automatically!');
            }
        } else {
            console.log('❌ This component cannot be compiled by React Compiler.');
            console.log('🔧 Manual memoization may be beneficial for performance.');

            if (memoUsage.length === 0 && useMemoUsage.length === 0 && useCallbackUsage.length === 0) {
                console.log('\n💡 Consider adding manual memoization:');
                console.log('  - React.memo() for component memoization');
                console.log('  - useMemo() for expensive calculations');
                console.log('  - useCallback() for function memoization');
            }
        }
    }

    public showHelp(): void {
        console.log(`
🔧 React Compiler Development Tool

This tool helps you understand React Compiler compatibility during development.

Usage:
  npm run react-compiler-dev-tool <command> [options]

Commands:
  quick-check [file]     Quick compatibility check (file optional)
  analyze [directory]    Analyze directory for compiler compatibility
  suggest <file>         Get optimization suggestions for a file
  help                   Show this help message

Examples:
  npm run react-compiler-dev-tool quick-check
  npm run react-compiler-dev-tool quick-check src/components/MyComponent.tsx
  npm run react-compiler-dev-tool analyze src/components
  npm run react-compiler-dev-tool suggest src/components/MyComponent.tsx

Related commands:
  npm run react-compiler-tracker status     - Show tracker status
  npm run react-compiler-tracker report     - Generate detailed report
  npm run react-compiler-tracker check-file - Check specific file
    `);
    }
}

// CLI interface
function main() {
    const args = process.argv.slice(2);
    const command = args.at(0);
    const devTool = new ReactCompilerDevTool();

    try {
        switch (command) {
            case 'quick-check':
                // eslint-disable-next-line no-case-declarations
                const filePath = args.at(1);
                devTool.quickCheck(filePath);
                break;

            case 'analyze':
                // eslint-disable-next-line no-case-declarations
                const directory = args.at(1) ?? 'src';
                devTool.analyzeDirectory(directory);
                break;

            case 'suggest':
                // eslint-disable-next-line no-case-declarations
                const targetFile = args.at(1);
                if (!targetFile) {
                    console.error('❌ Please provide a file path: npm run react-compiler-dev-tool suggest <path>');
                    process.exit(1);
                }
                devTool.suggestOptimizations(targetFile);
                break;

            case 'help':
            default:
                devTool.showHelp();
                break;
        }
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

export default ReactCompilerDevTool;
