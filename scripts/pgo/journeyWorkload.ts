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
    selectAllInboxFilter(device);
    await scrollBothWays(device, fixture.scrolls, true);

    console.log('Opening and scrolling a populated report.');
    await openReport(device, fixture.report);
    await scrollBothWays(device, fixture.scrolls, true, 'up');

    console.log(navigationOnly ? 'Opening the personal chat without sending.' : 'Composing and sending messages in the personal chat.');
    await openReport(device, fixture.personalChat, true);
    for (let messageNumber = 1; messageNumber <= (navigationOnly ? 0 : 2); messageNumber += 1) {
        // Check the destination immediately before every write. Search-result matching alone is insufficient.
        if (!device.hasLabel(fixture.personalChat.title)) {
            throw new Error('The personal chat title is not visible before sending.');
        }
        const composer = device.snapshot().find((node) => node.identifier === 'composer');
        if (!composer) {
            throw new Error('The personal chat composer is missing.');
        }
        if (composer.value && composer.value !== 'Write something...') {
            throw new Error('The personal chat contains an existing draft. Clear or send it manually before running the journey.');
        }
        const token = `PGO ${runID} message ${messageNumber}`;
        if (device.platform === 'android') {
            device.fill('composer', `${token} draft`);
        }
        device.fill('composer', `${token}. Answered by Codex, instructed by Chris.`);
        device.pressLabel('Send');
        await waitForMessage(device, token);
    }

    console.log('Scrolling Spend expenses and reports.');
    await showTab(device, 'Spend');
    selectSpendSection(device, 'Expenses');
    device.waitLabel('Filters');
    await scrollBothWays(device, fixture.scrolls, true);
    selectSpendSection(device, 'Reports');
    device.waitLabel('Filters');
    await scrollBothWays(device, Math.max(4, Math.floor(fixture.scrolls / 2)), true);
    selectSpendSection(device, 'Expenses');

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
    if (!device.hasLabel(fixture.accountEmail)) {
        throw new Error(`SIGN_IN_REQUIRED: Ask Chris to sign into ${fixture.accountEmail}. The journey cannot run on another account.`);
    }
    pressPreferences(device);
    await ensureFocusDisabled(device, true);
    pressInAppBack(device);
    await showTab(device, 'Inbox');
    console.log('Verified the approved heavy account and disabled #focus.');
}

/** End-of-run verification rejects a profile if focus was enabled during the workload. */
async function verifyJourneyAccount(device: JourneyDevice, fixture: JourneyFixture): Promise<void> {
    await showTab(device, 'Account');
    device.command('scroll', 'top', '--settle');
    if (!device.hasLabel(fixture.accountEmail)) {
        throw new Error(`The account changed during the journey. Expected ${fixture.accountEmail}; discard this run.`);
    }
    pressPreferences(device);
    await ensureFocusDisabled(device, false);
    pressInAppBack(device);
    await showTab(device, 'Inbox');
}

async function ensureFocusDisabled(device: JourneyDevice, allowChange: boolean): Promise<void> {
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
    if (!device.hasLabel(report.title)) {
        throw new Error(`The opened report does not show the expected title ${report.title}.`);
    }
}

async function showTab(device: JourneyDevice, tab: string): Promise<void> {
    // Use app back navigation instead of Android's hardware Back, which can dismiss the keyboard or leave the app.
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const tabNode = findTabNode(device.snapshot(), tab);
        if (tabNode) {
            device.command('press', String(Math.round(tabNode.x + tabNode.width / 2)), String(Math.round(tabNode.y + tabNode.height / 2)), '--settle');
            return;
        }
        pressInAppBack(device);
        await sleep(300);
    }
    throw new Error(`Cannot return to the ${tab} tab.`);
}

function selectAllInboxFilter(device: JourneyDevice): void {
    const tapPoint = allFilterTapPoint(device.snapshot());
    if (tapPoint) {
        device.command('press', String(tapPoint.x), String(tapPoint.y), '--settle');
        return;
    }
    device.pressLabel('All');
}

function pressPreferences(device: JourneyDevice): void {
    const cell = device.snapshot().filter((node) => normalizeLabel(node.label) === 'Preferences' && node.type === 'Cell' && node.width > 0 && node.height > 0);
    const preferenceCell = cell.length === 1 ? cell.at(0) : undefined;
    if (preferenceCell) {
        device.command('press', String(Math.round(preferenceCell.x + preferenceCell.width / 2)), String(Math.round(preferenceCell.y + preferenceCell.height / 2)), '--settle');
        return;
    }
    device.pressLabel('Preferences');
}

function pressInAppBack(device: JourneyDevice): void {
    if (device.platform === 'ios') {
        const tapPoint = inAppBackTapPoint(device.snapshot());
        if (tapPoint) {
            device.command('press', String(tapPoint.x), String(tapPoint.y), '--settle');
            return;
        }
    }
    device.back();
}

/** The iOS search Back button remains visible but is reported non-hittable while the keyboard is open. */
function inAppBackTapPoint(nodes: JourneyNode[]): {x: number; y: number} | undefined {
    const screen = nodes.find((node) => node.type === 'Application');
    if (!screen) {
        return undefined;
    }
    const candidates = nodes.filter(
        (node) =>
            node.type === 'Button' &&
            normalizeLabel(node.label) === 'Back' &&
            node.enabled &&
            node.width > 0 &&
            node.height > 0 &&
            node.x >= 0 &&
            node.y >= 0 &&
            node.x < screen.width * 0.25 &&
            node.y < screen.height * 0.2,
    );
    if (candidates.length > 1) {
        throw new Error('Ambiguous in-app Back control on iOS.');
    }
    const back = candidates.at(0);
    return back ? {x: Math.round(back.x + back.width / 2), y: Math.round(back.y + back.height / 2)} : undefined;
}

function selectSpendSection(device: JourneyDevice, section: 'Expenses' | 'Reports'): void {
    const tapPoint = spendSectionTapPoint(device.snapshot(), section);
    if (tapPoint) {
        device.command('press', String(tapPoint.x), String(tapPoint.y), '--settle');
        return;
    }
    device.pressLabel(section);
}

/** On iOS, Expenses labels the whole horizontal strip while Reports has its own bounds. */
function spendSectionTapPoint(nodes: JourneyNode[], section: 'Expenses' | 'Reports'): {x: number; y: number} | undefined {
    const screenWidth = nodes.find((node) => node.type === 'Application')?.width;
    if (!screenWidth || !nodes.some((node) => normalizeLabel(node.label) === 'Expenses' && node.type === 'Cell' && node.width >= screenWidth * 0.8)) {
        return undefined;
    }
    const reports = nodes.find((node) => normalizeLabel(node.label) === 'Reports' && node.x > 0 && node.height > 0);
    if (!reports) {
        throw new Error('Cannot locate the Expenses and Reports segments in Spend.');
    }
    return {x: Math.round(section === 'Reports' ? reports.x + reports.width / 2 : reports.x / 2), y: Math.round(reports.y + reports.height / 2)};
}

/** iOS exposes the whole filter strip as the All cell; its center lands on Unread. */
function allFilterTapPoint(nodes: JourneyNode[]): {x: number; y: number} | undefined {
    const screenWidth = nodes.find((node) => node.type === 'Application')?.width;
    if (!screenWidth || !nodes.some((node) => normalizeLabel(node.label) === 'All' && node.width >= screenWidth * 0.8)) {
        return undefined;
    }
    const unread = nodes.find((node) => normalizeLabel(node.label) === 'Unread' && node.x > 0 && node.height > 0);
    if (!unread) {
        throw new Error('Cannot locate the All filter inside the iOS Inbox strip.');
    }
    return {x: Math.round(unread.x / 2), y: Math.round(unread.y + unread.height / 2)};
}

/** iOS appends unread/review status to tab accessibility labels. */
function findTabNode(nodes: JourneyNode[], tab: string): JourneyNode | undefined {
    const screen =
        nodes.find((node) => node.type === 'Application') ??
        nodes
            .filter((node) => node.x === 0 && node.y === 0 && node.width > 0 && node.height > 0)
            .toSorted((left, right) => right.width * right.height - left.width * left.height)
            .at(0);
    const candidates = nodes.filter((node) => {
        const label = normalizeLabel(node.label);
        const matches = label === tab || label.startsWith(`${tab}.`) || label.startsWith(`${tab},`);
        return matches && (!screen || (node.y >= screen.height * 0.7 && node.width >= screen.width * 0.1 && node.height >= screen.height * 0.05));
    });
    const first = candidates.at(0);
    const duplicatedNode =
        first &&
        candidates.every(
            (node) =>
                node.type === first.type &&
                normalizeLabel(node.label) === normalizeLabel(first.label) &&
                node.x === first.x &&
                node.y === first.y &&
                node.width === first.width &&
                node.height === first.height,
        );
    if (candidates.length > 1 && !duplicatedNode) {
        throw new Error(`Ambiguous ${tab} tab in the accessibility tree.`);
    }
    return first;
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
    const screenHeight = nodes.find((node) => node.type === 'Application')?.height;
    return nodes
        .filter((node) => !screenHeight || (node.y + node.height > screenHeight * 0.13 && node.y < screenHeight * 0.88))
        .filter((node) => !!normalizeLabel(node.label))
        .map((node) => `${normalizeLabel(node.label)}:${Math.round(node.y / 8)}`)
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

export {
    allFilterTapPoint,
    contentSignature,
    findReportResult,
    findTabNode,
    inAppBackTapPoint,
    prepareJourney,
    runJourneyWorkload,
    scrollDistance,
    spendSectionTapPoint,
    verifyJourneyAccount,
};
