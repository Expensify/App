/**
 * Compares the headers two NewDot hosts return for the same set of paths, e.g. production against a local
 * `wrangler dev` session:
 *
 *   npm run compare-headers -- https://new.expensify.com http://localhost:8787
 *
 * CSP nonces are masked, and CSP differences are reported per directive.
 */

const COMPARED_HEADERS = [
    'content-type',
    'cache-control',
    'strict-transport-security',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy',
    'document-policy',
    'content-security-policy',
];

// Node's fetch overwrites Sec-Fetch-Mode. `wrangler dev` restores MF-Sec-Fetch-Mode as Sec-Fetch-Mode; real hosts ignore it.
const NAVIGATION_HEADERS = {'MF-Sec-Fetch-Mode': 'navigate'};

type PathCheck = {
    label: string;
    getPath: (origin: string) => Promise<string>;
    headers?: Record<string, string>;
};

type Snapshot = {status: number; headers: Record<string, string>};

function staticPath(path: string, headers?: Record<string, string>): PathCheck {
    return {label: path, getPath: () => Promise.resolve(path), headers};
}

/** Each host serves its own build, so the main bundle has a different hash on each side. */
async function getMainBundlePath(origin: string): Promise<string> {
    const html = await (await fetch(`${origin}/index.html`)).text();
    const path = /src="(\/main-[0-9a-f]+\.bundle\.js)"/.exec(html)?.[1];
    if (!path) {
        throw new Error(`Could not find the main bundle in ${origin}/index.html`);
    }
    return path;
}

const CHECKS: PathCheck[] = [
    staticPath('/', NAVIGATION_HEADERS),
    staticPath('/r/1234567890', NAVIGATION_HEADERS),
    staticPath('/index.html'),
    {label: '/main-<hash>.bundle.js', getPath: getMainBundlePath},
    staticPath('/main-ffffffffffffffff.bundle.js'),
    staticPath('/version.json'),
    staticPath('/service-worker.js'),
    staticPath('/manifest.json'),
    staticPath('/robots.txt'),
    staticPath('/.well-known/apple-app-site-association'),
    staticPath('/apple-app-site-association'),
    staticPath('/.well-known/assetlinks.json'),
];

async function snapshot(origin: string, check: PathCheck): Promise<Snapshot> {
    const path = await check.getPath(origin);
    const response = await fetch(`${origin}${path}`, {headers: check.headers, redirect: 'manual'});
    await response.body?.cancel();

    const headers: Record<string, string> = {};
    for (const name of COMPARED_HEADERS) {
        headers[name] = (response.headers.get(name) ?? '(none)').replace(/'nonce-[^']+'/g, "'nonce-*'");
    }
    return {status: response.status, headers};
}

function parseCSP(csp: string): Map<string, Set<string>> {
    const directives = new Map<string, Set<string>>();
    for (const directive of csp.split(';')) {
        const [name, ...sources] = directive.trim().split(/\s+/);
        if (name) {
            directives.set(name, new Set(sources));
        }
    }
    return directives;
}

function describeCSPDifference(left: string, right: string): string[] {
    const leftDirectives = parseCSP(left);
    const rightDirectives = parseCSP(right);
    const lines: string[] = [];
    for (const name of new Set([...leftDirectives.keys(), ...rightDirectives.keys()])) {
        const leftSources = leftDirectives.get(name) ?? new Set<string>();
        const rightSources = rightDirectives.get(name) ?? new Set<string>();
        const onlyLeft = [...leftSources].filter((source) => !rightSources.has(source));
        const onlyRight = [...rightSources].filter((source) => !leftSources.has(source));
        if (onlyLeft.length > 0 || onlyRight.length > 0) {
            lines.push(`    ${name}: left only [${onlyLeft.join(' ')}], right only [${onlyRight.join(' ')}]`);
        }
    }
    return lines;
}

async function main() {
    const [left, right] = process.argv.slice(2).map((origin) => origin.replace(/\/$/, ''));
    if (!left || !right) {
        console.error('Usage: npm run compare-headers -- <left origin> <right origin>');
        process.exit(1);
    }

    console.log(`left:  ${left}\nright: ${right}\n`);
    let differenceCount = 0;
    for (const check of CHECKS) {
        const [leftSnapshot, rightSnapshot] = await Promise.all([snapshot(left, check), snapshot(right, check)]);
        const lines: string[] = [];
        if (leftSnapshot.status !== rightSnapshot.status) {
            lines.push(`  status: ${leftSnapshot.status} -> ${rightSnapshot.status}`);
        }
        for (const name of COMPARED_HEADERS) {
            const leftValue = leftSnapshot.headers[name];
            const rightValue = rightSnapshot.headers[name];
            if (leftValue === rightValue) {
                continue;
            }
            if (name === 'content-security-policy') {
                lines.push('  content-security-policy:', ...describeCSPDifference(leftValue, rightValue));
            } else {
                lines.push(`  ${name}: ${leftValue} -> ${rightValue}`);
            }
        }

        differenceCount += lines.length > 0 ? 1 : 0;
        console.log(lines.length > 0 ? `✗ ${check.label}\n${lines.join('\n')}` : `✓ ${check.label}`);
    }

    console.log(`\n${differenceCount} of ${CHECKS.length} paths differ.`);
}

await main();
