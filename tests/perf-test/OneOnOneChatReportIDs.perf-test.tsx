import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as MoneyRequest from '@libs/actions/IOU/MoneyRequest';
import {buildParticipantsFromAccountIDs} from '@libs/ReportUtils';

import IOURequestStepConfirmationWithWritableReportOrNotFound from '@pages/iou/request/step/IOURequestStepConfirmation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';
import {measureAsyncFunction, measureRenders} from 'reassure';

import createMockScreenNavigation from '../utils/createMockScreenNavigation';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

jest.mock('@src/languages/IntlStore', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const en: Record<string, unknown> = require('@src/languages/en').default;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const flatten: (obj: Record<string, unknown>) => Record<string, unknown> = require('@src/languages/flattenObject').default;
    const cache = new Map<string, Record<string, unknown>>();
    cache.set('en', flatten(en));
    return {
        getCurrentLocale: jest.fn(() => 'en'),
        getDateFnsLocale: jest.fn(() => undefined),
        load: jest.fn(() => Promise.resolve()),
        get: jest.fn((key: string, locale?: string) => {
            const translations = cache.get(locale ?? 'en');
            return translations?.[key] ?? null;
        }),
    };
});

jest.mock('@assets/emojis', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@assets/emojis');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        default: actual.default,
        importEmojiLocale: jest.fn(() => Promise.resolve()),
    };
});

jest.mock('@libs/EmojiTrie', () => ({
    buildEmojisTrie: jest.fn(),
}));
jest.mock('@libs/actions/IOU/MoneyRequest', () => {
    const actual = jest.requireActual<typeof MoneyRequest>('@libs/actions/IOU/MoneyRequest');
    return {
        ...actual,
        startMoneyRequest: jest.fn(),
    };
});
jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => [false],
}));

jest.mock('@src/hooks/useResponsiveLayout');
jest.mock('@libs/getCurrentPosition');
jest.mock('@libs/getIsNarrowLayout', () => jest.fn(() => false));

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Confirmation',
            params: {},
        })),
        getState: jest.fn(() => ({})),
        getRootState: jest.fn(() => ({routes: []})),
    },
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Confirmation',
            params: {},
        })),
        getState: jest.fn(() => ({})),
        getRootState: jest.fn(() => ({routes: []})),
    };
    return {
        navigate: jest.fn(),
        goBack: jest.fn(),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        dismissModal: jest.fn((options?: {afterTransition?: () => void}) => {
            options?.afterTransition?.();
        }),
        dismissModalWithReport: jest.fn(),
        dismissToPreviousRHP: jest.fn((options?: {afterTransition?: () => void}) => {
            options?.afterTransition?.();
        }),
        setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
        getIsFullscreenPreInsertedUnderRHP: jest.fn(() => false),
        getPreInsertedFullscreenRouteName: jest.fn(() => undefined),
        clearFullscreenPreInsertedFlag: jest.fn(),
        revealRouteBeforeDismissingModal: jest.fn((_route: unknown, options?: {afterTransition?: () => void}) => {
            options?.afterTransition?.();
        }),
        getTopmostReportId: jest.fn(() => undefined),
        preInsertFullscreenUnderRHP: jest.fn(),
        removePreInsertedFullscreenIfNeeded: jest.fn(),
        isTopmostRouteModalScreen: jest.fn(() => false),
        navigationRef: mockRef,
    };
});

jest.mock('@react-navigation/native', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Confirmation',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
        createNavigationContainerRef: jest.fn(() => mockRef),
        useIsFocused: () => true,
        useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

const {navigation: mockNavigation} = createMockScreenNavigation();

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const RECIPIENT_ACCOUNT_ID = 2;
const RECIPIENT_LOGIN = 'recipient@user.com';
const OTHER_ACCOUNT_ID_START = 1000;
const LARGE_REPORT_COUNT = 5000;
const WRITES_PER_SCENARIO = 10;
const CHAT_REPORT_ID = 'p2p-chat';
const IOU_REPORT_ID = 'p2p-iou-report';
const TRANSACTION_ID = 'p2p-transaction';
const UNRELATED_REPORT_ID = '1';

/** Thousands of chats, most of them DMs with other people, so a lookup by participants has a real collection to index */
function buildReports(label: string): Record<string, Report> {
    const reports: Record<string, Report> = {};
    for (let index = 0; index < LARGE_REPORT_COUNT; index++) {
        const reportID = String(index + 1);
        const otherAccountIDs = index % 5 === 0 ? [OTHER_ACCOUNT_ID_START + index, OTHER_ACCOUNT_ID_START + index + 1] : [OTHER_ACCOUNT_ID_START + index];
        reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {
            reportID,
            type: CONST.REPORT.TYPE.CHAT,
            participants: buildParticipantsFromAccountIDs([ACCOUNT_ID, ...otherAccountIDs]),
            lastMessageText: `${label} ${reportID}`,
        };
    }
    reports[`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`] = {
        reportID: CHAT_REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
        participants: buildParticipantsFromAccountIDs([ACCOUNT_ID, RECIPIENT_ACCOUNT_ID]),
    };
    reports[`${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`] = {
        reportID: IOU_REPORT_ID,
        chatReportID: CHAT_REPORT_ID,
        type: CONST.REPORT.TYPE.IOU,
        ownerAccountID: ACCOUNT_ID,
        managerID: RECIPIENT_ACCOUNT_ID,
    };
    return reports;
}

async function seed() {
    await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: ACCOUNT_LOGIN});
    await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: ACCOUNT_LOGIN, displayName: 'Me'},
        [RECIPIENT_ACCOUNT_ID]: {accountID: RECIPIENT_ACCOUNT_ID, login: RECIPIENT_LOGIN, displayName: 'Recipient'},
    });
    await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
        transactionID: TRANSACTION_ID,
        reportID: IOU_REPORT_ID,
        amount: 1000,
        isAmountSet: true,
        currency: 'USD',
        merchant: 'Test',
        created: '2025-01-15',
        iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
        participants: [{accountID: RECIPIENT_ACCOUNT_ID, reportID: CHAT_REPORT_ID, selected: true}],
    });
    await Onyx.setCollection(ONYXKEYS.COLLECTION.REPORT, buildReports('seed'));
    await waitForBatchedUpdates();
}

/** Passed as the reassure wrapper so the providers sit outside the profiler and the counts are the page's own */
function Providers({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, HTMLEngineProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>{children}</ComposeProviders>;
}

function ConfirmationPage() {
    return (
        <IOURequestStepConfirmationWithWritableReportOrNotFound
            route={{
                key: 'Money_Request_Step_Confirmation',
                name: 'Money_Request_Step_Confirmation',
                params: {
                    action: CONST.IOU.ACTION.CREATE,
                    iouType: CONST.IOU.TYPE.SUBMIT,
                    transactionID: TRANSACTION_ID,
                    reportID: IOU_REPORT_ID,
                },
            }}
            navigation={mockNavigation}
        />
    );
}

async function mountScenario() {
    await waitForBatchedUpdatesWithAct();
}

async function writeUnrelatedReport(label: string) {
    for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${UNRELATED_REPORT_ID}`, {lastMessageText: `${label} ${index}`});
        await waitForBatchedUpdates();
    }
}

describe('IOURequestStepConfirmation P2P chat lookup with a large report collection', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        require('@userActions/OnyxDerived').default();
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await seed();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    test('[OneOnOneChatReportIDs] should mount the confirmation page after every report was replaced', async () => {
        // Given 5000 reports, all replaced by new objects before each mount, as after sign in or a full reconnect
        let run = 0;
        const replaceAllReports = async () => {
            await Onyx.setCollection(ONYXKEYS.COLLECTION.REPORT, buildReports(`replaced ${run}`));
            await waitForBatchedUpdates();
            run++;
        };

        // When the confirmation page mounts for an expense to the recipient, so it looks up their existing chat
        // Then reassure measures the mount, which pays any lookup work that wasn't done before it
        await measureRenders(<ConfirmationPage />, {beforeEach: replaceAllReports, scenario: mountScenario, wrapper: Providers});
    });

    test('[OneOnOneChatReportIDs] should mount the confirmation page after one report changed', async () => {
        // Given 5000 reports, one of them changed before each mount, as in normal use between two expenses
        let run = 0;
        const changeOneReport = async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${UNRELATED_REPORT_ID}`, {lastMessageText: `changed ${run}`});
            await waitForBatchedUpdates();
            run++;
        };

        // When the confirmation page mounts for an expense to the recipient
        // Then reassure measures the mount
        await measureRenders(<ConfirmationPage />, {beforeEach: changeOneReport, scenario: mountScenario, wrapper: Providers});
    });

    test('[OneOnOneChatReportIDs] should re-render the mounted confirmation page on writes to an unrelated report', async () => {
        // Given the confirmation page mounted over 5000 reports
        let run = 0;
        const scenario = async () => {
            await waitForBatchedUpdatesWithAct();

            // When an unrelated chat gets new messages, which leaves the recipient's chat unchanged
            await writeUnrelatedReport(`render ${run}`);
            run++;
        };

        // Then reassure measures what those writes cost the page
        await measureRenders(<ConfirmationPage />, {scenario, wrapper: Providers});
    });

    test('[OneOnOneChatReportIDs] should process writes to an unrelated report while the confirmation page is mounted', async () => {
        // Given the confirmation page mounted over 5000 reports
        render(
            <Providers>
                <ConfirmationPage />
            </Providers>,
        );
        await waitForBatchedUpdatesWithAct();

        // When an unrelated chat gets new messages repeatedly
        let run = 0;
        const writeMessages = async () => {
            await writeUnrelatedReport(`timed ${run}`);
            run++;
        };

        // Then reassure times the whole write loop, including work done outside React renders such as derived computes and their writes
        await measureAsyncFunction(writeMessages);
    });

    test('[OneOnOneChatReportIDs] should process writes to an unrelated report while the confirmation page is not mounted', async () => {
        // Given 5000 reports and no confirmation page, as during most of the app's life
        let run = 0;
        const writeMessages = async () => {
            await writeUnrelatedReport(`unmounted ${run}`);
            run++;
        };

        // When an unrelated chat gets new messages repeatedly
        // Then reassure times the write loop, which is the background cost of keeping the lookup ready
        await measureAsyncFunction(writeMessages);
    });
});
