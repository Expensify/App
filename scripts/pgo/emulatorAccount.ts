// cspell:ignore sdcard simctl
/** Sign a disposable emulator into the CI test account and describe that account to the journeys. */
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import type {PlatformName} from '../lib/nativeAppBenchmark';
import type {JourneyFixture} from './journeyConfig';
import type {JourneyDevice, JourneyNode} from './journeyDevice';

import {capture, fail, run, runAllowFailure, sleep} from '../lib/scriptUtils';
import {EMULATOR_SIGN_IN_FILE, parseEmulatorSignIn} from './emulatorSignIn';
import {parseJourneyFixture} from './journeyConfig';
import {createJourneyDevice, idSelector, normalizeLabel} from './journeyDevice';
import {showTab, waitForTab} from './journeyWorkload';

const SIGN_IN_TIMEOUT_MS = 180_000;
const SEARCH_TIMEOUT_MS = 30_000;
// The removed E2E performance tests used the CI account's #announce room as their chat with many messages.
const BUSY_REPORT = {query: 'announce', title: '#announce'};

/** Sign the installed app in with the CI partner login, then write the journey fixture for that account and return its path. */
async function signInEmulator(platform: PlatformName, device: string, appID: string): Promise<string> {
    const signIn = parseEmulatorSignIn({
        email: process.env.PGO_EMULATOR_ACCOUNT_EMAIL,
        partnerUserID: process.env.PGO_EMULATOR_PARTNER_USER_ID,
        partnerUserSecret: process.env.PGO_EMULATOR_PARTNER_USER_SECRET,
        partnerName: process.env.PGO_EMULATOR_PARTNER_NAME,
        partnerPassword: process.env.PGO_EMULATOR_PARTNER_PASSWORD,
    });
    if (platform === 'ios') {
        // Build the automation's XCTest runner once, outside the per-command timeout used by every journey step.
        run('agent-device', ['prepare', 'ios-runner', '--platform', 'ios', '--udid', device, '--timeout', '1200000']);
    }
    const session = createJourneyDevice({platform, device, appID, session: `pgo-${platform}-sign-in-${Date.now()}`});
    try {
        if (platform === 'android') {
            // The app creates its files directory on first launch. A directory that adb created first could belong to the shell user instead.
            session.open(true);
            await waitForAndroidFilesDirectory(device, appID);
            pushAndroidSignIn(device, appID, JSON.stringify(signIn));
        } else {
            const documents = join(capture('xcrun', ['simctl', 'get_app_container', device, appID, 'data']).trim(), 'Documents');
            mkdirSync(documents, {recursive: true});
            writeFileSync(join(documents, EMULATOR_SIGN_IN_FILE), JSON.stringify(signIn), {mode: 0o600});
        }
        session.open(true);
        acceptPermissionAlert(session);
        const deadline = Date.now() + SIGN_IN_TIMEOUT_MS;
        for (;;) {
            try {
                await waitForTab(session, 'Inbox');
                break;
            } catch (error) {
                // The sign-in screen stays visible until Authenticate returns and the account's first data load mounts the tabs.
                if (Date.now() > deadline) {
                    throw error;
                }
            }
            await sleep(2000);
        }
        acceptPermissionAlert(session);
        return writeFixture(await describeAccount(session, signIn.email));
    } finally {
        session.command('close');
    }
}

/** Read the account's own chat and busy room from search, so the workflow needs no fixture secret. */
async function describeAccount(session: JourneyDevice, email: string): Promise<JourneyFixture> {
    const personalChatTitle = await searchFor(session, email, selfChatTitle);
    const reportLabelPrefix = await searchFor(session, BUSY_REPORT.query, (nodes) => roomLabelPrefix(nodes, BUSY_REPORT.title));
    if (process.env.GITHUB_ACTIONS === 'true') {
        // The email is a secret and already masked. Mask the account's names as well.
        for (const value of [personalChatTitle, personalChatTitle.replace(/ \(you\)$/, ''), reportLabelPrefix]) {
            console.log(`::add-mask::${value}`);
        }
    }
    return emulatorJourneyFixture(email, personalChatTitle, reportLabelPrefix);
}

/** Bind the journeys to the CI account, its own "(you)" chat for the training messages, and its busy room. */
function emulatorJourneyFixture(email: string, personalChatTitle: string, reportLabelPrefix: string): JourneyFixture {
    return parseJourneyFixture({
        accountEmail: email,
        accountClass: 'heavy',
        description: 'CI test account on a disposable emulator',
        report: {query: BUSY_REPORT.query, resultLabelPrefix: reportLabelPrefix, title: BUSY_REPORT.title},
        personalChat: {query: email, resultLabelPrefix: `${personalChatTitle}, ${email}`, title: personalChatTitle},
        // The account exists for CI. Each training journey sends two marked messages to its own chat.
        allowMessages: true,
    });
}

async function searchFor(session: JourneyDevice, query: string, read: (nodes: JourneyNode[]) => string | undefined): Promise<string> {
    await showTab(session, 'Inbox');
    session.press(idSelector('searchButton'));
    session.fill('search-autocomplete-text-input', query);
    const deadline = Date.now() + SEARCH_TIMEOUT_MS;
    for (;;) {
        const result = read(session.snapshot());
        if (result) {
            // Leave search the same way on both platforms.
            session.open(true);
            await waitForTab(session, 'Inbox');
            return result;
        }
        if (Date.now() > deadline) {
            fail('The CI account search did not show its own chat or a #announce room. See scripts/pgo/EVALUATION.md for the account requirements.');
        }
        await sleep(500);
    }
}

/** A search for the account email lists its own chat as "<display name> (you), <email or last message>". */
function selfChatTitle(nodes: JourneyNode[]): string | undefined {
    const titles = nodes.flatMap((node) => {
        const match = /^(.+? \(you\)), /.exec(normalizeLabel(node.label));
        return match?.[1] ? [match[1]] : [];
    });
    return uniqueValue(titles, 'chats titled "(you)"');
}

/** A room's search result reads "<room>, <workspace>", optionally followed by " • " and a message preview. */
function roomLabelPrefix(nodes: JourneyNode[], title: string): string | undefined {
    const prefixes = nodes.flatMap((node) => {
        const label = normalizeLabel(node.label);
        return label.startsWith(`${title}, `) ? [label.split(' •').at(0) ?? label] : [];
    });
    return uniqueValue(prefixes, `${title} rooms`);
}

function uniqueValue(values: string[], description: string): string | undefined {
    const unique = [...new Set(values)];
    if (unique.length > 1) {
        fail(`The CI account search shows ${unique.length} ${description}. Change BUSY_REPORT in scripts/pgo/emulatorAccount.ts to a query with one match.`);
    }
    return unique.at(0);
}

function writeFixture(fixture: JourneyFixture): string {
    // Outside the repository, so no uploaded artifact can contain the account email.
    const path = join(mkdtempSync(join(tmpdir(), 'pgo-journey-')), 'fixture.json');
    writeFileSync(path, JSON.stringify(fixture), {mode: 0o600});
    return path;
}

async function waitForAndroidFilesDirectory(device: string, appID: string): Promise<void> {
    const deadline = Date.now() + SIGN_IN_TIMEOUT_MS;
    while (!runAllowFailure('adb', ['-s', device, 'shell', 'test', '-d', androidFilesDirectory(appID)])) {
        if (Date.now() > deadline) {
            fail(`The app did not create ${androidFilesDirectory(appID)} after launching.`);
        }
        await sleep(1000);
    }
}

function pushAndroidSignIn(device: string, appID: string, contents: string): void {
    const temporary = mkdtempSync(join(tmpdir(), 'pgo-sign-in-'));
    try {
        const path = join(temporary, EMULATOR_SIGN_IN_FILE);
        writeFileSync(path, contents, {mode: 0o600});
        run('adb', ['-s', device, 'push', path, `${androidFilesDirectory(appID)}/${EMULATOR_SIGN_IN_FILE}`]);
    } finally {
        rmSync(temporary, {recursive: true, force: true});
    }
}

function androidFilesDirectory(appID: string): string {
    return `/sdcard/Android/data/${appID}/files`;
}

/** The iOS simulator cannot pre-grant notifications, so accept the one prompt a fresh install shows. */
function acceptPermissionAlert(session: JourneyDevice): void {
    if (session.platform !== 'ios') {
        return;
    }
    try {
        session.command('alert', 'wait', '10000');
        session.command('alert', 'accept');
    } catch {
        // No prompt appeared, or it was already answered.
    }
}

export {emulatorJourneyFixture, roomLabelPrefix, selfChatTitle, signInEmulator};
