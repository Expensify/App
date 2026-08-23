import {file} from 'bun';

import type {LintMessage} from './types';

import WorkerPool from '../utils/WorkerPool';

const RULES_SUPPRESSED_BY_REACT_COMPILER = new Set(['react/jsx-no-constructed-context-values', 'rulesdir/no-inline-useOnyx-selector']);
const EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN = /\buseCallback\(\) Hook\b|\buseMemo\(\) Hook\b/;
const CACHE_DIR = 'node_modules/.cache/react-compiler';

type CompilerCheck = (source: string, filename: string) => boolean | Promise<boolean>;

function isSuppressibleMessage(message: LintMessage): boolean {
    if (message.ruleId !== null && RULES_SUPPRESSED_BY_REACT_COMPILER.has(message.ruleId)) {
        return true;
    }
    return message.ruleId === 'react-hooks/exhaustive-deps' && EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN.test(message.message);
}

function shouldSkipCompiler(filename: string): boolean {
    return filename.includes('/tests/') || filename.includes('node_modules/');
}

function cachePath(projectRoot: string, hash: string): string {
    return `${projectRoot}/${CACHE_DIR}/${hash}`;
}

async function readCache(path: string): Promise<boolean | undefined> {
    const handle = file(path);
    if (!(await handle.exists())) {
        return undefined;
    }
    const text = await handle.text();
    if (text === '1') {
        return true;
    }
    if (text === '0') {
        return false;
    }
    return undefined;
}

const CACHE_HIT = '1';
const CACHE_MISS = '0';

async function writeCache(cacheFilePath: string, bothMemoized: boolean): Promise<void> {
    await Bun.write(cacheFilePath, bothMemoized ? CACHE_HIT : CACHE_MISS);
}

type Candidate = {
    filename: string;
    source: string;
};

type CompilerWorkerResponse = {
    filename: string;
    bothMemoized: boolean;
};

function unmemoizedFallback(candidate: Candidate): CompilerWorkerResponse {
    return {filename: candidate.filename, bothMemoized: false};
}

async function checkCandidatesWithPool(candidates: Candidate[], checkBoth: CompilerCheck | undefined, workerCount: number): Promise<Map<string, boolean>> {
    const memoized = new Map<string, boolean>();
    if (candidates.length === 0) {
        return memoized;
    }

    if (checkBoth) {
        await Promise.all(
            candidates.map(async (candidate) => {
                try {
                    memoized.set(candidate.filename, await checkBoth(candidate.source, candidate.filename));
                } catch {
                    // Conservative: keep the message rather than aborting the whole lint.
                    memoized.set(candidate.filename, false);
                }
            }),
        );
        return memoized;
    }

    const pool = new WorkerPool<Candidate, CompilerWorkerResponse>(new URL('./reactCompilerWorker.ts', import.meta.url), workerCount);
    const responses = await pool.map(candidates, unmemoizedFallback);
    for (const response of responses) {
        memoized.set(response.filename, response.bothMemoized);
    }
    return memoized;
}

/**
 * Drop suppressible React-Compiler-redundant messages, but only after both
 * compilers memoize the file. Files with no suppressible message are skipped
 * entirely (~60× fewer compiler invocations than the ESLint processor).
 *
 * Cache is one file per content hash so concurrent writes of the same key are
 * benign and need no lock.
 */
async function filterReactCompilerMessages(
    messages: LintMessage[],
    projectRoot: string,
    checkBoth?: CompilerCheck,
    workerCount = navigator.hardwareConcurrency || 4,
): Promise<LintMessage[]> {
    const byFile = new Map<string, LintMessage[]>();
    for (const message of messages) {
        const list = byFile.get(message.filePath) ?? [];
        list.push(message);
        byFile.set(message.filePath, list);
    }

    const candidateNames: string[] = [];
    for (const [filename, fileMessages] of byFile) {
        if (shouldSkipCompiler(filename)) {
            continue;
        }
        if (fileMessages.some(isSuppressibleMessage)) {
            candidateNames.push(filename);
        }
    }

    if (candidateNames.length === 0) {
        return messages;
    }

    const uncached: Candidate[] = [];
    const memoized = new Map<string, boolean>();

    await Promise.all(
        candidateNames.map(async (filename) => {
            const source = checkBoth ? '' : await file(filename).text();
            if (!checkBoth) {
                const hash = Bun.hash(source).toString(16);
                const cached = await readCache(cachePath(projectRoot, hash));
                if (cached !== undefined) {
                    memoized.set(filename, cached);
                    return;
                }
            }
            uncached.push({filename, source});
        }),
    );

    const computed = await checkCandidatesWithPool(uncached, checkBoth, workerCount);
    await Promise.all(
        uncached.map(async (candidate) => {
            const bothMemoized = computed.get(candidate.filename) ?? false;
            memoized.set(candidate.filename, bothMemoized);
            if (checkBoth) {
                return;
            }
            const hash = Bun.hash(candidate.source).toString(16);
            await writeCache(cachePath(projectRoot, hash), bothMemoized);
        }),
    );

    return messages.filter((message) => {
        if (!memoized.get(message.filePath)) {
            return true;
        }
        return !isSuppressibleMessage(message);
    });
}

export {EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN, filterReactCompilerMessages, isSuppressibleMessage, RULES_SUPPRESSED_BY_REACT_COMPILER};
export type {CompilerCheck};
