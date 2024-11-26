import {screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import * as Report from '@libs/actions/Report';
import * as Localize from '@libs/Localize';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCollectionDataSet} from '@src/types/onyx/Policy';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

// Be sure to include the mocked Permissions and Expensicons libraries or else the beta tests won't work
jest.mock('@libs/Permissions');
jest.mock('@components/Icon/Expensicons');
jest.mock('@src/hooks/useActiveWorkspaceFromNavigationState');
jest.mock('@src/hooks/useResponsiveLayout');

describe('Sidebar', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(() => {
        // Wrap Onyx each onyx action with waitForBatchedUpdates
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        // Initialize the network key for OfflineWithFeedback
        return TestHelper.signInWithTestUser(1, 'email1@test.com', undefined, undefined, 'One').then(() => Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false}));
    });

    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        Onyx.clear();
    });

    describe('in default mode', () => {
        it('orders items with most recently updated on top', () => {
            // Given three unread reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport([1, 2], 3);
            const report2 = LHNTestUtils.getFakeReport([1, 3], 2);
            const report3 = LHNTestUtils.getFakeReport([1, 4], 1);

            const policy1 = LHNTestUtils.getFakePolicy('1', 'A');
            const policy2 = LHNTestUtils.getFakePolicy('2', 'B');
            const policy3 = LHNTestUtils.getFakePolicy('3', 'C');

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            Report.addComment(report1.reportID, 'Hi, this is a comment');
            Report.addComment(report2.reportID, 'Hi, this is a comment');
            Report.addComment(report3.reportID, 'Hi, this is a comment');

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            const policyCollectionDataSet: PolicyCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.POLICY}${policy1.id}`]: policy1,
                [`${ONYXKEYS.COLLECTION.POLICY}${policy2.id}`]: policy2,
                [`${ONYXKEYS.COLLECTION.POLICY}${policy3.id}`]: policy3,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks())

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                            ...policyCollectionDataSet,
                        }),
                    )

                    // Then the component should be rendered with the mostly recently updated report first
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);

                        expect(displayNames.at(0)).toHaveTextContent('Email Four');
                        expect(displayNames.at(1)).toHaveTextContent('Email Three');
                        expect(displayNames.at(2)).toHaveTextContent('Email Two');
                    })
            );
        });
    });
});
