import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import type {AppActionsMock} from '@libs/actions/__mocks__/App';

/* eslint-disable-next-line no-restricted-syntax */
import * as AppImport from '@libs/actions/App';
import applyOnyxUpdatesReliably from '@libs/actions/applyOnyxUpdatesReliably';
import {queryPromise, resetDeferralLogicVariables} from '@libs/actions/OnyxUpdateManager';
import type {DeferredUpdatesDictionary} from '@libs/actions/OnyxUpdateManager/types';

/* eslint-disable-next-line no-restricted-syntax */
import * as OnyxUpdateManagerUtilsImport from '@libs/actions/OnyxUpdateManager/utils';
import type {OnyxUpdateManagerUtilsMock} from '@libs/actions/OnyxUpdateManager/utils/__mocks__';
import type {ApplyUpdatesMock} from '@libs/actions/OnyxUpdateManager/utils/__mocks__/applyUpdates';

/* eslint-disable-next-line no-restricted-syntax */
import * as ApplyUpdatesImport from '@libs/actions/OnyxUpdateManager/utils/applyUpdates';
import {isPaused, isRunning} from '@libs/Network/SequentialQueue';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import OnyxUpdateMockUtils from '../utils/OnyxUpdateMockUtils';

jest.mock('@userActions/OnyxUpdates');
jest.mock('@userActions/App');
jest.mock('@userActions/OnyxUpdateManager/utils');
jest.mock('@userActions/OnyxUpdateManager/utils/applyUpdates', () => {
    const ApplyUpdatesImplementation = jest.requireActual<typeof ApplyUpdatesImport>('@userActions/OnyxUpdateManager/utils/applyUpdates');

    return {
        applyUpdates: jest.fn((updates: DeferredUpdatesDictionary) => ApplyUpdatesImplementation.applyUpdates(updates)),
    };
});

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    default: () => ({
        didScreenTransitionEnd: true,
    }),
}));

jest.mock('@libs/fileDownload/FileUtils', () => ({
    readFileAsync: jest.fn(),
}));

const App = AppImport as AppActionsMock;
const ApplyUpdates = ApplyUpdatesImport as ApplyUpdatesMock;
const OnyxUpdateManagerUtils = OnyxUpdateManagerUtilsImport as OnyxUpdateManagerUtilsMock;

const TEST_USER_ACCOUNT_ID = 1;
const REPORT_ID = 'testReport1';
const ONYX_KEY = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const;

const exampleReportAction = {
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    actorAccountID: TEST_USER_ACCOUNT_ID,
    automatic: false,
    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
    message: [{type: 'COMMENT', html: 'Testing a comment', text: 'Testing a comment', translationKey: ''}],
    person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
    shouldShow: true,
} satisfies Partial<OnyxTypes.ReportAction>;

const initialData = {report1: exampleReportAction, report2: exampleReportAction, report3: exampleReportAction} as unknown as OnyxTypes.ReportActions;

const mockUpdate1 = OnyxUpdateMockUtils.createUpdate(1, [
    {
        onyxMethod: OnyxUtils.METHOD.SET,
        key: ONYX_KEY,
        value: initialData,
    },
]);
const mockUpdate2 = OnyxUpdateMockUtils.createUpdate(2, [
    {
        onyxMethod: OnyxUtils.METHOD.MERGE,
        key: ONYX_KEY,
        value: {
            report1: null,
        },
    },
]);

const report2PersonDiff = {
    person: [
        {type: 'TEXT', style: 'light', text: 'Other Test User'},
        {type: 'TEXT', style: 'light', text: 'Other Test User 2'},
    ],
} satisfies Partial<OnyxTypes.ReportAction>;
const report3AvatarDiff: Partial<OnyxTypes.ReportAction> = {
    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_5.png',
};
const mockUpdate3 = OnyxUpdateMockUtils.createUpdate(3, [
    {
        onyxMethod: OnyxUtils.METHOD.MERGE,
        key: ONYX_KEY,
        value: {
            report2: report2PersonDiff,
            report3: report3AvatarDiff,
        },
    },
]);
const mockUpdate4 = OnyxUpdateMockUtils.createUpdate(4, [
    {
        onyxMethod: OnyxUtils.METHOD.MERGE,
        key: ONYX_KEY,
        value: {
            report3: null,
        },
    },
]);

const report2AvatarDiff = {
    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_6.png',
} satisfies Partial<OnyxTypes.ReportAction>;
const report4 = {
    ...exampleReportAction,
    automatic: true,
} satisfies Partial<OnyxTypes.ReportAction>;
const mockUpdate5 = OnyxUpdateMockUtils.createUpdate(5, [
    {
        onyxMethod: OnyxUtils.METHOD.MERGE,
        key: ONYX_KEY,
        value: {
            report2: report2AvatarDiff,
            report4,
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
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 1);
        await Onyx.set(ONYX_KEY, initialData);

        OnyxUpdateManagerUtils.mockValues.beforeValidateAndApplyDeferredUpdates = undefined;
        App.mockValues.missingOnyxUpdatesToBeApplied = undefined;
        resetDeferralLogicVariables();
    });

    it('should trigger Onyx update gap handling', async () => {
        // Since we don't want to trigger actual GetMissingOnyxUpdates calls to the server/backend,
        // we have to mock the results of these calls. By setting the missingOnyxUpdatesToBeApplied
        // property on the mock, we can simulate the results of the GetMissingOnyxUpdates calls.
        App.mockValues.missingOnyxUpdatesToBeApplied = [mockUpdate2, mockUpdate3];

        applyOnyxUpdatesReliably(mockUpdate2);

        // Delay all later updates, so that the update 2 has time to be written to storage and for the
        // ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT to be updated.
        await new Promise((resolve) => {
            setTimeout(resolve, 0);
        });

        applyOnyxUpdatesReliably(mockUpdate4);
        applyOnyxUpdatesReliably(mockUpdate3);

        return queryPromise.then(() => {
            const expectedResult: Record<string, Partial<OnyxTypes.ReportAction>> = {
                report2: {
                    ...exampleReportAction,
                    ...report2PersonDiff,
                },
            };

            expect(reportActions).toEqual(expectedResult);

            // GetMissingOnyxUpdates should have been called for the gap between update 2 and 4.
            // Since we queued update 4 before update 3, there's a gap to resolve, before we apply the deferred updates.
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 2, 3);

            // After the missing updates have been applied, the applicable updates after
            // all locally applied updates should be applied. (4)
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {4: mockUpdate4});
        });
    });

    it('should trigger 2 GetMissingOnyxUpdates calls, because the deferred updates have gaps', async () => {
        // Since we don't want to trigger actual GetMissingOnyxUpdates calls to the server/backend,
        // we have to mock the results of these calls. By setting the missingOnyxUpdatesToBeApplied
        // property on the mock, we can simulate the results of the GetMissingOnyxUpdates calls.
        App.mockValues.missingOnyxUpdatesToBeApplied = [mockUpdate1, mockUpdate2];

        applyOnyxUpdatesReliably(mockUpdate3);
        applyOnyxUpdatesReliably(mockUpdate5);

        let finishFirstCall: () => void;
        const firstGetMissingOnyxUpdatesCallFinished = new Promise<void>((resolve) => {
            finishFirstCall = resolve;
        });

        OnyxUpdateManagerUtils.mockValues.beforeValidateAndApplyDeferredUpdates = () => {
            // After the first GetMissingOnyxUpdates call has been resolved,
            // we have to set the mocked results of for the second call.
            App.mockValues.missingOnyxUpdatesToBeApplied = [mockUpdate3, mockUpdate4];
            finishFirstCall();
            return Promise.resolve();
        };

        return firstGetMissingOnyxUpdatesCallFinished
            .then(() => queryPromise)
            .then(() => {
                const expectedResult: Record<string, Partial<OnyxTypes.ReportAction>> = {
                    report2: {
                        ...exampleReportAction,
                        ...report2PersonDiff,
                        ...report2AvatarDiff,
                    },
                    report4,
                };

                expect(reportActions).toEqual(expectedResult);

                // GetMissingOnyxUpdates should have been called twice, once for the gap between update 1 and 3,
                // and once for the gap between update 3 and 5.
                // We always fetch missing updates from the lastUpdateIDAppliedToClient
                // to previousUpdateID of the first deferred update. First 1-2, second 3-4
                expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);
                expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 1, 2);
                expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 3, 4);

                // Since we have two GetMissingOnyxUpdates calls, there will be two sets of applicable updates.
                // The first applicable update will be 3, after missing updates 1-2 have been applied.
                // The second applicable update will be 5, after missing updates 3-4 have been applied.
                expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(2);
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, {3: mockUpdate3});
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, {5: mockUpdate5});
            });
    });

    it('should pause SequentialQueue while missing updates are being fetched', async () => {
        // Since we don't want to trigger actual GetMissingOnyxUpdates calls to the server/backend,
        // we have to mock the results of these calls. By setting the missingOnyxUpdatesToBeApplied
        // property on the mock, we can simulate the results of the GetMissingOnyxUpdates calls.
        App.mockValues.missingOnyxUpdatesToBeApplied = [mockUpdate1, mockUpdate2];

        applyOnyxUpdatesReliably(mockUpdate3);
        applyOnyxUpdatesReliably(mockUpdate5);

        const assertAfterFirstGetMissingOnyxUpdates = () => {
            // While the fetching of missing udpates and the validation and application of the deferred updaes is running,
            // the SequentialQueue should be paused.
            expect(isPaused()).toBeTruthy();
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 1, 2);
        };

        const assertAfterSecondGetMissingOnyxUpdates = () => {
            // The SequentialQueue should still be paused.
            expect(isPaused()).toBeTruthy();
            expect(isRunning()).toBeFalsy();
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);
            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 3, 4);
        };

        let firstCallFinished = false;
        OnyxUpdateManagerUtils.mockValues.beforeValidateAndApplyDeferredUpdates = () => {
            if (firstCallFinished) {
                assertAfterSecondGetMissingOnyxUpdates();
                return Promise.resolve();
            }

            assertAfterFirstGetMissingOnyxUpdates();

            // After the first GetMissingOnyxUpdates call has been resolved,
            // we have to set the mocked results of for the second call.
            App.mockValues.missingOnyxUpdatesToBeApplied = [mockUpdate3, mockUpdate4];
            firstCallFinished = true;
            return Promise.resolve();
        };

        return queryPromise.then(() => {
            // Once the OnyxUpdateManager has finished filling the gaps, the SequentialQueue should be unpaused again.
            // It must not necessarily be running, because it might not have been flushed yet.
            expect(isPaused()).toBeFalsy();
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);
        });
    });
});
