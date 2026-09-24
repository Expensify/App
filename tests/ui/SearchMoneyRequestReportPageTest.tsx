import {render, waitFor} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import SearchMoneyRequestReportPage from '@pages/Search/SearchMoneyRequestReportPage';

import {openReport} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

import createRandomPolicy from '../utils/collections/policies';

const report: Report = {reportID: '123', policyID: 'policy123'};
const policy = {...createRandomPolicy(123, CONST.POLICY.TYPE.TEAM), id: 'policy123', isFromFullPolicy: true, lastModified: '12345'};

jest.mock('@hooks/useOnyx');
jest.mock('@hooks/usePolicy');
jest.mock('@userActions/Report', () => ({openReport: jest.fn(), updateLastVisitTime: jest.fn(), clearDeleteTransactionNavigateBackUrl: jest.fn(), createTransactionThreadReport: jest.fn()}));
jest.mock('@components/Search/SearchContext', () => ({useSearchResultsContext: () => ({currentSearchResults: undefined})}));
jest.mock('@components/OnyxListItemProvider', () => ({usePersonalDetails: () => undefined}));
jest.mock('@components/WideRHPContextProvider/useRHPWidth', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));
jest.mock('@hooks/useThemeStyles', () => () => ({mtAuto: {}, textSupporting: {}}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1, email: 'test@example.com'}));
jest.mock('@hooks/useDismissOnMoneyRequestReportRemoval', () => jest.fn());
jest.mock('@hooks/useIsReportReadyToDisplay', () => () => ({isEditingDisabled: false, isCurrentReportLoadedFromOnyx: true}));
jest.mock('@hooks/useParentReportAction', () => jest.fn());
jest.mock('@hooks/useReportAttributes', () => ({useDerivedReportNameByReportID: () => ''}));
jest.mock('@hooks/useDocumentTitle', () => jest.fn());
jest.mock('@hooks/useReportIsArchived', () => () => false);
jest.mock('@hooks/useSubmitToDestinationVisible', () => jest.fn());
jest.mock('@hooks/useTransactionsAndViolationsForReport', () => () => ({transactions: {}, violations: {}}));
jest.mock('@hooks/useTransactionThreadReportID', () => () => ({reportActions: [], transactionThreadReportID: undefined, effectiveTransactionThreadReportID: undefined}));
jest.mock('@pages/inbox/report/useClearReportActionDraftsOnReportChange', () => jest.fn());
jest.mock('@react-navigation/native', () => ({...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'), useIsFocused: () => false}));
jest.mock('@components/BlockingViews/FullPageNotFoundView', () => () => null);
jest.mock('@components/DragAndDrop/Provider', () => () => null);
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportView', () => () => null);
jest.mock('@components/ScreenWrapper', () => () => null);
jest.mock('@components/WideRHPOverlayWrapper', () => () => null);
jest.mock('@pages/inbox/ActionListContext', () => ({ActionListContextProvider: () => null}));
jest.mock('@pages/inbox/ReactionListWrapper', () => () => null);
jest.mock('@pages/inbox/report/ReportActionEditMessageContext', () => ({ReportActionEditMessageContextProvider: () => null}));

describe('SearchMoneyRequestReportPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useOnyx).mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`) {
                return [report, {status: 'loaded'}] as ReturnType<typeof useOnyx>;
            }
            return [undefined, {status: 'loaded'}] as ReturnType<typeof useOnyx>;
        });
        jest.mocked(usePolicy).mockReturnValue(policy);
    });

    it('passes the expense report policy to OpenReport when opening from a policy chat preview', async () => {
        // Given a cached full policy and an expense report opened in the right-hand pane from its preview.
        // The screen only reads route; the navigator supplies navigation in the app.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const props = {route: {key: 'expense-report', name: SCREENS.RIGHT_MODAL.EXPENSE_REPORT, params: {reportID: report.reportID}}} as React.ComponentProps<
            typeof SearchMoneyRequestReportPage
        >;

        // When the expense report page fetches its report.
        render(<SearchMoneyRequestReportPage {...props} />);

        // Then OpenReport receives the report's cached policy and can send its version hint.
        await waitFor(() => expect(openReport).toHaveBeenCalledWith(expect.objectContaining({reportID: report.reportID, policy})));
        expect(usePolicy).toHaveBeenCalledWith(report.policyID);
    });
});
