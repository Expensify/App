import type {JourneyFixture, JourneyReport} from './journeyConfig';
import type {JourneyDevice, JourneyNode} from './journeyDevice';

import {sleep} from '../lib/scriptUtils';
import {idSelector, normalizeLabel} from './journeyDevice';

/** Run only after the user has signed into and approved the fixture's heavy account. */
async function runJourneyWorkload(device: JourneyDevice, fixture: JourneyFixture, runID: string, navigationOnly = false): Promise<void> {
    console.log('Scrolling the full inbox.');
    await showTab(device, 'Inbox');
    if (device.hasLabel('No thanks')) {
        device.pressLabel('No thanks');
    }
    device.pressLabel('All');
    await scrollBothWays(device, fixture.scrolls, true);

    console.log('Opening and scrolling a populated report.');
    await openReport(device, fixture.report);
    await scrollBothWays(device, fixture.scrolls, true, 'up');

    console.log(navigationOnly ? 'Opening the personal chat without sending.' : 'Composing and sending messages in the personal chat.');
    await openReport(device, fixture.personalChat, true);
    for (let messageNumber = 1; messageNumber <= (navigationOnly ? 0 : 2); messageNumber += 1) {
        // Check the destination immediately before every write. Search-result matching alone is insufficient.
        device.waitLabel(fixture.personalChat.title);
        const composer = device.snapshot().find((node) => node.identifier === 'composer');
        if (!composer) {
            throw new Error('The personal chat composer is missing.');
        }
        if (composer.value && composer.value !== 'Write something...') {
            throw new Error('The personal chat contains an existing draft. Clear or send it manually before running the journey.');
        }
        const token = `PGO ${runID} message ${messageNumber}`;
        device.fill('composer', `${token} draft`);
        device.fill('composer', `${token}. Answered by Codex, instructed by Chris.`);
        device.pressLabel('Send');
        await waitForMessage(device, token);
    }

    console.log('Scrolling Spend expenses and reports.');
    await showTab(device, 'Spend');
    device.pressLabel('Expenses');
    device.waitLabel('Filters');
    await scrollBothWays(device, fixture.scrolls, true);
    device.pressLabel('Reports');
    device.waitLabel('Filters');
    await scrollBothWays(device, Math.max(4, Math.floor(fixture.scrolls / 2)), true);
    device.pressLabel('Expenses');

    console.log('Switching tabs and reopening the report.');
    for (let cycle = 0; cycle < fixture.tabCycles; cycle += 1) {
        for (const tab of ['Inbox', 'Spend', 'Workspaces', 'Inbox']) {
            await showTab(device, tab);
        }
    }
    await openReport(device, fixture.report);
    await showTab(device, 'Inbox');
}

/** Check identity before changing preferences; never sign in or switch accounts automatically. */
async function prepareJourney(device: JourneyDevice, fixture: JourneyFixture): Promise<void> {
    // Entering Inbox first allows the app's automatic large-account focus prompt to appear before we check preferences.
    await showTab(device, 'Inbox');
    if (device.hasLabel('No thanks')) {
        device.pressLabel('No thanks');
    }
    await showTab(device, 'Account');
    device.command('scroll', 'top', '--settle');
    try {
        device.waitLabel(fixture.accountEmail);
    } catch {
        throw new Error(`SIGN_IN_REQUIRED: Ask Chris to sign into ${fixture.accountEmail}. The journey cannot run on another account.`);
    }
    device.pressLabel('Preferences');
    await ensureFocusDisabled(device, true);
    device.back();
    await showTab(device, 'Inbox');
    console.log('Verified the approved heavy account and disabled #focus.');
}

/** End-of-run verification rejects a profile if focus was enabled during the workload. */
async function verifyJourneyAccount(device: JourneyDevice, fixture: JourneyFixture): Promise<void> {
    await showTab(device, 'Account');
    device.command('scroll', 'top', '--settle');
    device.waitLabel(fixture.accountEmail);
    device.pressLabel('Preferences');
    await ensureFocusDisabled(device, false);
    device.back();
    await showTab(device, 'Inbox');
}

async function ensureFocusDisabled(device: JourneyDevice, allowChange: boolean): Promise<void> {
    device.waitLabel('Priority mode');
    if (device.hasLabel('Priority mode, Most recent')) {
        return;
    }
    if (!device.hasLabel('Priority mode, #focus')) {
        throw new Error('Cannot verify Priority mode. The journey requires English UI labels and #focus disabled.');
    }
    if (!allowChange) {
        throw new Error('#focus became enabled during the journey. Discard this run and restart after disabling it.');
    }
    device.pressLabel('Priority mode, #focus');
    device.pressLabel('Most recent');
    device.pressLabel('Save');
    device.waitLabel('Priority mode, Most recent');
}

async function openReport(device: JourneyDevice, report: JourneyReport, isPersonalChat = false): Promise<void> {
    await showTab(device, 'Inbox');
    device.press(idSelector('searchButton'));
    device.fill('search-autocomplete-text-input', report.query);
    const deadline = Date.now() + 30_000;
    let resultLabel: string | undefined;
    while (!resultLabel && Date.now() < deadline) {
        resultLabel = findReportResult(device.snapshot(), report.resultLabelPrefix, isPersonalChat ? report.title : undefined);
        if (!resultLabel) {
            await sleep(500);
        }
    }
    if (!resultLabel) {
        throw new Error(`No search result matched ${report.resultLabelPrefix}.`);
    }
    device.pressLabel(resultLabel);
    device.wait(idSelector('composer'));
    device.waitLabel(report.title);
}

async function showTab(device: JourneyDevice, tab: string): Promise<void> {
    // Use app back navigation instead of Android's hardware Back, which can dismiss the keyboard or leave the app.
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const tabLabel = findTabLabel(device.snapshot(), tab);
        if (tabLabel) {
            device.pressLabel(tabLabel);
            return;
        }
        device.back();
        await sleep(300);
    }
    throw new Error(`Cannot return to the ${tab} tab.`);
}

/** iOS appends unread/review status to tab accessibility labels. */
function findTabLabel(nodes: JourneyNode[], tab: string): string | undefined {
    const screenHeight = nodes.find((node) => node.type === 'Application')?.height;
    const candidates = nodes.filter((node) => {
        const label = normalizeLabel(node.label);
        const matches = label === tab || label.startsWith(`${tab}.`) || label.startsWith(`${tab},`);
        return matches && (!screenHeight || node.y >= screenHeight * 0.7);
    });
    if (candidates.length > 1) {
        throw new Error(`Ambiguous ${tab} tab in the accessibility tree.`);
    }
    return candidates.at(0)?.label;
}

async function scrollBothWays(device: JourneyDevice, count: number, requireMovement: boolean, firstDirection: 'up' | 'down' = 'down'): Promise<void> {
    const initialNodes = device.snapshot();
    const pixels = scrollDistance(initialNodes);
    let previous = contentSignature(initialNodes);
    let changed = 0;
    for (const direction of [firstDirection, firstDirection === 'up' ? 'down' : 'up']) {
        let stationary = 0;
        for (let scroll = 0; scroll < count; scroll += 1) {
            device.command('scroll', direction, '--pixels', String(pixels), '--settle');
            const current = contentSignature(device.snapshot());
            if (current !== previous) {
                changed += 1;
                stationary = 0;
            } else {
                stationary += 1;
            }
            previous = current;
            if (stationary === 2) {
                break;
            }
        }
    }
    if (requireMovement && changed < 2) {
        throw new Error('The list did not expose enough changing content. Use a populated heavy-account fixture; do not collect this run.');
    }
}

async function waitForMessage(device: JourneyDevice, token: string): Promise<void> {
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
        const nodes = device.snapshot();
        const composer = nodes.find((node) => node.identifier === 'composer');
        const visibleMessage = nodes.some((node) => node.identifier !== 'composer' && !/EditText|TextField|TextViewInput/i.test(node.type) && node.label.includes(token));
        if (composer && !composer.value.includes(token) && visibleMessage) {
            return;
        }
        await sleep(500);
    }
    throw new Error('The sent message did not appear with an empty composer. Do not retry the send automatically.');
}

function contentSignature(nodes: JourneyNode[]): string {
    return nodes
        .map((node) => normalizeLabel(node.label))
        .filter(Boolean)
        .join('\n');
}

/** Keep both ends of the gesture inside the center of portrait lists, below Spend's fixed header. */
function scrollDistance(nodes: JourneyNode[]): number {
    const scrollAreas = nodes.filter((node) => /ScrollView|RecyclerView|ScrollArea/i.test(node.type) && node.width > 0 && node.height > 0);
    const viewport = scrollAreas.toSorted((left, right) => right.width * right.height - left.width * left.height).at(0);
    if (!viewport) {
        throw new Error('Cannot determine scroll bounds on this device.');
    }
    return Math.round(Math.min(viewport.height * 0.25, viewport.width * 0.6));
}

/** Match stable report identity while allowing the last-message preview to change. */
function findReportResult(nodes: JourneyNode[], prefix: string, personalChatTitle?: string): string | undefined {
    const identity = normalizeLabel(prefix);
    // The fixture binds this title to the signed-in account and an exact email search. A populated self-chat replaces the email subtitle with its last message.
    const personalPrefix = personalChatTitle ? `${normalizeLabel(personalChatTitle)}, ` : undefined;
    const matches = nodes.filter((node) => {
        const label = normalizeLabel(node.label);
        return label === identity || label.startsWith(`${identity} •`) || (personalPrefix !== undefined && label.startsWith(personalPrefix));
    });
    if (matches.length > 1) {
        throw new Error(`Ambiguous report search: ${prefix}. Use a more specific fixture.`);
    }
    return matches.at(0)?.label;
}

export {findReportResult, findTabLabel, prepareJourney, runJourneyWorkload, scrollDistance, verifyJourneyAccount};
