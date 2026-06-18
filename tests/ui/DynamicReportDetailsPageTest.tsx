import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import DynamicReportDetailsPage from '@pages/DynamicReportDetailsPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        useFocusEffect: jest.fn(),
        useRoute: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator');
const mockIsReportTopmostSplitNavigator = jest.mocked(isReportTopmostSplitNavigator);

const navigationMock = {} as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>['navigation'];
const getRouteMock = (reportID: string) => ({params: {reportID}}) as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>['route'];

describe('DynamicReportDetailsPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('self DM track options should disappear when report moved to workspace', async () => {
        const selfDMReportID = '1';
        const trackExpenseReportID = '2';
        const trackExpenseActionID = '123';
        const transactionID = '3';
        const transaction = createRandomTransaction(1);
        const trackExpenseReport: Report = {
            ...createRandomReport(Number(trackExpenseReportID), undefined),
            parentReportID: selfDMReportID,
            parentReportActionID: trackExpenseActionID,
        };
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`, {
                ...createRandomReport(Number(selfDMReportID), CONST.REPORT.CHAT_TYPE.SELF_DM),
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${trackExpenseReportID}`, trackExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReportID}`, {
                [trackExpenseActionID]: {
                    ...createRandomReportAction(Number(trackExpenseActionID)),
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                    },
                },
            });
        });

        const {rerender} = render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <DynamicReportDetailsPage
                        betas={[]}
                        isLoadingReportData={false}
                        navigation={navigationMock}
                        policy={undefined}
                        report={trackExpenseReport}
                        reportMetadata={undefined}
                        reportLoadingState={undefined}
                        route={getRouteMock(trackExpenseReportID)}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();
        const submitText = translateLocal('actionableMentionTrackExpense.submit');
        await screen.findByText(submitText);

        // Categorize and share are temporarily disabled
        // const categorizeText = translateLocal('actionableMentionTrackExpense.categorize');
        // const shareText = translateLocal('actionableMentionTrackExpense.share');
        // await screen.findByText(categorizeText);
        // await screen.findByText(shareText);

        const movedTrackExpenseReport = {
            ...trackExpenseReport,
            parentReportID: '3',
            parentReportActionID: '234',
        };
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${trackExpenseReportID}`, movedTrackExpenseReport);
        });

        rerender(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <DynamicReportDetailsPage
                        betas={[]}
                        isLoadingReportData={false}
                        navigation={navigationMock}
                        policy={undefined}
                        report={movedTrackExpenseReport}
                        reportMetadata={undefined}
                        reportLoadingState={undefined}
                        route={getRouteMock(trackExpenseReportID)}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        expect(screen.queryByText(submitText)).not.toBeVisible();

        // Categorize and share are temporarily disabled
        // expect(screen.queryByText(categorizeText)).not.toBeVisible();
        // expect(screen.queryByText(shareText)).not.toBeVisible();
    });

    describe('"Go to room" option visibility', () => {
        const roomReportID = '10';
        const policyRoom: Report = createRandomReport(Number(roomReportID), CONST.REPORT.CHAT_TYPE.POLICY_ROOM);

        const renderDetailsPage = () =>
            render(
                <OnyxListItemProvider>
                    <LocaleContextProvider>
                        <DynamicReportDetailsPage
                            betas={[]}
                            isLoadingReportData={false}
                            navigation={navigationMock}
                            policy={undefined}
                            report={policyRoom}
                            reportMetadata={undefined}
                            reportLoadingState={undefined}
                            route={getRouteMock(roomReportID)}
                        />
                    </LocaleContextProvider>
                </OnyxListItemProvider>,
            );

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('shows "Go to room" when the room is not the screen behind the Details page', async () => {
            mockIsReportTopmostSplitNavigator.mockReturnValue(false);
            jest.spyOn(Navigation, 'getTopmostReportId').mockReturnValue(undefined);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${roomReportID}`, policyRoom);
            });

            renderDetailsPage();
            await waitForBatchedUpdatesWithAct();

            expect(await screen.findByText(translateLocal('reportDetailsPage.goToRoom'))).toBeVisible();
        });

        it('does not show "Go to room" when the Details page is on top of its own room', async () => {
            mockIsReportTopmostSplitNavigator.mockReturnValue(true);
            jest.spyOn(Navigation, 'getTopmostReportId').mockReturnValue(roomReportID);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${roomReportID}`, policyRoom);
            });

            renderDetailsPage();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('reportDetailsPage.goToRoom'))).toBeNull();
        });
    });
});
