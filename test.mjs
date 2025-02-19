// Import the necessary modules
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs/promises';

const execAsync = promisify(exec);

async function getGitDiff(filePath) {
    try {
        const command = `git diff -U0 ${filePath}`;
        const { stdout } = await execAsync(command);
        return stdout;
    } catch (error) {
        console.error('Error getting git diff:', error);
        return null;
    }
}

function extractAddedLines(gitDiffOutput) {
    const lines = gitDiffOutput.split('\n');
    const addedLines = [];
    let currentLineNumber = null;

    lines.forEach(line => {
        if (line.startsWith('@@')) {
            const lineNumberMatch = line.match(/\+([0-9]+),?([0-9]*)/);
            if (lineNumberMatch) {
                currentLineNumber = parseInt(lineNumberMatch[1], 10) - 1;
            }
        } else if (line.startsWith('+') && !line.startsWith('+++')) {
            addedLines.push({ line: line.substring(1), lineNumber: currentLineNumber });
        } else if (!line.startsWith('-')) {
            currentLineNumber++;
        }
    });

    return addedLines;
}

function getIndentation(line) {
    const match = line.match(/^\s*/);
    return match ? match[0].length : 0;
}

function extractKeyValueFromLine(line) {
    const keyMatch = line.match(/^\s*([\w$]+)\s*:/);
    const key = keyMatch ? keyMatch[1] : null;
    const value = key ? line.substring(line.indexOf(':') + 1).trim().replace(/,$/, '') : null;
    return { key, value };
}

async function formatChanges(filePath, addedLines) {
    const fileContent = await readFile(filePath, { encoding: 'utf8' });
    const lines = fileContent.split('\n');
    const changes = [];

    addedLines.forEach(({ line, lineNumber }) => {
        let currentIndentation = getIndentation(lines[lineNumber]);
        let keys = [];
        let index = lineNumber - 1;

        while (index >= 0) {
            let testLine = lines[index];
            let testIndentation = getIndentation(testLine);
            if (testIndentation < currentIndentation) {
                let key = extractKeyValueFromLine(testLine).key;
                if (key) {
                    keys.unshift(key);
                    currentIndentation = testIndentation;
                }
            }
            index--;
        }

        const { key, value } = extractKeyValueFromLine(line);
        if (key && value) {
            keys.push(key);
            changes.push(`${keys.join('.')} = ${value}`);
        }
    });

    return changes;
}

async function main() {
    const filePath = 'src/languages/en.ts';
    const gitDiffOutput = await getGitDiff(filePath);

    if (gitDiffOutput) {
        const addedLines = extractAddedLines(gitDiffOutput);
        const changes = await formatChanges(filePath, addedLines);
        await writeFile('output.txt', changes.join('\n'), { encoding: 'utf8' });
        console.log('Changes written to output.txt');
    }
}

main().catch(console.error);