/** Browser coverage for replacements that arrive before the composer receives a selection change. */
/* eslint-disable testing-library/prefer-screen-queries -- These queries use Playwright's page, not a Testing Library render result. */
import {expect, test} from '@playwright/test';

test.beforeEach(async ({page, baseURL}) => {
    // Keep the fixture local: no backend, real account, or outgoing API requests are needed to edit a draft.
    await page.route('**/*', (route) => (new URL(route.request().url()).origin === baseURL ? route.continue() : route.abort()));
    await page.goto('/');
    await page.waitForFunction(() => !!window.Onyx);
    await page.evaluate(() => {
        window.Onyx.multiSet({
            account: {validated: true},
            personalDetailsList: {106439: {accountID: 106439, login: 'emoji106439@example.com', displayName: 'Emoji Test'}},
            nvp_onboarding: {hasCompletedGuidedSetupFlow: true},
            isLoadingApp: false,
            hasLoadedApp: true,
            network: {isOffline: true},
            report_106439: {
                reportID: '106439',
                reportName: 'Emoji test',
                type: 'chat',
                chatType: 'selfDM',
                participantAccountIDs: [106439],
                participants: {106439: {notificationPreference: 'always'}},
                lastReadTime: '2026-11-10 00:00:00',
                lastVisibleActionCreated: '2026-11-10 00:00:00',
            },
            reportActions_106439: {},
            session: {accountID: 106439, email: 'emoji106439@example.com', authToken: 'offline-fixture-106439'},
        });
    });
    await expect(page.getByRole('tab', {name: 'Inbox', exact: true})).toBeVisible();
    await page.goto('/r/106439');
    await expect(page.locator('[contenteditable=true]')).toBeVisible();
    const dismiss = page.getByRole('button', {name: 'Dismiss', exact: true});
    if (await dismiss.isVisible()) {
        await dismiss.click();
    }
});

for (const {initial, start, end, replacement, expected, continued} of [
    {initial: 'smile', start: 0, end: 5, replacement: '😊', expected: '😊 ', continued: '😊 !'},
    {initial: 'hello smile friend', start: 6, end: 11, replacement: '😊', expected: 'hello 😊 friend'},
    {initial: 'smile', start: 0, end: 5, replacement: '👩🏽‍💻', expected: '👩🏽‍💻 ', continued: '👩🏽‍💻 !'},
    {initial: 'smile', start: 5, end: 5, replacement: '😊', expected: 'smile😊 ', continued: 'smile😊 !'},
]) {
    test(`replaces [${start}, ${end}] in ${initial} with ${replacement}`, async ({page}) => {
        // Given a draft whose cached caret is at the end, as it is before a keyboard suggestion replaces a word.
        const composer = page.locator('[contenteditable=true]');
        await composer.fill(initial);
        await composer.press('End');
        await expect.poll(() => composer.evaluate((element) => element.selection)).toEqual({start: initial.length, end: initial.length});

        // When Chrome replaces a range synchronously, its input event can precede selectionchange.
        // execCommand uses the browser's editing engine; dispatching a synthetic input alone would not edit the DOM.
        await composer.evaluate(
            (element, rangeToReplace) => {
                const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
                const range = document.createRange();
                let offset = 0;
                while (walker.nextNode()) {
                    const node = walker.currentNode;
                    const length = node.textContent.length;
                    if (rangeToReplace.start >= offset && rangeToReplace.start <= offset + length) {
                        range.setStart(node, rangeToReplace.start - offset);
                    }
                    if (rangeToReplace.end >= offset && rangeToReplace.end <= offset + length) {
                        range.setEnd(node, rangeToReplace.end - offset);
                        break;
                    }
                    offset += length;
                }
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                document.execCommand('insertText', false, rangeToReplace.replacement);
            },
            {start, end, replacement},
        );

        // Then the draft preserves the replacement, including the composer's normal space after an inserted emoji.
        await expect(composer).toHaveText(expected);
        await expect.poll(() => composer.evaluate((element) => element.value)).toBe(expected);
        if (continued) {
            await composer.press('!');
            await expect(composer).toHaveText(continued);
        }
    });
}
