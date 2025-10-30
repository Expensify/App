import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import ReportDetailsPage from '@pages/ReportDetailsPage';
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
        useRoute: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

describe('ReportDetailsPage', () => {
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
                    <ReportDetailsPage
                        betas={[]}
                        isLoadingReportData={false}
                        navigation={{} as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>['navigation']}
                        policy={undefined}
                        report={trackExpenseReport}
                        reportMetadata={undefined}
                        route={{params: {reportID: trackExpenseReportID}} as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>['route']}
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
                    <ReportDetailsPage
                        betas={[]}
                        isLoadingReportData={false}
                        navigation={{} as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>['navigation']}
                        policy={undefined}
                        report={movedTrackExpenseReport}
                        reportMetadata={undefined}
                        route={{params: {reportID: trackExpenseReportID}} as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>['route']}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        expect(screen.queryByText(submitText)).not.toBeVisible();

        // Categorize and share are temporarily disabled
        // expect(screen.queryByText(categorizeText)).not.toBeVisible();
        // expect(screen.queryByText(shareText)).not.toBeVisible();
    });
});
