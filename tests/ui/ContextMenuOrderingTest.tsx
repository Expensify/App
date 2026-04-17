import {PortalProvider} from '@gorhom/portal';
import * as NativeNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import type {RenderResult} from '@testing-library/react-native';
import React, {useRef} from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import DelegateNoAccessModalProvider from '@components/DelegateNoAccessModalProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import PopoverReportActionContent from '@pages/inbox/report/ContextMenu/PopoverContextMenu/PopoverReportActionContent';
import PopoverReportContent from '@pages/inbox/report/ContextMenu/PopoverContextMenu/PopoverReportContent';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@react-navigation/native');

const CURRENT_USER_ACCOUNT_ID = 11111111;
const CURRENT_USER_EMAIL = 'me@test.com';
const OTHER_USER_ACCOUNT_ID = 22222222;
const OTHER_USER_EMAIL = 'other@test.com';
const REPORT_ID = 'testReport';

/**
 * Collect rendered context-menu items in tree order, de-duplicated by
 * `sentryLabel` (since the prop propagates through several nested wrappers
 * — MenuItem → PressableWithSecondaryInteraction → … — all of which expose
 * the same `sentryLabel`).
 */
function collectSentryLabels(root: RenderResult['root']): string[] {
    const matches = root.findAll((el) => {
        const label: unknown = el.props?.sentryLabel;
        return typeof label === 'string' && label.startsWith('ContextMenu-');
    });
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const match of matches) {
        const label = match.props.sentryLabel as string;
        if (seen.has(label)) {
            continue;
        }
        seen.add(label);
        ordered.push(label);
    }
    return ordered;
}

function buildTextCommentAction(overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: '100',
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        actorAccountID: OTHER_USER_ACCOUNT_ID,
        created: '2026-04-15 09:00:00.000',
        automatic: false,
        shouldShow: true,
        avatar: '',
        person: [{type: 'TEXT', style: 'strong', text: OTHER_USER_EMAIL}],
        message: [{type: 'COMMENT', html: '<p>hello world</p>', text: 'hello world'}],
        originalMessage: {html: '<p>hello world</p>'},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(overrides as any),
    } as ReportAction;
}

function PopoverReportActionContentHarness({reportActionID = '100'}: {reportActionID?: string | undefined}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentRef = useRef<any>(null);
    return (
        <PopoverReportActionContent
            reportID={REPORT_ID}
            reportActionID={reportActionID}
            originalReportID={REPORT_ID}
            draftMessage=""
            selection=""
            contextMenuTargetNode={null}
            onEmojiPickerToggle={undefined}
            hideAndRun={() => {}}
            setLocalShouldKeepOpen={() => {}}
            contentRef={contentRef}
            shouldEnableArrowNavigation={false}
        />
    );
}

function PopoverReportContentHarness() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentRef = useRef<any>(null);
    return (
        <PopoverReportContent
            reportID={REPORT_ID}
            reportActionID={undefined}
            originalReportID={REPORT_ID}
            hideAndRun={() => {}}
            contentRef={contentRef}
            shouldEnableArrowNavigation={false}
        />
    );
}

function renderWithProviders(element: React.ReactElement) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <OptionsListContextProvider>
                <DelegateNoAccessModalProvider>
                    <ScreenWrapper testID="test">
                        <PortalProvider>{element}</PortalProvider>
                    </ScreenWrapper>
                </DelegateNoAccessModalProvider>
            </OptionsListContextProvider>
        </ComposeProviders>,
    );
}

describe('Context menu item ordering', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({key: '', name: ''});
    });

    beforeEach(async () => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {
                accountID: CURRENT_USER_ACCOUNT_ID,
                email: CURRENT_USER_EMAIL,
                encryptedAuthToken: 'fake-token',
            });
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [CURRENT_USER_ACCOUNT_ID]: {
                    accountID: CURRENT_USER_ACCOUNT_ID,
                    login: CURRENT_USER_EMAIL,
                    displayName: CURRENT_USER_EMAIL,
                },
                [OTHER_USER_ACCOUNT_ID]: {
                    accountID: OTHER_USER_ACCOUNT_ID,
                    login: OTHER_USER_EMAIL,
                    displayName: OTHER_USER_EMAIL,
                },
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    async function seedReport(report: Partial<Report>, reportActions: Record<string, ReportAction>) {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                reportID: REPORT_ID,
                chatType: undefined,
                ...report,
            } as Report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, reportActions);
        });
        await waitForBatchedUpdatesWithAct();
    }

    describe('PopoverReportActionContent (right-click on a message)', () => {
        it('renders items in the canonical order for a plain comment by another user', async () => {
            const action = buildTextCommentAction({actorAccountID: OTHER_USER_ACCOUNT_ID});
            await seedReport({}, {[action.reportActionID]: action});

            const {root} = renderWithProviders(<PopoverReportActionContentHarness />);
            await waitForBatchedUpdatesWithAct();

            // Another user's action defaults to HIDDEN notification preference, so
            // Join thread is offered between Mark as unread and Copy message.
            expect(collectSentryLabels(root)).toEqual([
                CONST.SENTRY_LABEL.CONTEXT_MENU.REPLY_IN_THREAD,
                CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_UNREAD,
                CONST.SENTRY_LABEL.CONTEXT_MENU.JOIN_THREAD,
                CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_MESSAGE,
                CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_LINK,
                CONST.SENTRY_LABEL.CONTEXT_MENU.FLAG_AS_OFFENSIVE,
            ]);
        });

        it('renders items in the canonical order for the current user’s own comment', async () => {
            const action = buildTextCommentAction({actorAccountID: CURRENT_USER_ACCOUNT_ID, reportActionID: '101'});
            await seedReport({}, {[action.reportActionID]: action});

            const {root} = renderWithProviders(<PopoverReportActionContentHarness reportActionID="101" />);
            await waitForBatchedUpdatesWithAct();

            // The current user is treated as the creator of their own action, so
            // Leave thread surfaces between Edit and Copy message.
            expect(collectSentryLabels(root)).toEqual([
                CONST.SENTRY_LABEL.CONTEXT_MENU.REPLY_IN_THREAD,
                CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_UNREAD,
                CONST.SENTRY_LABEL.CONTEXT_MENU.EDIT_COMMENT,
                CONST.SENTRY_LABEL.CONTEXT_MENU.LEAVE_THREAD,
                CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_MESSAGE,
                CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_LINK,
                CONST.SENTRY_LABEL.CONTEXT_MENU.DELETE,
            ]);
        });

        it('renders only the overflow "Menu" item when no reportAction is supplied', async () => {
            await seedReport({}, {});

            const {root} = renderWithProviders(<PopoverReportActionContentHarness reportActionID={undefined} />);
            await waitForBatchedUpdatesWithAct();

            expect(collectSentryLabels(root)).toEqual([CONST.SENTRY_LABEL.CONTEXT_MENU.MENU]);
        });
    });

    describe('PopoverReportContent (right-click on a report row)', () => {
        it('renders items in the canonical order for a read, unpinned chat', async () => {
            await seedReport(
                {
                    isPinned: false,
                    lastMessageText: 'hello',
                    lastReadTime: '2100-01-01 00:00:00.000',
                    lastVisibleActionCreated: '2020-01-01 00:00:00.000',
                },
                {},
            );

            const {root} = renderWithProviders(<PopoverReportContentHarness />);
            await waitForBatchedUpdatesWithAct();

            expect(collectSentryLabels(root)).toEqual([CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_UNREAD, CONST.SENTRY_LABEL.CONTEXT_MENU.PIN]);
        });

        it('renders Mark as read and Unpin for an unread, pinned chat', async () => {
            await seedReport(
                {
                    isPinned: true,
                    lastMessageText: 'hello',
                    lastReadTime: '2020-01-01 00:00:00.000',
                    lastVisibleActionCreated: '2100-01-01 00:00:00.000',
                },
                {},
            );

            const {root} = renderWithProviders(<PopoverReportContentHarness />);
            await waitForBatchedUpdatesWithAct();

            expect(collectSentryLabels(root)).toEqual([CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_READ, CONST.SENTRY_LABEL.CONTEXT_MENU.UNPIN]);
        });
    });
});
