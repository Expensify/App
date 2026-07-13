import resolveArtifacts, {ARTIFACT_IDS, fetchTokenSafe} from '@scripts/artifacts-utils/lib/artifactsResolver';

/**
 * @jest-environment node
 */
import {execFileSync} from 'child_process';
import {EventEmitter} from 'events';
import fs from 'fs';
import https from 'https';

jest.mock('child_process');
jest.mock('https');

const mockExecFileSync = execFileSync as jest.MockedFunction<typeof execFileSync>;
const mockGet = https.get as jest.MockedFunction<typeof https.get>;

const NEW_DOT_ROOT = '/repo';
const LOCAL_HASH = 'abc123hash';

/** Build a fake IncomingMessage that emits the given body then ends. */
function fakeResponse(statusCode: number, headers: Record<string, string>, body = '') {
    const res = new EventEmitter() as EventEmitter & {statusCode: number; headers: Record<string, string>; resume: () => void; setEncoding: () => void};
    res.statusCode = statusCode;
    res.headers = headers;
    res.resume = () => undefined;
    res.setEncoding = () => undefined;
    process.nextTick(() => {
        if (body) {
            res.emit('data', body);
        }
        res.emit('end');
    });
    return res;
}

/**
 * Queue-based https.get mock. Records the `Authorization` header seen on every
 * request so we can assert the token is never forwarded to a redirect host.
 */
function mockHttpsSequence(responses: Array<{statusCode: number; headers?: Record<string, string>; body?: string}>) {
    const seenAuthHeaders: Array<string | undefined> = [];
    let call = 0;
    mockGet.mockImplementation((_url: string | URL, options: https.RequestOptions, callback?: (res: unknown) => void) => {
        const headers = (options?.headers ?? {}) as Record<string, string>;
        seenAuthHeaders.push(headers.Authorization);
        const spec = responses.at(call++) ?? {statusCode: 500};
        callback?.(fakeResponse(spec.statusCode, spec.headers ?? {}, spec.body));
        const req = new EventEmitter();
        return req as unknown as ReturnType<typeof https.get>;
    });
    return seenAuthHeaders;
}

/** Mocks the exec calls needed for a full resolve: credentials + hash + candidate list. */
function mockResolveExec(candidates: string) {
    mockExecFileSync.mockImplementation((cmd: string, args?: readonly string[]) => {
        if (cmd === 'bash') {
            return LOCAL_HASH;
        }
        if (cmd === 'gh' && args?.includes('status')) {
            return 'Token scopes: read:packages';
        }
        if (cmd === 'gh' && args?.includes('user')) {
            return JSON.stringify({login: 'me'});
        }
        if (cmd === 'gh' && args?.includes('token')) {
            return 'tok';
        }
        if (cmd === 'gh' && args?.includes('--paginate')) {
            return candidates;
        }
        return '';
    });
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({dependencies: {'react-native': '0.85.3'}}));
}

describe('artifactsResolver', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('fetchTokenSafe (security)', () => {
        it('does NOT forward the token when following a cross-host 302 redirect', async () => {
            const seenAuth = mockHttpsSequence([
                {statusCode: 302, headers: {location: 'https://objectstorage.example.com/signed?sig=xyz'}},
                {statusCode: 200, body: '<xml/>'},
            ]);

            const body = await fetchTokenSafe('https://maven.pkg.github.com/pom', 'secret-token');

            expect(body).toBe('<xml/>');
            // First hop (GitHub Packages) carries the token; the redirect hop (S3) must NOT.
            expect(seenAuth.at(0)).toBe('Bearer secret-token');
            expect(seenAuth.at(1)).toBeUndefined();
        });

        it('returns the body directly on a 200 with no redirect', async () => {
            mockHttpsSequence([{statusCode: 200, body: 'hello'}]);
            await expect(fetchTokenSafe('https://maven.pkg.github.com/pom', 'tok')).resolves.toBe('hello');
        });

        it('rejects on a non-2xx status', async () => {
            mockHttpsSequence([{statusCode: 404}]);
            await expect(fetchTokenSafe('https://maven.pkg.github.com/pom', 'tok')).rejects.toThrow('status 404');
        });

        it('rejects when the redirect chain is too long', async () => {
            mockHttpsSequence(Array.from({length: 10}, () => ({statusCode: 302, headers: {location: 'https://a.example.com/next'}})));
            await expect(fetchTokenSafe('https://maven.pkg.github.com/pom', 'tok')).rejects.toThrow('Too many redirects');
        });
    });

    describe('ARTIFACT_IDS', () => {
        it('uses the correct Maven artifactId per platform', () => {
            expect(ARTIFACT_IDS.android).toBe('react-android');
            expect(ARTIFACT_IDS.ios).toBe('react-native-artifacts');
        });
    });

    describe('resolveArtifacts', () => {
        it('falls back to source build when the GitHub CLI is unavailable', async () => {
            mockExecFileSync.mockImplementation((cmd: string) => {
                if (cmd === 'which') {
                    throw new Error('not found');
                }
                return '';
            });

            const result = await resolveArtifacts({platform: 'ios', packageName: 'react-hybrid', newDotRoot: NEW_DOT_ROOT, isHybrid: true});

            expect(result).toStrictEqual({buildFromSource: true, version: null, packageName: 'react-hybrid', artifactId: 'react-native-artifacts'});
        });

        it('resolves a matching version and does not build from source', async () => {
            mockResolveExec('0.85.3-nomatch\n0.85.3-match');
            mockHttpsSequence([
                {statusCode: 200, body: '<properties><patchesHash>differenthash</patchesHash></properties>'},
                {statusCode: 200, body: `<properties><patchesHash>${LOCAL_HASH}</patchesHash></properties>`},
            ]);

            const result = await resolveArtifacts({platform: 'ios', packageName: 'react-hybrid', newDotRoot: NEW_DOT_ROOT, isHybrid: true});

            expect(result.buildFromSource).toBe(false);
            expect(result.version).toBe('0.85.3-match');
        });

        it('falls back to source build when no candidate matches the local patches hash', async () => {
            mockResolveExec('0.85.3-other');
            mockHttpsSequence([{statusCode: 200, body: '<properties><patchesHash>nomatch</patchesHash></properties>'}]);

            const result = await resolveArtifacts({platform: 'android', packageName: 'react-standalone', newDotRoot: NEW_DOT_ROOT, isHybrid: false});

            expect(result.buildFromSource).toBe(true);
            expect(result.version).toBeNull();
        });
    });
});
