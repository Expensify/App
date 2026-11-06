/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- minimal test fixtures; casting via `as unknown` keeps the test focused on the draft flags instead of dragging in every field of the full types */
import {renderHook} from '@testing-library/react-native';

import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';

import {NavigateGlobalCreateProvider, useNavigateGlobalCreate} from '@pages/iou/request/step/IOURequestStepScan/components/NavigateGlobalCreateContext';

import {setMoneyRequestParticipants, setMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import {setTransactionReport} from '@userActions/Transaction';

import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';

import React from 'react';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const DEFAULT_POLICY_ID = 'defaultPolicy';
const DEFAULT_WORKSPACE_CHAT_ID = 'defaultWorkspaceChat';
const OTHER_WORKSPACE_CHAT_ID = 'otherWorkspaceChat';

jest.mock('@hooks/useDefaultExpensePolicy', () => ({__esModule: true, default: () => ({id: 'defaultPolicy', autoReporting: true})}));
jest.mock('@hooks/usePersonalPolicy', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/useSelfDMReport', () => ({__esModule: true, default: () => ({reportID: 'selfDM'})}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [undefined]}));
jest.mock('@libs/shouldUseDefaultExpensePolicy', () => ({__esModule: true, default: () => true}));
jest.mock('@libs/ReportUtils', () => ({
    getPolicyExpenseChat: () => ({reportID: 'defaultWorkspaceChat', policyID: 'defaultPolicy'}),
    isSelfDM: () => false,
}));
jest.mock('@libs/IOUUtils', () => ({navigateToConfirmationPage: jest.fn(), navigateToParticipantPage: jest.fn()}));
jest.mock('@libs/Navigation/deferNavigate', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/telemetry/activeSpans', () => ({endSpan: jest.fn()}));
jest.mock('@pages/iou/request/step/IOURequestStepScan/utils/startScanProcessSpan', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@pages/iou/request/step/IOURequestStepScan/utils/endScanProcessAndStartConfirmationMountSpan', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@userActions/IOU/MoneyRequest', () => ({setMoneyRequestParticipants: jest.fn(), setMoneyRequestParticipantsFromReport: jest.fn()}));
jest.mock('@userActions/Transaction', () => ({setTransactionReport: jest.fn()}));

type NavigateGlobalCreateFn = ReturnType<typeof useNavigateGlobalCreate>;

async function renderProvider(transaction: Partial<Transaction> | undefined): Promise<NavigateGlobalCreateFn> {
    const props = {
        iouType: CONST.IOU.TYPE.CREATE,
        // The camera button starts the scan with the default workspace chat as the route reportID
        reportID: DEFAULT_WORKSPACE_CHAT_ID,
        transactionID: 't1',
        transaction,
        backToReport: undefined,
        currentUserPersonalDetails: {accountID: 1, login: 'a@b.com'},
    } as unknown as WithCurrentUserPersonalDetailsProps & {
        iouType: typeof CONST.IOU.TYPE.CREATE;
        reportID: string;
        transactionID: string;
        transaction: Transaction | undefined;
        backToReport: undefined;
    };

    const {result} = renderHook(() => useNavigateGlobalCreate(), {
        wrapper: ({children}: {children: React.ReactNode}) => <NavigateGlobalCreateProvider {...props}>{children}</NavigateGlobalCreateProvider>,
    });

    // Wait for the Provider's one-tick setIsReady and the Subscriber's fnRef publish
    await waitForBatchedUpdates();
    await waitForBatchedUpdates();

    return result.current;
}

describe('navigateGlobalCreate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('flags the drafts as global create when they are assigned to the default workspace chat', async () => {
        // Given a scan started from the camera button, whose draft is seeded with the default workspace chat and isn't flagged as global create
        const navigateGlobalCreate = await renderProvider({
            transactionID: 't1',
            reportID: DEFAULT_WORKSPACE_CHAT_ID,
            isFromGlobalCreate: false,
            participants: [{reportID: DEFAULT_WORKSPACE_CHAT_ID, policyID: DEFAULT_POLICY_ID, isPolicyExpenseChat: true, selected: true}],
        });

        // When the receipts are captured
        navigateGlobalCreate(['t1', 't2'], false);

        // Then every draft is flagged as global create so the workspace stays editable on the confirmation page
        expect(setTransactionReport).toHaveBeenCalledWith('t1', {reportID: DEFAULT_WORKSPACE_CHAT_ID, isFromGlobalCreate: true}, true);
        expect(setTransactionReport).toHaveBeenCalledWith('t2', {reportID: DEFAULT_WORKSPACE_CHAT_ID, isFromGlobalCreate: true}, true);
        expect(setMoneyRequestParticipantsFromReport).toHaveBeenCalledTimes(2);
    });

    it('flags the drafts as global create when previously selected participants are preserved', async () => {
        // Given a camera button scan where the user already picked a different workspace on the confirmation page
        const participants = [{reportID: OTHER_WORKSPACE_CHAT_ID, policyID: 'otherPolicy', isPolicyExpenseChat: true, selected: true}];
        const navigateGlobalCreate = await renderProvider({
            transactionID: 't1',
            reportID: OTHER_WORKSPACE_CHAT_ID,
            isFromGlobalCreate: false,
            participants,
        });

        // When the receipt is captured again
        navigateGlobalCreate(['t1'], false);

        // Then the chosen workspace is kept and the draft is still flagged as global create so it can be changed again
        expect(setMoneyRequestParticipants).toHaveBeenCalledWith('t1', participants);
        expect(setTransactionReport).toHaveBeenCalledWith('t1', {isFromGlobalCreate: true}, true);
    });
});
