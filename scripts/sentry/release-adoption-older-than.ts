#!/usr/bin/env bun
/**
 * Report what share of New Expensify production users (by Sentry error events)
 * were on a release strictly older than a given version.
 *
 * Requires SENTRY_AUTH_TOKEN with org:read and event read access.
 * Create at: https://sentry.io/settings/account/api/auth-tokens/
 *
 * @example
 *   export SENTRY_AUTH_TOKEN=your-token-here
 *   bun scripts/sentry/release-adoption-older-than.ts --threshold 9.3.79-4 --period 14d
 *   bun scripts/sentry/release-adoption-older-than.ts --threshold 9.3.79-4 --start 2026-05-22T00:00:00Z --end 2026-06-03T23:59:59Z
 *   bun scripts/sentry/release-adoption-older-than.ts --help
 */
import CLI from '../utils/CLI';

const DEFAULT_ORG = 'expensify';
const DEFAULT_PROJECT = 'app';
const DEFAULT_REGION = 'https://us.sentry.io';
const DEFAULT_RELEASE_PREFIX = 'new.expensify@';
const DEFAULT_ENVIRONMENT = 'production';
const DEFAULT_DATASET = 'errors';
const OR_QUERY_CHUNK_SIZE = 25;

/** Sentry Discover aggregate field for unique user counts. */
const COUNT_UNIQUE_USER_FIELD = 'count_unique(user)';

type Version = {
    major: number;
    minor: number;
    patch: number;
    build: number;
};

type ScriptOptions = {
    threshold: string;
    period: string;
    start?: string;
    end?: string;
    environment: string;
    prefix: string;
    org: string;
    project: string;
    region: string;
    json: boolean;
};

type SentryRequestContext = Pick<ScriptOptions, 'org' | 'region'>;

type SentryProject = {
    id: string | number;
    slug: string;
};

type ReleaseRow = {
    release: string | null;
} & Record<typeof COUNT_UNIQUE_USER_FIELD, number | string | undefined>;

type EventsTableResponse = {
    data?: ReleaseRow[];
};

type AdoptionResult = {
    organization: string;
    project: string;
    environment: string;
    dataset: string;
    window: string;
    threshold: string;
    releasePrefix: string;
    totalUniqueUsers: number;
    uniqueUsersOnOlderReleases: number;
    percentOnOlderReleases: number;
    olderReleaseCount: number;
    olderReleases: string[];
    releaseRowsInWindow: number;
    metric: string;
    caveats: string[];
};

function parseThreshold(version: string): Version {
    const match = /^(\d+)\.(\d+)\.(\d+)-(\d+)$/.exec(version);
    if (!match) {
        throw new Error(`Invalid threshold "${version}". Expected format: major.minor.patch-build (e.g. 9.3.79-4)`);
    }

    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
        build: Number(match[4]),
    };
}

function parseReleaseVersion(release: string | null | undefined, prefix: string): Version | null {
    if (!release || !release.startsWith(prefix)) {
        return null;
    }

    const suffix = release.slice(prefix.length);
    return parseThreshold(suffix);
}

function isOlderThan(version: Version, threshold: Version): boolean {
    if (version.major !== threshold.major) {
        return version.major < threshold.major;
    }
    if (version.minor !== threshold.minor) {
        return version.minor < threshold.minor;
    }
    if (version.patch !== threshold.patch) {
        return version.patch < threshold.patch;
    }

    return version.build < threshold.build;
}

function getAuthToken(): string {
    const {SENTRY_AUTH_TOKEN: authToken} = process.env;

    if (typeof authToken !== 'string' || authToken.length === 0) {
        throw new Error('SENTRY_AUTH_TOKEN is not set');
    }

    return authToken;
}

async function sentryRequest<T>(path: string, searchParams: URLSearchParams, context: SentryRequestContext): Promise<{body: T; headers: Headers}> {
    const url = new URL(`${context.region}/api/0${path}`);
    for (const [key, value] of searchParams.entries()) {
        url.searchParams.append(key, value);
    }

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            Accept: 'application/json',
        },
    });

    const bodyText = await response.text();
    let body: T;
    try {
        body = bodyText ? (JSON.parse(bodyText) as T) : (null as T);
    } catch {
        throw new Error(`Sentry API returned non-JSON response: ${bodyText}`);
    }

    if (!response.ok) {
        const detail = typeof body === 'object' ? JSON.stringify(body) : bodyText;
        throw new Error(`Sentry API ${response.status} ${response.statusText}: ${detail}`);
    }

    return {body, headers: response.headers};
}

async function resolveProjectId(options: ScriptOptions): Promise<string> {
    const {body} = await sentryRequest<SentryProject[]>(`/organizations/${options.org}/projects/`, new URLSearchParams(), options);

    const project = body.find((entry) => entry.slug === options.project);
    if (!project) {
        throw new Error(`Project "${options.project}" not found in organization "${options.org}"`);
    }

    return String(project.id);
}

function buildEventsSearchParams({
    options,
    projectId,
    fields,
    query,
    sort,
    cursor,
}: {
    options: ScriptOptions;
    projectId: string;
    fields: string[];
    query: string;
    sort?: string;
    cursor?: string | null;
}): URLSearchParams {
    const params = new URLSearchParams();
    params.append('dataset', DEFAULT_DATASET);
    params.append('project', projectId);
    params.append('environment', options.environment);
    params.append('query', query);

    for (const field of fields) {
        params.append('field', field);
    }

    if (sort) {
        params.append('sort', sort);
    }

    if (options.start && options.end) {
        params.append('start', options.start);
        params.append('end', options.end);
    } else {
        params.append('statsPeriod', options.period);
    }

    if (cursor) {
        params.append('cursor', cursor);
    }

    return params;
}

function getNextCursor(linkHeader: string | null): string | null {
    if (!linkHeader) {
        return null;
    }

    const parts = linkHeader.split(',');
    for (const part of parts) {
        if (!part.includes('rel="next"') || !part.includes('results="true"')) {
            continue;
        }

        const match = part.match(/cursor="([^"]+)"/);
        if (match) {
            return match[1];
        }
    }

    return null;
}

async function queryEventsTable({
    options,
    projectId,
    fields,
    query,
    sort,
}: {
    options: ScriptOptions;
    projectId: string;
    fields: string[];
    query: string;
    sort?: string;
}): Promise<ReleaseRow[]> {
    const rows: ReleaseRow[] = [];
    let cursor: string | null = null;

    do {
        const params = buildEventsSearchParams({options, projectId, fields, query, sort, cursor});
        params.append('per_page', '100');

        const {body, headers} = await sentryRequest<EventsTableResponse>(`/organizations/${options.org}/events/`, params, options);
        rows.push(...(body.data ?? []));

        cursor = getNextCursor(headers.get('link'));
    } while (cursor);

    return rows;
}

async function countUniqueUsers({options, projectId, query}: {options: ScriptOptions; projectId: string; query: string}): Promise<number> {
    const rows = await queryEventsTable({
        options,
        projectId,
        fields: [COUNT_UNIQUE_USER_FIELD],
        query,
    });

    const value = rows.at(0)?.[COUNT_UNIQUE_USER_FIELD];
    return typeof value === 'number' ? value : Number(value ?? 0);
}

function buildReleaseFilter(releases: string[]): string | null {
    if (releases.length === 0) {
        return null;
    }

    return `release:[${releases.join(',')}]`;
}

async function countUniqueUsersOnReleases({options, projectId, baseQuery, releases}: {options: ScriptOptions; projectId: string; baseQuery: string; releases: string[]}): Promise<number> {
    if (releases.length === 0) {
        return 0;
    }

    const releaseFilter = buildReleaseFilter(releases);
    const fullQuery = `${baseQuery} ${releaseFilter}`.trim();

    try {
        return await countUniqueUsers({options, projectId, query: fullQuery});
    } catch (error) {
        if (releases.length <= OR_QUERY_CHUNK_SIZE) {
            throw error;
        }
    }

    const chunks: string[][] = [];
    for (let i = 0; i < releases.length; i += OR_QUERY_CHUNK_SIZE) {
        chunks.push(releases.slice(i, i + OR_QUERY_CHUNK_SIZE));
    }

    console.error(`Warning: ${releases.length} older releases required ${chunks.length} OR queries. Summing chunk counts can over-count users who hit errors on more than one old build.`);

    let total = 0;
    for (const chunk of chunks) {
        const query = `${baseQuery} ${buildReleaseFilter(chunk)}`.trim();
        total += await countUniqueUsers({options, projectId, query});
    }

    return total;
}

function collectOlderReleases({releaseRows, options, threshold}: {releaseRows: ReleaseRow[]; options: ScriptOptions; threshold: Version}): string[] {
    const older = new Set<string>();

    for (const row of releaseRows) {
        const version = parseReleaseVersion(row.release, options.prefix);
        if (version && isOlderThan(version, threshold) && row.release) {
            older.add(row.release);
        }
    }

    return [...older].sort((left, right) => {
        const leftVersion = parseReleaseVersion(left, options.prefix);
        const rightVersion = parseReleaseVersion(right, options.prefix);
        if (!leftVersion || !rightVersion) {
            return left.localeCompare(right);
        }

        if (leftVersion.major !== rightVersion.major) {
            return leftVersion.major - rightVersion.major;
        }
        if (leftVersion.minor !== rightVersion.minor) {
            return leftVersion.minor - rightVersion.minor;
        }
        if (leftVersion.patch !== rightVersion.patch) {
            return leftVersion.patch - rightVersion.patch;
        }

        return leftVersion.build - rightVersion.build;
    });
}

function createCli() {
    return new CLI({
        flags: {
            json: {
                description: 'Print machine-readable JSON only.',
            },
        },
        namedArgs: {
            threshold: {
                description: 'Version to compare against (e.g. 9.3.79-4). Users on this exact build are not counted as older.',
                parse: (val: string) => {
                    parseThreshold(val);
                    return val;
                },
            },
            period: {
                description: 'Sentry statsPeriod (e.g. 24h, 14d, 30d). Ignored when --start and --end are set.',
                default: '14d',
            },
            start: {
                description: 'Window start (ISO-8601). Use with --end instead of --period.',
                required: false,
                supersedes: ['period'],
            },
            end: {
                description: 'Window end (ISO-8601). Use with --start instead of --period.',
                required: false,
            },
            environment: {
                description: 'Sentry environment filter.',
                default: DEFAULT_ENVIRONMENT,
            },
            prefix: {
                description: 'Release name prefix.',
                default: DEFAULT_RELEASE_PREFIX,
            },
            org: {
                description: 'Sentry organization slug.',
                default: DEFAULT_ORG,
            },
            project: {
                description: 'Sentry project slug.',
                default: DEFAULT_PROJECT,
            },
            region: {
                description: 'Sentry region base URL.',
                default: DEFAULT_REGION,
                parse: (val: string) => val.replace(/\/$/, ''),
            },
        },
    });
}

function getScriptOptions(cli: ReturnType<typeof createCli>): ScriptOptions {
    const {start, end} = cli.namedArgs;

    if ((start && !end) || (!start && end)) {
        throw new Error('Provide both --start and --end, or use --period');
    }

    return {
        threshold: cli.namedArgs.threshold,
        period: cli.namedArgs.period,
        start,
        end,
        environment: cli.namedArgs.environment,
        prefix: cli.namedArgs.prefix,
        org: cli.namedArgs.org,
        project: cli.namedArgs.project,
        region: cli.namedArgs.region,
        json: cli.flags.json,
    };
}

async function main(): Promise<void> {
    const cli = createCli();
    const options = getScriptOptions(cli);
    const threshold = parseThreshold(options.threshold);
    const baseQuery = `environment:${options.environment}`;

    const projectId = await resolveProjectId(options);

    const [releaseRows, totalUsers] = await Promise.all([
        queryEventsTable({
            options,
            projectId,
            fields: ['release', COUNT_UNIQUE_USER_FIELD],
            query: baseQuery,
            sort: `-${COUNT_UNIQUE_USER_FIELD}`,
        }),
        countUniqueUsers({options, projectId, query: baseQuery}),
    ]);

    const olderReleases = collectOlderReleases({releaseRows, options, threshold});
    const usersOnOlderReleases = await countUniqueUsersOnReleases({
        options,
        projectId,
        baseQuery,
        releases: olderReleases,
    });

    const percent = totalUsers === 0 ? 0 : (usersOnOlderReleases / totalUsers) * 100;
    const windowLabel = options.start && options.end ? `${options.start} → ${options.end}` : `last ${options.period}`;

    const result: AdoptionResult = {
        organization: options.org,
        project: options.project,
        environment: options.environment,
        dataset: DEFAULT_DATASET,
        window: windowLabel,
        threshold: options.threshold,
        releasePrefix: options.prefix,
        totalUniqueUsers: totalUsers,
        uniqueUsersOnOlderReleases: usersOnOlderReleases,
        percentOnOlderReleases: Number(percent.toFixed(2)),
        olderReleaseCount: olderReleases.length,
        olderReleases,
        releaseRowsInWindow: releaseRows.length,
        metric: 'Users with ≥1 error on a release strictly older than threshold / users with ≥1 error in window',
        caveats: [
            'Based on Sentry error events, not all active users (silent users are excluded).',
            'Users who upgraded mid-window may appear on both old and new releases in the breakdown table; the headline % uses a deduplicated OR query when it fits in one chunk.',
            'If multiple OR chunks are required, uniqueUsersOnOlderReleases may over-count.',
        ],
    };

    if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }

    console.log(`New Expensify production release adoption (${windowLabel})`);
    console.log(`Threshold: strictly older than ${options.prefix}${options.threshold}`);
    console.log('');
    console.log(`Total unique users (errors):     ${totalUsers.toLocaleString()}`);
    console.log(`Users on older releases:         ${usersOnOlderReleases.toLocaleString()}`);
    console.log(`Percent on older releases:       ${percent.toFixed(2)}%`);
    console.log(`Older release versions counted:  ${olderReleases.length}`);
    console.log('');
    console.log('Metric: users with at least one error on an older release / all users with errors in window.');
    console.log('Top older releases in window (from per-release breakdown):');
    for (const row of releaseRows) {
        const version = parseReleaseVersion(row.release, options.prefix);
        if (!version || !isOlderThan(version, threshold)) {
            continue;
        }

        console.log(`  ${row.release}: ${Number(row[COUNT_UNIQUE_USER_FIELD]).toLocaleString()} users`);
    }
    console.log('');
    console.log(`Sentry Discover: ${options.region.replace(/\/$/, '')}/organizations/${options.org}/explore/discover/`);
}

main().catch((error: Error) => {
    console.error(error.message);
    process.exit(1);
});
