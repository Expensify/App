import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {translateLocal} from '@libs/Localize';
import type Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import ReportDetailsPage from '@pages/ReportDetailsPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import createRandomReportAction from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';

jest.mock('@src/components/ConfirmedRoute.tsx');

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        useRoute: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        UNSTABLE_usePreventRemove: jest.fn(),
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
        await Onyx.clear();
    });

    it('self DM track options should disappear when report moved to workspace', async () => {
        await Onyx.merge(ONYXKEYS.BETAS, [CONST.BETAS.TRACK_FLOWS]);

        const selfDMReportID = '1';
        const trackExpenseReportID = '2';
        const trackExpenseActionID = '123';
        const transactionID = '3';
        const transaction = createRandomTransaction(1);
        const trackExpenseReport: Report = {
            ...createRandomReport(Number(trackExpenseReportID)),
            chatType: '' as Report['chatType'],
            parentReportID: selfDMReportID,
            parentReportActionID: trackExpenseActionID,
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`, {
            ...createRandomReport(Number(selfDMReportID)),
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
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

        const {rerender} = render(
            <OnyxProvider>
                <LocaleContextProvider>
                    <ReportDetailsPage
                        betas={[]}
                        isLoadingReportData={false}
                        navigation={{} as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>['navigation']}
                        policies={{}}
                        report={trackExpenseReport}
                        reportMetadata={undefined}
                        route={{params: {reportID: trackExpenseReportID}} as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>['route']}
                    />
                </LocaleContextProvider>
            </OnyxProvider>,
        );

        const submitText = translateLocal('actionableMentionTrackExpense.submit');
        const categorizeText = translateLocal('actionableMentionTrackExpense.categorize');
        const shareText = translateLocal('actionableMentionTrackExpense.share');

        await screen.findByText(submitText);
        await screen.findByText(categorizeText);
        await screen.findByText(shareText);

        const movedTrackExpenseReport = {
            ...trackExpenseReport,
            parentReportID: '3',
            parentReportActionID: '234',
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${trackExpenseReportID}`, movedTrackExpenseReport);

        rerender(
            <OnyxProvider>
                <LocaleContextProvider>
                    <ReportDetailsPage
                        betas={[]}
                        isLoadingReportData={false}
                        navigation={{} as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>['navigation']}
                        policies={{}}
                        report={movedTrackExpenseReport}
                        reportMetadata={undefined}
                        route={{params: {reportID: trackExpenseReportID}} as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>['route']}
                    />
                </LocaleContextProvider>
            </OnyxProvider>,
        );

        expect(screen.queryByText(submitText)).not.toBeVisible();
        expect(screen.queryByText(categorizeText)).not.toBeVisible();
        expect(screen.queryByText(shareText)).not.toBeVisible();
    });
});
