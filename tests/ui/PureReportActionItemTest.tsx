import {PortalProvider} from '@gorhom/portal';
import * as NativeNavigation from '@react-navigation/native';
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import {translateLocal} from '@libs/Localize';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import PureReportActionItem from '@pages/home/report/PureReportActionItem';
import CONST from '@src/CONST';
import * as ReportActionUtils from '@src/libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {OriginalMessage} from '@src/types/onyx/ReportAction';
import type ReportActionName from '@src/types/onyx/ReportActionName';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@react-navigation/native');

const ACTOR_ACCOUNT_ID = 123456789;
const actorEmail = 'test@test.com';

const createReportAction = (actionName: ReportActionName, originalMessageExtras: Partial<OriginalMessage<ReportActionName>>) =>
    ({
        reportActionID: '12345',
        actorAccountID: ACTOR_ACCOUNT_ID,
        created: '2025-07-12 09:03:17.653',
        actionName,
        automatic: true,
        shouldShow: true,
        avatar: '',
        person: [{type: 'TEXT', style: 'strong', text: 'Concierge'}],
        message: [{type: 'COMMENT', html: 'some message', text: 'some message'}],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        originalMessage: {
            ...originalMessageExtras,
        },
    }) as ReportAction;

describe('PureReportActionItem', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({key: '', name: ''});
        jest.spyOn(ReportActionUtils, 'getIOUActionForReportID').mockImplementation(getIOUActionForReportID);
    });

    beforeEach(() => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        return Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false}).then(() =>
            Onyx.merge(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
                [ACTOR_ACCOUNT_ID]: {
                    accountID: ACTOR_ACCOUNT_ID,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_9.png',
                    displayName: actorEmail,
                    login: actorEmail,
                },
            }),
        );
    });

    afterEach(() => {
        Onyx.clear();
    });

    function renderItemWithAction(action: ReportAction) {
        return render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                <OptionsListContextProvider>
                    <ScreenWrapper testID="test">
                        <PortalProvider>
                            <PureReportActionItem
                                allReports={undefined}
                                policies={undefined}
                                report={undefined}
                                reportActions={[]}
                                parentReportAction={undefined}
                                action={action}
                                displayAsGroup={false}
                                isMostRecentIOUReportAction={false}
                                shouldDisplayNewMarker={false}
                                index={0}
                                isFirstVisibleReportAction={false}
                                taskReport={undefined}
                                linkedReport={undefined}
                                iouReportOfLinkedReport={undefined}
                            />
                        </PortalProvider>
                    </ScreenWrapper>
                </OptionsListContextProvider>
            </ComposeProviders>,
        );
    }

    describe('Automatic actions', () => {
        it('APPROVED action via workspace rules', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.APPROVED, {automaticAction: true});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.automaticallyApproved'))).toBeOnTheScreen();
        });

        it('FORWARDED action via workspace rules', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.FORWARDED, {automaticAction: true});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.automaticallyForwarded'))).toBeOnTheScreen();
        });

        it('SUBMITTED action via harvesting', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.SUBMITTED, {harvesting: true});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.automaticallySubmitted'))).toBeOnTheScreen();
        });

        it('SUBMITTED_AND_CLOSED action via harvesting', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED, {harvesting: true});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.automaticallySubmitted'))).toBeOnTheScreen();
        });
    });

    describe('Manual actions', () => {
        it('APPROVED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.APPROVED, {automaticAction: false});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.approvedMessage'))).toBeOnTheScreen();
        });

        it('FORWARDED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.FORWARDED, {automaticAction: false});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.forwarded'))).toBeOnTheScreen();
        });

        it('SUBMITTED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.SUBMITTED, {harvesting: false});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.submitted'))).toBeOnTheScreen();
        });

        it('SUBMITTED_AND_CLOSED action', async () => {
            const action = createReportAction(CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED, {harvesting: false});
            renderItemWithAction(action);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(actorEmail)).toBeOnTheScreen();
            expect(screen.getByText(translateLocal('iou.submitted'))).toBeOnTheScreen();
        });
    });
});
