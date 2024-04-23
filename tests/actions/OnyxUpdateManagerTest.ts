import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import type {AppActionsMock} from '@libs/actions/__mocks__/App';
import * as AppImport from '@libs/actions/App';
import applyOnyxUpdatesReliably from '@libs/actions/applyOnyxUpdatesReliably';
import * as OnyxUpdateManagerExports from '@libs/actions/OnyxUpdateManager';
import type {DeferredUpdatesDictionary} from '@libs/actions/OnyxUpdateManager/types';
import type {ApplyUpdatesMock} from '@libs/actions/OnyxUpdateManager/utils/__mocks__/applyUpdates';
import * as ApplyUpdatesImport from '@libs/actions/OnyxUpdateManager/utils/applyUpdates';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import createOnyxMockUpdate from '../utils/createOnyxMockUpdate';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/App');
jest.mock('@libs/actions/OnyxUpdateManager/utils');
jest.mock('@libs/actions/OnyxUpdateManager/utils/applyUpdates', () => {
    const ApplyUpdatesImplementation: typeof ApplyUpdatesImport = jest.requireActual('@libs/actions/OnyxUpdateManager/utils/applyUpdates');

    return {
        applyUpdates: jest.fn((updates: DeferredUpdatesDictionary) => ApplyUpdatesImplementation.applyUpdates(updates)),
    };
});

const App = AppImport as AppActionsMock;
const ApplyUpdates = ApplyUpdatesImport as ApplyUpdatesMock;

const TEST_USER_ACCOUNT_ID = 1;
const REPORT_ID = 'testReport1';
const ONYX_KEY = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const;

const exampleReportAction: Partial<OnyxTypes.ReportAction> = {
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    actorAccountID: TEST_USER_ACCOUNT_ID,
    automatic: false,
    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
    message: [{type: 'COMMENT', html: 'Testing a comment', text: 'Testing a comment', translationKey: ''}],
    person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
    shouldShow: true,
};

const initialData = {report1: exampleReportAction, report2: exampleReportAction, report3: exampleReportAction} as OnyxTypes.ReportActions;

const mockUpdate2 = createOnyxMockUpdate(2, [
    {
        onyxMethod: OnyxUtils.METHOD.MERGE,
        key: ONYX_KEY,
        value: {
            report1: null,
        },
    },
]);

const report2PersonDiff = [
    {type: 'TEXT', style: 'light', text: 'Other Test User'},
    {type: 'TEXT', style: 'light', text: 'Other Test User 2'},
];
const mockUpdate3 = createOnyxMockUpdate(3, [
    {
        onyxMethod: OnyxUtils.METHOD.MERGE,
        key: ONYX_KEY,
        value: {
            report2: {
                person: report2PersonDiff,
            },
            report3: {
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_5.png',
            },
        },
    },
]);
const mockUpdate4 = createOnyxMockUpdate(4, [
    {
        onyxMethod: OnyxUtils.METHOD.MERGE,
        key: ONYX_KEY,
        value: {
            report3: null,
        },
    },
]);

OnyxUpdateManager();

describe('actions/OnyxUpdateManager', () => {
    let reportActions: OnyxEntry<OnyxTypes.ReportActions>;
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        Onyx.connect({
            key: ONYX_KEY,
            callback: (val) => (reportActions = val),
        });
    });

    beforeEach(async () => {
        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
        global.fetch = TestHelper.getGlobalFetchMock();
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 1);
        await Onyx.set(ONYX_KEY, initialData);

        App.mockValues.missingOnyxUpdatesToBeApplied = undefined;
        OnyxUpdateManagerExports.resetDeferralLogicVariables();
        return waitForBatchedUpdates();
    });

    it('should trigger Onyx update gap handling', async () => {
        App.mockValues.missingOnyxUpdatesToBeApplied = [mockUpdate3];

        applyOnyxUpdatesReliably(mockUpdate2);
        applyOnyxUpdatesReliably(mockUpdate4);
        applyOnyxUpdatesReliably(mockUpdate3);

        return OnyxUpdateManagerExports.queryPromise.then(() => {
            const expectedResult: Record<string, Partial<OnyxTypes.ReportAction>> = {
                report2: {
                    ...exampleReportAction,
                    person: report2PersonDiff,
                },
            };

            expect(reportActions).toEqual(expectedResult);

            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
        });
    });
});
