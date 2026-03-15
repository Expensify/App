import {act, renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import usePaymentGuard from '@components/SettlementButton/usePaymentGuard';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
}));

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({name: 'Report', params: {}})),
    getState: jest.fn(() => ({})),
}));

jest.mock('@src/hooks/useResponsiveLayout');

const mockShowDelegateNoAccessModal = jest.fn();
const mockShowLockedAccountModal = jest.fn();
let mockIsDelegateAccessRestricted = false;
let mockIsAccountLocked = false;

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: mockIsDelegateAccessRestricted}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: mockShowDelegateNoAccessModal}),
}));

jest.mock('@components/LockedAccountModalProvider', () => ({
    useLockedAccountState: () => ({isAccountLocked: mockIsAccountLocked}),
    useLockedAccountActions: () => ({showLockedAccountModal: mockShowLockedAccountModal}),
}));

const CHAT_REPORT_ID = '200';
const REPORT_ID = '100';

describe('usePaymentGuard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsDelegateAccessRestricted = false;
        mockIsAccountLocked = false;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('returns false when no restrictions apply', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true});
        });

        const {result} = renderHook(() => usePaymentGuard(CHAT_REPORT_ID, REPORT_ID, undefined));

        await waitFor(() => {
            expect(result.current.checkForNecessaryAction()).toBe(false);
        });

        expect(mockShowDelegateNoAccessModal).not.toHaveBeenCalled();
        expect(mockShowLockedAccountModal).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('shows delegate modal and returns true when delegate access is restricted', async () => {
        mockIsDelegateAccessRestricted = true;
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true});
        });

        const {result} = renderHook(() => usePaymentGuard(CHAT_REPORT_ID, REPORT_ID, undefined));

        await waitFor(() => {
            expect(result.current.checkForNecessaryAction()).toBe(true);
        });

        expect(mockShowDelegateNoAccessModal).toHaveBeenCalledTimes(1);
        expect(mockShowLockedAccountModal).not.toHaveBeenCalled();
    });

    it('shows locked account modal and returns true when account is locked', async () => {
        mockIsAccountLocked = true;
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true});
        });

        const {result} = renderHook(() => usePaymentGuard(CHAT_REPORT_ID, REPORT_ID, undefined));

        await waitFor(() => {
            expect(result.current.checkForNecessaryAction()).toBe(true);
        });

        expect(mockShowLockedAccountModal).toHaveBeenCalledTimes(1);
        expect(mockShowDelegateNoAccessModal).not.toHaveBeenCalled();
    });

    it('returns true when user is not validated', async () => {
        // Don't set validated: true — user is unvalidated by default
        const {result} = renderHook(() => usePaymentGuard(CHAT_REPORT_ID, REPORT_ID, undefined));

        await waitFor(() => {
            expect(result.current.checkForNecessaryAction()).toBe(true);
        });

        expect(mockShowDelegateNoAccessModal).not.toHaveBeenCalled();
        expect(mockShowLockedAccountModal).not.toHaveBeenCalled();
    });

    it('checks delegate access before locked account (priority order)', async () => {
        mockIsDelegateAccessRestricted = true;
        mockIsAccountLocked = true;

        const {result} = renderHook(() => usePaymentGuard(CHAT_REPORT_ID, REPORT_ID, undefined));

        await waitFor(() => {
            expect(result.current.checkForNecessaryAction()).toBe(true);
        });

        // Delegate check is first, so only delegate modal should show
        expect(mockShowDelegateNoAccessModal).toHaveBeenCalledTimes(1);
        expect(mockShowLockedAccountModal).not.toHaveBeenCalled();
    });

    it('exposes userBillingGraceEndPeriods for approve action consumption', async () => {
        const {result} = renderHook(() => usePaymentGuard(CHAT_REPORT_ID, REPORT_ID, undefined));

        await waitFor(() => {
            expect(result.current).toHaveProperty('userBillingGraceEndPeriods');
        });
    });
});
