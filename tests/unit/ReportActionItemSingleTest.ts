import {screen, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {PersonalDetailsList} from '@src/types/onyx';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
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
} as const;

describe('ReportActionItemSingle', () => {
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
        return Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
    });

    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        Onyx.clear();
    });

    describe('when the Report is a policy expense chat', () => {
        describe('and the property "shouldShowSubscriptAvatar" is true', () => {
            const shouldShowSubscriptAvatar = true;
            const fakeReport = LHNTestUtils.getFakeReportWithPolicy([1, 2]);
            const fakeReportAction = LHNTestUtils.getFakeAdvancedReportAction();
            const fakePolicy = LHNTestUtils.getFakePolicy(fakeReport.policyID);
            const faceAccountId = fakeReportAction.actorAccountID;
            const fakePersonalDetails: PersonalDetailsList = {
                [faceAccountId]: {
                    accountID: faceAccountId,
                    login: 'email1@test.com',
                    displayName: 'Email One',
                    avatar: 'https://example.com/avatar.png',
                    firstName: 'One',
                },
            };

            function setup() {
                LHNTestUtils.getDefaultRenderedReportActionItemSingle(shouldShowSubscriptAvatar, fakeReport, fakeReportAction);
                const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [fakePolicy], (item) => item.id);

                return waitForBatchedUpdates().then(() =>
                    Onyx.multiSet({
                        [ONYXKEYS.PERSONAL_DETAILS_LIST]: fakePersonalDetails,
                        [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
                        ...policyCollectionDataSet,
                    }),
                );
            }

            it('renders secondary Avatar properly', async () => {
                const expectedSecondaryIconTestId = 'SvgDefaultAvatar_w Icon';

                await setup();
                await waitFor(() => {
                    expect(screen.getByTestId(expectedSecondaryIconTestId)).toBeOnTheScreen();
                });
            });

            it('renders Person information', () => {
                const [expectedPerson] = fakeReportAction.person ?? [];

                return setup().then(() => {
                    expect(screen.getByText(expectedPerson.text ?? '')).toBeOnTheScreen();
                });
            });
        });
    });
});
