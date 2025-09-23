import {readFileSync} from 'fs';
import minimatch from 'minimatch';
import {join} from 'path';

const REACT_COMPILER_CONFIG_FILENAME = 'react-compiler-config.json';

type ReactCompilerConfig = {
    excludedPatterns: string[];
    includedPatterns: string[];
};

const REACT_COMPILER_CONFIG = JSON.parse(readFileSync(join(process.cwd(), REACT_COMPILER_CONFIG_FILENAME), 'utf8')) as ReactCompilerConfig;

function shouldProcessFile(filePath: string): boolean {
    if (filePath.length === 0) {
        return false;
    }

    const isExcluded = REACT_COMPILER_CONFIG.excludedPatterns.some((pattern) => minimatch(filePath, pattern));
    if (isExcluded) {
        return false;
    }

    const isIncluded = REACT_COMPILER_CONFIG.includedPatterns.some((pattern) => minimatch(filePath, pattern));
    return isIncluded;
}

export default shouldProcessFile;
