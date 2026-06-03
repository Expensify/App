#!/usr/bin/env bun
/**
 * Report what share of New Expensify production users (by Sentry error events)
 * were on a release strictly older than a given version.
 *
 * Requires SENTRY_AUTH_TOKEN with org:read and event read access.
 * Create at: https://sentry.io/settings/account/api/auth-tokens/
 *
 * @example
 *   export SENTRY_AUTH_TOKEN=sntrys_...
 *   bun scripts/sentry/release-adoption-older-than.ts --threshold 9.3.79-4 --period 14d
 *   bun scripts/sentry/release-adoption-older-than.ts --threshold 9.3.79-4 --start 2026-05-22T00:00:00Z --end 2026-06-03T23:59:59Z
 */

const DEFAULT_ORG = 'expensify';
const DEFAULT_PROJECT = 'app';
const DEFAULT_REGION = 'https://us.sentry.io';
const DEFAULT_RELEASE_PREFIX = 'new.expensify@';
const DEFAULT_ENVIRONMENT = 'production';
const DEFAULT_DATASET = 'errors';
const OR_QUERY_CHUNK_SIZE = 25;

type Version = {
    major: number;
    minor: number;
    patch: number;
    build: number;
};

type CliOptions = {
    threshold: string | null;
    period: string;
    start: string | null;
    end: string | null;
    environment: string;
    prefix: string;
    org: string;
    project: string;
    region: string;
    json: boolean;
    help: boolean;
};

type SentryRequestContext = Pick<CliOptions, 'org' | 'region'>;

type SentryProject = {
    id: string | number;
    slug: string;
};

type ReleaseRow = {
    release: string | null;
    'count_unique(user)': number | string;
};

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

function printUsage(): void {
    console.error(`Usage: release-adoption-older-than.ts --threshold <major.minor.patch-build> [options]

Options:
  --threshold <ver>     Version to compare against (e.g. 9.3.79-4). Users on this exact build are NOT counted as older.
  --period <period>     Sentry statsPeriod (e.g. 24h, 14d, 30d). Ignored if --start/--end are set.
  --start <iso>         Window start (ISO-8601). Use with --end instead of --period.
  --end <iso>           Window end (ISO-8601).
  --environment <name>  Sentry environment filter (default: ${DEFAULT_ENVIRONMENT})
  --prefix <prefix>     Release name prefix (default: ${DEFAULT_RELEASE_PREFIX})
  --org <slug>          Sentry organization (default: ${DEFAULT_ORG})
  --project <slug>      Sentry project (default: ${DEFAULT_PROJECT})
  --region <url>        Sentry region base URL (default: ${DEFAULT_REGION})
  --json                Print machine-readable JSON only
  --help                Show this help

Environment:
  SENTRY_AUTH_TOKEN     Required. Bearer token for Sentry API.

Metric:
  unique users with at least one error event in the window on a matching release
  strictly older than --threshold, divided by all unique users with any error event
  in the same window (same environment / project / dataset).
`);
}

function parseArgs(argv: string[]): CliOptions {
    const options: CliOptions = {
        threshold: null,
        period: '14d',
        start: null,
        end: null,
        environment: DEFAULT_ENVIRONMENT,
        prefix: DEFAULT_RELEASE_PREFIX,
        org: DEFAULT_ORG,
        project: DEFAULT_PROJECT,
        region: DEFAULT_REGION,
        json: false,
        help: false,
    };

    for (let i = 2; i < argv.length; i += 1) {
        const arg = argv[i];
        switch (arg) {
            case '--help':
            case '-h':
                options.help = true;
                break;
            case '--json':
                options.json = true;
                break;
            case '--threshold':
                options.threshold = argv[++i];
                break;
            case '--period':
                options.period = argv[++i];
                break;
            case '--start':
                options.start = argv[++i];
                break;
            case '--end':
                options.end = argv[++i];
                break;
            case '--environment':
                options.environment = argv[++i];
                break;
            case '--prefix':
                options.prefix = argv[++i];
                break;
            case '--org':
                options.org = argv[++i];
                break;
            case '--project':
                options.project = argv[++i];
                break;
            case '--region':
                options.region = argv[++i].replace(/\/$/, '');
                break;
            default:
                throw new Error(`Unknown argument: ${arg}`);
        }
    }

    if (options.help) {
        printUsage();
        process.exit(0);
    }

    if (!options.threshold) {
        printUsage();
        throw new Error('--threshold is required');
    }

    if ((options.start && !options.end) || (!options.start && options.end)) {
        throw new Error('Provide both --start and --end, or use --period');
    }

    return options;
}

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
    const token = process.env.SENTRY_AUTH_TOKEN;
    if (!token) {
        throw new Error('SENTRY_AUTH_TOKEN is not set');
    }

    return token;
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

async function resolveProjectId(options: CliOptions): Promise<string> {
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
    options: CliOptions;
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

    if (cursor) {
        params.append('cursor', cursor);
    } else if (options.start && options.end) {
        params.append('start', options.start);
        params.append('end', options.end);
    } else {
        params.append('statsPeriod', options.period);
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

async function queryEventsTable({options, projectId, fields, query, sort}: {options: CliOptions; projectId: string; fields: string[]; query: string; sort?: string}): Promise<ReleaseRow[]> {
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

async function countUniqueUsers({options, projectId, query}: {options: CliOptions; projectId: string; query: string}): Promise<number> {
    const rows = await queryEventsTable({
        options,
        projectId,
        fields: ['count_unique(user)'],
        query,
    });

    const value = rows[0]?.['count_unique(user)'];
    return typeof value === 'number' ? value : Number(value ?? 0);
}

function buildReleaseFilter(releases: string[]): string | null {
    if (releases.length === 0) {
        return null;
    }

    return `release:[${releases.join(',')}]`;
}

async function countUniqueUsersOnReleases({options, projectId, baseQuery, releases}: {options: CliOptions; projectId: string; baseQuery: string; releases: string[]}): Promise<number> {
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

    console.error(
        `Warning: ${releases.length} older releases required ${chunks.length} OR queries. ` + 'Summing chunk counts can over-count users who hit errors on more than one old build.',
    );

    let total = 0;
    for (const chunk of chunks) {
        const query = `${baseQuery} ${buildReleaseFilter(chunk)}`.trim();
        total += await countUniqueUsers({options, projectId, query});
    }

    return total;
}

function collectOlderReleases({releaseRows, options, threshold}: {releaseRows: ReleaseRow[]; options: CliOptions; threshold: Version}): string[] {
    const older = new Set<string>();

    for (const row of releaseRows) {
        const version = parseReleaseVersion(row.release, options.prefix);
        if (version && isOlderThan(version, threshold)) {
            older.add(row.release as string);
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

async function main(): Promise<void> {
    const options = parseArgs(process.argv);
    const threshold = parseThreshold(options.threshold as string);
    const baseQuery = `environment:${options.environment}`;

    const projectId = await resolveProjectId(options);

    const [releaseRows, totalUsers] = await Promise.all([
        queryEventsTable({
            options,
            projectId,
            fields: ['release', 'count_unique(user)'],
            query: baseQuery,
            sort: '-count_unique(user)',
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
        threshold: options.threshold as string,
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

        console.log(`  ${row.release}: ${Number(row['count_unique(user)']).toLocaleString()} users`);
    }
    console.log('');
    console.log(`Sentry Discover: ${options.region.replace(/\/$/, '')}/organizations/${options.org}/explore/discover/`);
}

main().catch((error: Error) => {
    console.error(error.message);
    process.exit(1);
});
