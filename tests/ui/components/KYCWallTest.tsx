import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import KYCWall from '@components/KYCWall';
import type {ContinueActionParams, KYCWallRef} from '@components/KYCWall/types';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {moveIOUReportToPolicyAndInviteSubmitter} from '@libs/actions/Report';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, ReportActions} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import createRandomReportAction from '../../utils/collections/reportActions';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        goBack: jest.fn(),
        getActiveRoute: jest.fn(() => ''),
    },
}));

jest.mock('@libs/actions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        __esModule: true,
        moveIOUReportToPolicy: jest.fn(() => undefined),
        moveIOUReportToPolicyAndInviteSubmitter: jest.fn(() => undefined),
    };
});

const mockedMoveIOUReportToPolicyAndInviteSubmitter = jest.mocked(moveIOUReportToPolicyAndInviteSubmitter);

const POLICY_ID = 'kyc-wall-policy';
const WORKSPACE_CHAT_ID = '300';

const iouReport = {
    reportID: '100',
    chatReportID: '200',
    type: CONST.REPORT.TYPE.IOU,
    ownerAccountID: 2,
    managerID: 1,
    currency: CONST.CURRENCY.USD,
} as Report;

const adminPolicy: Policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM, 'Admin workspace'),
    id: POLICY_ID,
    role: CONST.POLICY.ROLE.ADMIN,
    outputCurrency: CONST.CURRENCY.USD,
};

const workspaceChat = {
    reportID: WORKSPACE_CHAT_ID,
    type: CONST.REPORT.TYPE.CHAT,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    policyID: POLICY_ID,
} as Report;

const workspaceChatAction = createRandomReportAction(1);
const workspaceChatActions: ReportActions = {[workspaceChatAction.reportActionID]: workspaceChatAction};

describe('KYCWall', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('should pass the workspace chat actions stored at press time when moving an IOU report to a workspace', async () => {
        // Given an IOU report payer without a payment method who administers a workspace
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, adminPolicy);
        let continueAction: ((params?: ContinueActionParams) => void) | undefined;
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                <KYCWall
                    ref={React.createRef<KYCWallRef>()}
                    iouReport={iouReport}
                    chatReportID={iouReport.chatReportID}
                    enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                    onSuccessfulKYC={jest.fn()}
                >
                    {(triggerKYCFlow) => {
                        continueAction = triggerKYCFlow;
                    }}
                </KYCWall>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // And the workspace chat and its actions land in Onyx after the wall rendered
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${WORKSPACE_CHAT_ID}`, workspaceChat);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${WORKSPACE_CHAT_ID}`, workspaceChatActions);

        // When the payer picks the workspace to pay through
        act(() => {
            continueAction?.({policy: adminPolicy});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the move should get those actions, because the wall reads workspace chats only when paying, so the report joins the live workspace chat
        expect(mockedMoveIOUReportToPolicyAndInviteSubmitter.mock.calls.at(0)?.at(2)).toEqual({[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${WORKSPACE_CHAT_ID}`]: workspaceChatActions});
    });
});
