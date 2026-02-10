import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import ReportDetailsPage from '@pages/ReportDetailsPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report, ReportAction} from '@src/types/onyx';
import createRandomReportAction from '../../../utils/collections/reportActions';
import {createRandomReport} from '../../../utils/collections/reports';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

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

const mockHtmlToText = jest.spyOn(Parser, 'htmlToText');

describe('ReportDetailsPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(() => {
        mockHtmlToText.mockClear();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('should not call Parser.htmlToText when parentReportAction is ADD_COMMENT', async () => {
        const reportID = '10';
        const parentReportID = '20';
        const parentActionID = '100';

        const parentReportAction = {
            ...createRandomReportAction(Number(parentActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        } as ReportAction;

        const report: Report = {
            ...createRandomReport(Number(reportID), undefined),
            parentReportID,
            parentReportActionID: parentActionID,
        };

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, createRandomReport(Number(parentReportID), undefined));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                [parentActionID]: parentReportAction,
            });
        });

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <ReportDetailsPage
                        betas={[]}
                        isLoadingReportData={false}
                        navigation={{} as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>['navigation']}
                        policy={undefined}
                        report={report}
                        reportMetadata={undefined}
                        route={{params: {reportID}} as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>['route']}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        expect(mockHtmlToText).not.toHaveBeenCalled();
    });
});
