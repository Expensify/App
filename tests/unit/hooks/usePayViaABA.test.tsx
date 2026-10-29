import {act, renderHook} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import usePayViaABA from '@hooks/usePayViaABA';

import {payViaABA} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockShowDecisionModal = jest.fn();
jest.mock('@hooks/useDecisionModal', () => ({
    __esModule: true,
    default: () => ({showDecisionModal: mockShowDecisionModal}),
}));

let mockIsAccountLocked = false;
const mockShowLockedAccountModal = jest.fn();
jest.mock('@components/LockedAccountModalProvider', () => ({
    useLockedAccountState: () => ({isAccountLocked: mockIsAccountLocked}),
    useLockedAccountActions: () => ({showLockedAccountModal: mockShowLockedAccountModal}),
}));

let mockIsUserValidated = true;
const mockVerifyAccountAndResume = jest.fn<void, [(() => void) | undefined]>();
jest.mock('@hooks/useVerifyAccountAndResume', () => ({
    __esModule: true,
    default: () => ({isUserValidated: mockIsUserValidated, verifyAccountAndResume: mockVerifyAccountAndResume}),
}));

jest.mock('@libs/deferModalPresentationAfterPopoverDismiss', () => ({
    __esModule: true,
    default: (presentModal: () => void) => presentModal(),
}));

jest.mock('@userActions/IOU/PayMoneyRequest', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/IOU/PayMoneyRequest'),
    payViaABA: jest.fn(() => Promise.resolve()),
}));

const ACCOUNT_ID = 1;

function Wrapper({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>{children}</ComposeProviders>;
}
const policy: Policy = {...createRandomPolicy(1), id: 'ABAPolicy'};

describe('usePayViaABA', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsAccountLocked = false;
        mockIsUserValidated = true;
        await act(async () => {
            await Onyx.clear();
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: 'admin@test.com'});
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: 'admin@test.com'}});
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
        });
    });

    it("pays the reports via ABA with the current user's details", async () => {
        // Given the hook's pay function
        const {result} = renderHook(() => usePayViaABA(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        // When two reports are paid without their held expenses
        act(() => result.current.payReportsViaABA(['123', '456'], policy, false));

        // Then the ABA file is downloaded for them, with what the billing and onboarding checks need about the current user
        expect(payViaABA).toHaveBeenCalledWith(
            expect.objectContaining({
                reportIDs: ['123', '456'],
                policy,
                shouldReimburseHeldTransactions: false,
                currentUserAccountID: ACCOUNT_ID,
                amountOwed: 100,
            }),
        );
    });

    it('tells the user when the ABA file fails to download', async () => {
        // Given a payment via ABA
        const {result} = renderHook(() => usePayViaABA(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();
        act(() => result.current.payReportsViaABA(['123'], policy));

        // When the download fails
        const {onDownloadFailed} = jest.mocked(payViaABA).mock.calls.at(0)?.at(0) ?? {};
        onDownloadFailed?.();

        // Then the same "download failed" message as other file downloads is shown
        expect(mockShowDecisionModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: translateLocal('common.downloadFailedTitle'),
                prompt: translateLocal('common.downloadFailedDescription'),
            }),
        );
    });

    it('shows the locked account modal instead of downloading the ABA file', async () => {
        // Given a locked account
        mockIsAccountLocked = true;
        const {result} = renderHook(() => usePayViaABA(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        // When a report is paid via ABA
        act(() => result.current.payReportsViaABA(['123'], policy));

        // Then the user is told their account is locked, since the backend rejects payments from locked accounts
        expect(mockShowLockedAccountModal).toHaveBeenCalled();
        expect(payViaABA).not.toHaveBeenCalled();
    });

    it('downloads the ABA file once an unvalidated user has verified their account', async () => {
        // Given a user who hasn't validated their account
        mockIsUserValidated = false;
        const {result} = renderHook(() => usePayViaABA(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        // When a report is paid via ABA
        act(() => result.current.payReportsViaABA(['123'], policy));

        // Then they're asked to verify their account first, because the file pays out of the workspace's bank account
        expect(payViaABA).not.toHaveBeenCalled();

        // When they've verified it
        act(() => mockVerifyAccountAndResume.mock.calls.at(0)?.at(0)?.());

        // Then the file they asked for is downloaded
        expect(payViaABA).toHaveBeenCalledWith(expect.objectContaining({reportIDs: ['123'], policy}));
    });

    it('is loading while the ABA file downloads', async () => {
        // Given an ABA file that takes a while to download
        let finishDownload: () => void = () => {};
        jest.mocked(payViaABA).mockReturnValueOnce(
            new Promise((resolve) => {
                finishDownload = resolve;
            }),
        );
        const {result} = renderHook(() => usePayViaABA(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        // When a report is paid via ABA
        act(() => result.current.payReportsViaABA(['123'], policy));

        // Then it's loading, so the Pay button can show the user something is happening
        expect(result.current.isDownloadingABAFile).toBe(true);

        // When the download finishes
        await act(async () => finishDownload());

        // Then it stops loading
        expect(result.current.isDownloadingABAFile).toBe(false);
    });
});
