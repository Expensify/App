import fs from 'fs';
import path from 'path';

/**
 * Extracts the after_n_builds value from codecov.yml
 * Expected format: "after_n_builds: 8"
 */
function getAfterNBuildsFromCodecov(content: string): number | null {
    const match = content.match(/after_n_builds:\s*(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Extracts the chunk array from test.yml workflow
 * Expected format: "chunk: [1, 2, 3, 4, 5, 6, 7, 8]"
 */
function getChunksFromTestWorkflow(content: string): number[] | null {
    const match = content.match(/chunk:\s*\[([^\]]+)\]/);
    if (!match) {
        return null;
    }
    const chunksStr = match[1];
    return chunksStr.split(',').map((chunk) => parseInt(chunk.trim(), 10));
}

describe('Codecov configuration', () => {
    test('after_n_builds matches the number of test shards in test.yml', () => {
        const codecovPath = path.resolve(__dirname, '../../codecov.yml');
        const testWorkflowPath = path.resolve(__dirname, '../../.github/workflows/test.yml');

        // Read codecov.yml and extract after_n_builds
        const codecovContent = fs.readFileSync(codecovPath, 'utf-8');
        const afterNBuilds = getAfterNBuildsFromCodecov(codecovContent);

        // Read test.yml and extract chunk array
        const testWorkflowContent = fs.readFileSync(testWorkflowPath, 'utf-8');
        const chunks = getChunksFromTestWorkflow(testWorkflowContent);

        // Validate both values exist
        expect(afterNBuilds).not.toBeNull();
        expect(chunks).not.toBeNull();
        expect(Array.isArray(chunks)).toBe(true);

        // Validate they match
        const numberOfShards = chunks?.length ?? 0;
        expect(afterNBuilds).toBe(numberOfShards);
    });
});
