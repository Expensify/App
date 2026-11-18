import {act, renderHook} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {ModalStateChangePayload} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PayViaABADownloadModal from '@components/PayViaABADownloadModal';
import type {PayViaABADownloadModalProps} from '@components/PayViaABADownloadModal';

import usePayViaABA from '@hooks/usePayViaABA';

import HttpsError from '@libs/Errors/HttpsError';
import Log from '@libs/Log';
import saveTextFile from '@libs/saveTextFile';

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

const mockShowModal = jest.fn<Promise<ModalStateChangePayload>, [{component: unknown; props?: Partial<PayViaABADownloadModalProps>}]>(() => Promise.resolve({action: 'CLOSE'}));
jest.mock('@components/Modal/Global/ModalContext', () => ({
    ...jest.requireActual<Record<string, unknown>>('@components/Modal/Global/ModalContext'),
    useModal: () => ({showModal: mockShowModal}),
}));

/** Gets the failure message the download modal would show, from the props it was opened with */
function getDownloadFailedMessage(error?: HttpsError) {
    return mockShowModal.mock.calls.at(0)?.[0].props?.getDownloadFailedMessage?.(error);
}

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

jest.mock('@libs/saveTextFile', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve()),
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
        const onPaid = jest.fn();
        act(() => result.current.payReportsViaABA([{reportID: '123'}, {reportID: '456'}], policy, {shouldReimburseHeldTransactions: false, onPaid}));

        // Then the ABA file is downloaded for them, with what the billing and onboarding checks need about the current user
        expect(payViaABA).toHaveBeenCalledWith(
            expect.objectContaining({
                reportIDs: ['123', '456'],
                policy,
                shouldReimburseHeldTransactions: false,
                onPaid,
                currentUserAccountID: ACCOUNT_ID,
                amountOwed: 100,
            }),
        );
    });

    it('shows the download modal for the ABA file', async () => {
        // Given a payment via ABA
        const abaFileRequest = Promise.resolve({fileName: 'ABA_Report_123.aba', content: 'ABA file'});
        jest.mocked(payViaABA).mockReturnValueOnce(abaFileRequest);
        const {result} = renderHook(() => usePayViaABA(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        // When the report is paid via ABA
        act(() => result.current.payReportsViaABA([{reportID: '123'}], policy));

        // Then the download modal waits for the file, so it can save it once the report is paid
        expect(mockShowModal).toHaveBeenCalledWith({component: PayViaABADownloadModal, props: expect.objectContaining({abaFileRequest})});
    });

    it('still saves the ABA file when the download modal is closed before the file is ready', async () => {
        // Given a payment via ABA whose download modal the user closes while the file is still generating
        const abaFile = {fileName: 'ABA_Report_123.aba', content: 'ABA file'};
        jest.mocked(payViaABA).mockReturnValueOnce(Promise.resolve(abaFile));
        mockShowModal.mockResolvedValueOnce({action: 'CLOSE'});
        const {result} = renderHook(() => usePayViaABA(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        // When the report is paid via ABA
        act(() => result.current.payReportsViaABA([{reportID: '123'}], policy));
        await waitForBatchedUpdatesWithAct();

        // Then the file is still saved, because closing the modal doesn't stop the report being paid
        expect(saveTextFile).toHaveBeenCalledWith(abaFile);
    });

    it("doesn't save the ABA file again when the download modal is closed after it was ready", async () => {
        // Given a payment via ABA whose download modal already downloaded the file before the user closed it
        jest.mocked(payViaABA).mockReturnValueOnce(Promise.resolve({fileName: 'ABA_Report_123.aba', content: 'ABA file'}));
        mockShowModal.mockResolvedValueOnce({action: 'CONFIRM'});
        const {result} = renderHook(() => usePayViaABA(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        // When the report is paid via ABA
        act(() => result.current.payReportsViaABA([{reportID: '123'}], policy));
        await waitForBatchedUpdatesWithAct();

        // Then the file isn't saved a second time
        expect(saveTextFile).not.toHaveBeenCalled();
    });

    it('logs instead of saving when the payment fails after the download modal was closed', async () => {
        // Given a payment via ABA that fails after the user closed its download modal
        const logWarnSpy = jest.spyOn(Log, 'warn');
        jest.mocked(payViaABA).mockImplementationOnce(() => Promise.reject(new Error('Failed to download the ABA file')));
        mockShowModal.mockImplementationOnce(({props}) => {
            // The real modal handles the request's failure as soon as it opens
            props?.abaFileRequest?.catch(() => {});
            return Promise.resolve({action: 'CLOSE'});
        });
        const {result} = renderHook(() => usePayViaABA(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        // When the report is paid via ABA
        act(() => result.current.payReportsViaABA([{reportID: '123'}], policy));
        await waitForBatchedUpdatesWithAct();

        // Then there's no file to save, and the failure is logged since the modal that would show it is gone
        expect(saveTextFile).not.toHaveBeenCalled();
        expect(logWarnSpy).toHaveBeenCalled();
    });

    it('tells the user when the ABA file fails to download', async () => {
        // Given a payment via ABA
        const {result} = renderHook(() => usePayViaABA(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();
        act(() => result.current.payReportsViaABA([{reportID: '123'}], policy));

        // When the download fails
        const message = getDownloadFailedMessage();

        // Then the same "download failed" message as other file downloads is shown
        expect(message).toBe(translateLocal('common.downloadFailedDescription'));
    });

    it("names the employee when the ABA file can't pay them because they have no bank account", async () => {
        // Given a report submitted by an employee who hasn't added a bank account the ABA file can pay into
        const employeeAccountID = 2;
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[employeeAccountID]: {accountID: employeeAccountID, login: 'tom@test.com', displayName: 'Tom Jones'}});
        });
        const {result} = renderHook(() => usePayViaABA(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();
        act(() => result.current.payReportsViaABA([{reportID: '123', ownerAccountID: employeeAccountID}], policy));

        // When the download fails because they're missing a deposit account
        const message = getDownloadFailedMessage(new HttpsError({message: '402 Missing AU deposit account', status: '402'}));

        // Then the admin is told who needs to add one, since trying again won't work until they do
        expect(message).toBe(translateLocal('iou.missingABADepositAccount', {name: 'Tom Jones'}));
    });

    it("tells the admin that someone is missing a bank account when it doesn't know who", async () => {
        // Given several reports being paid via ABA
        const {result} = renderHook(() => usePayViaABA(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();
        act(() => result.current.payReportsViaABA([{reportID: '123'}, {reportID: '456'}], policy));

        // When the download fails because one of their submitters is missing a deposit account
        const message = getDownloadFailedMessage(new HttpsError({message: '402 Missing AU deposit account', status: '402'}));

        // Then the admin is still told why, without a name, since the error doesn't say which report it was
        expect(message).toBe(translateLocal('iou.submittersMissingABADepositAccount'));
    });

    it('shows the locked account modal instead of downloading the ABA file', async () => {
        // Given a locked account
        mockIsAccountLocked = true;
        const {result} = renderHook(() => usePayViaABA(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        // When a report is paid via ABA
        act(() => result.current.payReportsViaABA([{reportID: '123'}], policy));

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
        act(() => result.current.payReportsViaABA([{reportID: '123'}], policy));

        // Then they're asked to verify their account first, because the file pays out of the workspace's bank account
        expect(payViaABA).not.toHaveBeenCalled();

        // When they've verified it
        act(() => mockVerifyAccountAndResume.mock.calls.at(0)?.at(0)?.());

        // Then the file they asked for is downloaded
        expect(payViaABA).toHaveBeenCalledWith(expect.objectContaining({reportIDs: ['123'], policy}));
    });
});
