import fs from 'fs';

type JestResults = {testResults: Array<{name: string; assertionResults: Array<{fullName: string}>}>};

/**
 * Keeps the baseline scenarios the PR's run can be compared with: those whose test file the PR ran, and
 * those whose test file the PR deleted. A scenario in a file the PR didn't select is dropped, so the
 * comparison lists a scenario as removed only when the PR really removed it.
 */
function filterReassureBaseline(baselinePerf: string, baselineJest: JestResults, branchJest: JestResults, fileExists: (path: string) => boolean): string {
    const testFileByScenario = new Map(baselineJest.testResults.flatMap((file) => file.assertionResults.map((test) => [test.fullName, file.name] as const)));
    const branchTestFiles = new Set(branchJest.testResults.map((file) => file.name));
    return baselinePerf
        .split('\n')
        .filter((line) => {
            if (!line) {
                return false;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- every .perf line is a JSON object; the header has no name
            const {name} = JSON.parse(line) as {name?: string};
            const testFile = name === undefined ? undefined : testFileByScenario.get(name);
            return testFile === undefined || branchTestFiles.has(testFile) || !fileExists(testFile);
        })
        .map((line) => `${line}\n`)
        .join('');
}

if (import.meta.main) {
    const [baselinePerfPath, baselineJestPath, branchJestPath] = process.argv.slice(2);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Jest's --json output
    const readJest = (path: string) => JSON.parse(fs.readFileSync(path, 'utf8')) as JestResults;
    const filtered = filterReassureBaseline(fs.readFileSync(baselinePerfPath, 'utf8'), readJest(baselineJestPath), readJest(branchJestPath), fs.existsSync);
    fs.writeFileSync(baselinePerfPath, filtered);
}

export default filterReassureBaseline;
