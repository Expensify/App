const {readFileSync} = require('fs');
const minimatch = require('minimatch');
const {join} = require('path');

const REACT_COMPILER_CONFIG_FILENAME = 'react-compiler-config.json';

const REACT_COMPILER_CONFIG = JSON.parse(readFileSync(join(process.cwd(), REACT_COMPILER_CONFIG_FILENAME), 'utf8'));

function shouldReactCompilerProcessFile(filePath) {
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

module.exports = shouldReactCompilerProcessFile;
