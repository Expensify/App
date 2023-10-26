import Onyx from 'react-native-onyx';
import {cleanup, screen} from '@testing-library/react-native';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const ONYXKEYS = {
    PERSONAL_DETAILS_LIST: 'personalDetailsList',
    IS_LOADING_REPORT_DATA: 'isLoadingReportData',
    COLLECTION: {
        REPORT_ACTIONS: 'reportActions_',
        POLICY: 'policy_',
    },
    NETWORK: 'network',
};

describe('ReportActionItemSingle', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            registerStorageEventListener: () => {},
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(() => {
        // Wrap Onyx each onyx action with waitForBatchedUpdates
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        // Initialize the network key for OfflineWithFeedback
        return Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
    });

    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        cleanup();
        Onyx.clear();
    });

    describe('when the Report is a policy expense chat', () => {
        describe('and the property "shouldShowSubscriptAvatar" is true', () => {
            const shouldShowSubscriptAvatar = true;
            const fakeReport = LHNTestUtils.getFakeReportWithPolicy([1, 2]);
            const fakeReportAction = LHNTestUtils.getFakeAdvancedReportAction();
            const fakePolicy = LHNTestUtils.getFakePolicy(fakeReport.policyID);
            const fakePersonalDetails = {
                [fakeReportAction.actorAccountID]: {
                    accountID: fakeReportAction.actorAccountID,
                    login: 'email1@test.com',
                    displayName: 'Email One',
                    avatar: 'https://example.com/avatar.png',
                    firstName: 'One',
                },
            };

            beforeEach(() => {
                LHNTestUtils.getDefaultRenderedReportActionItemSingle(shouldShowSubscriptAvatar, fakeReport, fakeReportAction);
            });

            function setup() {
                return waitForBatchedUpdates().then(() =>
                    Onyx.multiSet({
                        [ONYXKEYS.PERSONAL_DETAILS_LIST]: fakePersonalDetails,
                        [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
                        [`${ONYXKEYS.COLLECTION.POLICY}${fakeReport.policyID}`]: fakePolicy,
                    }),
                );
            }

            it('renders secondary Avatar properly', () => {
                const expectedSecondaryIconTestId = 'SvgDefaultAvatar_w Icon';

                return setup().then(() => {
                    expect(screen.getByTestId(expectedSecondaryIconTestId)).toBeDefined();
                });
            });

            it('renders Person information', () => {
                const [expectedPerson] = fakeReportAction.person;

                return setup().then(() => {
                    expect(screen.getByText(expectedPerson.text)).toBeDefined();
                });
            });
        });
    });
});
