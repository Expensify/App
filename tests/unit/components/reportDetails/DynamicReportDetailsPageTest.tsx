import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type Navigation from '@libs/Navigation/Navigation';
import AppNavigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';

import DynamicReportDetailsPage from '@pages/DynamicReportDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report, ReportAction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../../../utils/mockUseConfirmModal';

import createRandomReportAction from '../../../utils/collections/reportActions';
import {createRandomReport} from '../../../utils/collections/reports';
import {mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../../../utils/mockUseConfirmModal';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});
jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn(() => false));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: jest.fn(),
        useRoute: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

const mockHtmlToText = jest.spyOn(Parser, 'htmlToText');
const navigationMock = {} as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>['navigation'];
const getRouteMock = (reportID: string) => ({params: {reportID}}) as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>['route'];

describe('DynamicReportDetailsPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(() => {
        mockHtmlToText.mockClear();
        resetMockConfirmModal();
        jest.spyOn(TransitionTracker, 'runAfterTransitions').mockReturnValue({cancel: jest.fn()});
    });

    afterEach(async () => {
        jest.restoreAllMocks();
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
                    <DynamicReportDetailsPage
                        betas={[]}
                        isLoadingReportData={false}
                        navigation={navigationMock}
                        policy={undefined}
                        report={report}
                        reportMetadata={undefined}
                        reportLoadingState={undefined}
                        route={getRouteMock(reportID)}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        expect(mockHtmlToText).not.toHaveBeenCalled();
    });

    it('should navigate to the Search backTo route when deleting a task from Search', async () => {
        const currentUserAccountID = 1;
        const reportID = '11';
        const parentReportID = '22';
        const parentActionID = '101';
        const searchBackTo = ROUTES.SEARCH_REPORT.getRoute({
            reportID: parentReportID,
            reportActionID: parentActionID,
            backTo: ROUTES.SEARCH_ROOT.getRoute({query: 'type:chat'}),
        });

        const parentReportAction = {
            ...createRandomReportAction(Number(parentActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            actorAccountID: currentUserAccountID,
            childManagerAccountID: currentUserAccountID,
            childReportID: reportID,
            message: [
                {
                    type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                    html: '',
                    text: '',
                    isDeletedParentAction: false,
                },
            ],
        } as ReportAction;

        const taskReport: Report = {
            ...createRandomReport(Number(reportID), undefined),
            type: CONST.REPORT.TYPE.TASK,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            ownerAccountID: currentUserAccountID,
            parentReportID,
            parentReportActionID: parentActionID,
        };

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, taskReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {
                ...createRandomReport(Number(parentReportID), undefined),
                participants: {[currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                [parentActionID]: parentReportAction,
            });
        });

        jest.spyOn(AppNavigation, 'getTopmostSearchReportRouteParams').mockReturnValue({reportID, backTo: searchBackTo});
        const goBackSpy = jest.spyOn(AppNavigation, 'goBack');

        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsContext.Provider value={{accountID: currentUserAccountID}}>
                    <LocaleContextProvider>
                        <DynamicReportDetailsPage
                            betas={[]}
                            isLoadingReportData={false}
                            navigation={navigationMock}
                            policy={undefined}
                            report={taskReport}
                            reportMetadata={undefined}
                            reportLoadingState={undefined}
                            route={getRouteMock(reportID)}
                        />
                    </LocaleContextProvider>
                </CurrentUserPersonalDetailsContext.Provider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByLabelText('Delete'), {type: 'press'});

        expect(mockShowConfirmModal).toHaveBeenCalled();

        await act(async () => {
            resolveShowConfirmModal();
        });
        await waitForBatchedUpdatesWithAct();

        expect(goBackSpy).toHaveBeenCalledWith(searchBackTo);
    });
});
