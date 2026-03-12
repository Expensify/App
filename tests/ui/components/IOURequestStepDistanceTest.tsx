import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import IOURequestStepDistanceWithFullTransactionOrNotFound from '@pages/iou/request/step/IOURequestStepDistance';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import {signInWithTestUser} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/languages/IntlStore', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const en: Record<string, unknown> = require('@src/languages/en').default;
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const flatten: (obj: Record<string, unknown>) => Record<string, unknown> = require('@src/languages/flattenObject').default;
    const cache = new Map<string, Record<string, unknown>>();
    cache.set('en', flatten(en));
    return {
        getCurrentLocale: jest.fn(() => 'en'),
        load: jest.fn(() => Promise.resolve()),
        get: jest.fn((key: string, locale?: string) => {
            const translations = cache.get(locale ?? 'en');
            return translations?.[key] ?? null;
        }),
    };
});

jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('@assets/emojis', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@assets/emojis');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        default: actual.default,
        importEmojiLocale: jest.fn(() => Promise.resolve()),
    };
});

jest.mock('@libs/EmojiTrie', () => ({
    buildEmojisTrie: jest.fn(),
}));

jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => [false],
}));
jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({
        name: 'Money_Request_Step_Distance',
        params: {},
    })),
    getState: jest.fn(() => ({})),
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Distance',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        navigate: jest.fn(),
        goBack: jest.fn(),
        navigationRef: mockRef,
        getActiveRoute: () => '',
    };
});

jest.mock('@react-navigation/native', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Distance',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        createNavigationContainerRef: jest.fn(() => mockRef),
        useIsFocused: () => true,
        useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        didScreenTransitionEnd: true,
    }),
}));

jest.mock('@libs/actions/MapboxToken', () => ({
    init: jest.fn(),
    stop: jest.fn(),
}));

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID = '1';
const TRANSACTION_ID = '101';

function createMinimalReport(reportID: string): Report {
    return {
        reportID,
        ownerAccountID: ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        isPinned: false,
        lastVisibleActionCreated: '',
        lastReadTime: '',
    };
}

describe('IOURequestStepDistance', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        initOnyxDerivedValues();
        return waitForBatchedUpdates();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('renders the distance step with isSelfTourViewed from onyx', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createMinimalReport(REPORT_ID));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            amount: 0,
            comment: {
                waypoints: {
                    waypoint0: {keyForList: 'start_waypoint'},
                    waypoint1: {keyForList: 'stop_waypoint'},
                },
            },
            currency: 'USD',
            created: '2025-01-01',
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
        });
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: true});

        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <LocaleContextProvider>
                        <IOURequestStepDistanceWithFullTransactionOrNotFound
                            route={{
                                key: 'Money_Request_Step_Distance',
                                name: 'Money_Request_Step_Distance',
                                params: {
                                    action: CONST.IOU.ACTION.CREATE,
                                    iouType: CONST.IOU.TYPE.SUBMIT,
                                    reportID: REPORT_ID,
                                    transactionID: TRANSACTION_ID,
                                    backTo: ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, TRANSACTION_ID, REPORT_ID),
                                },
                            }}
                            // @ts-expect-error we don't need navigation param here
                            navigation={undefined}
                        />
                    </LocaleContextProvider>
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        // The component renders successfully with the isSelfTourViewed useOnyx hook
        expect(screen.getByTestId('IOURequestStepDistance')).toBeTruthy();
    });
});
