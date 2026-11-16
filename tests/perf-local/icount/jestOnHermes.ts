/**
 * Stand-in for the Jest globals an existing perf-local test file uses, so the file can run unchanged on the Hermes CLI.
 * Collects tests and hooks; runOnHermes() then runs the one test picked through globalThis.__ICOUNT.
 */
import {seed} from '@ngneat/falso';

type Callback = () => Promise<unknown> | unknown;
type Settings = {test: number; iterations: number};

declare const print: (message: string) => void;
declare const quit: () => void;

const tests: Array<{name: string; fn: Callback}> = [];
const hooks: Record<'beforeAll' | 'beforeEach' | 'afterEach' | 'afterAll', Callback[]> = {beforeAll: [], beforeEach: [], afterEach: [], afterAll: []};
const globals = globalThis as unknown as Record<string, unknown>;

globals.describe = (_name: string, fn: () => void) => fn();
globals.test = (name: string, fn: Callback) => tests.push({name, fn});
globals.it = globals.test;
for (const hook of ['beforeAll', 'beforeEach', 'afterEach', 'afterAll'] as const) {
    globals[hook] = (fn: Callback) => hooks[hook].push(fn);
}

// Test data must be the same in every process, or the amount of work changes from run to run.
seed('3217');

async function runOnHermes() {
    const {test: testIndex} = globals.__ICOUNT as Settings;
    if (testIndex < 0) {
        print(`icount tests ${JSON.stringify(tests.map((item) => item.name))}`);
        return;
    }
    for (const hook of hooks.beforeAll) {
        await hook();
    }
    for (const hook of hooks.beforeEach) {
        await hook();
    }
    await tests[testIndex]?.fn();
    print('icount done');
}

function run() {
    runOnHermes()
        .catch((error: unknown) => print(`icount error ${error instanceof Error ? `${error.message}\n${error.stack}` : String(error)}`))
        // App modules leave timers behind (logging, Pusher); stop here so they are not part of the count.
        .then(() => quit());
}

export default run;
