import {readFileSync} from 'fs';
import minimatch from 'minimatch';
import {join} from 'path';

const REACT_COMPILER_CONFIG_FILENAME = 'react-compiler-config.json';

type ReactCompilerConfig = {
    excludedPatterns: string[];
    includedPatterns: string[];
};

const REACT_COMPILER_CONFIG = JSON.parse(readFileSync(join(process.cwd(), REACT_COMPILER_CONFIG_FILENAME), 'utf8')) as ReactCompilerConfig;

/**
 * Check if a file should be processed by React Compiler
 * Uses glob pattern matching to determine if a file should be included or excluded
 */
function shouldProcessFile(filePath: string): boolean {
    // Early return for empty paths
    if (filePath.length === 0) {
        return false;
    }

    // Check if file matches any excluded patterns
    const isExcluded = REACT_COMPILER_CONFIG.excludedPatterns.some((pattern) => minimatch(filePath, pattern));
    if (isExcluded) {
        return false;
    }

    // Check if file matches any included patterns
    const isIncluded = REACT_COMPILER_CONFIG.includedPatterns.some((pattern) => minimatch(filePath, pattern));
    return isIncluded;
}

export default shouldProcessFile;
