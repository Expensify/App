import {screen, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

describe('ReportActionItemSingle', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
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

    describe('when the Report is a DM chat', () => {
        describe('component properly renders both avatar & name of the sender', () => {
            const fakeReport = {...LHNTestUtils.getFakeReportWithPolicy([1, 2]), chatType: undefined};
            const fakeReportAction = LHNTestUtils.getFakeAdvancedReportAction();
            const fakePolicy = LHNTestUtils.getFakePolicy(fakeReport.policyID);
            const faceAccountId = fakeReportAction.actorAccountID ?? CONST.DEFAULT_NUMBER_ID;
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
                const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [fakePolicy], (item) => item.id);
                return waitForBatchedUpdates()
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
                            [ONYXKEYS.COLLECTION.REPORT_ACTIONS]: {
                                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fakeReport.reportID}`]: {
                                    [fakeReportAction.reportActionID]: fakeReportAction,
                                },
                            },
                            [ONYXKEYS.COLLECTION.REPORT]: {
                                [fakeReport.reportID]: fakeReport,
                            },
                            ...policyCollectionDataSet,
                        }),
                    )
                    .then(() => {
                        LHNTestUtils.getDefaultRenderedReportActionItemSingle(fakeReport, fakeReportAction);
                    });
            }

            it('renders avatar properly', async () => {
                const expectedIconTestID = 'ReportAvatar-SingleAvatar';

                await setup();
                await waitFor(() => {
                    expect(screen.getByTestId(expectedIconTestID)).toBeOnTheScreen();
                });
            });

            it('renders Person information', async () => {
                const [expectedPerson] = fakeReportAction.person ?? [];

                await setup();
                await waitFor(() => {
                    expect(screen.getByText(expectedPerson.text ?? '')).toBeOnTheScreen();
                });
            });
        });
    });
});
