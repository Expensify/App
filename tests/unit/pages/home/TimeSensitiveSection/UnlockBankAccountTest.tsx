import {fireEvent, render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {pressLockedBankAccount} from '@libs/actions/BankAccounts';
import {navigateToConciergeChat} from '@libs/actions/Report';
import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import TimeSensitiveSection from '@src/pages/home/TimeSensitiveSection';
import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: jest.fn((key: string) => key)})));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        EnvelopeOpenStar: () => null,
        BankLock: () => null,
    })),
}));

jest.mock('@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddPaymentCard', () =>
    jest.fn(() => ({
        shouldShowAddPaymentCard: false,
    })),
);

jest.mock('@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveCards', () =>
    jest.fn(() => ({
        shouldShowAddShippingAddress: false,
        shouldShowActivateCard: false,
        shouldShowReviewCardFraud: false,
        cardsNeedingShippingAddress: [],
        cardsNeedingActivation: [],
        cardsWithFraud: [],
    })),
);

jest.mock('@hooks/useCardFeedErrors', () =>
    jest.fn(() => ({
        cardsWithBrokenFeedConnection: {},
        personalCardsWithBrokenConnection: {},
    })),
);

jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: 'admin@example.com', accountID: 12345})));

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));

jest.mock('@libs/actions/BankAccounts', () => ({
    pressLockedBankAccount: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    navigateToConciergeChat: jest.fn(),
}));

const ADMIN_ACCOUNT_ID = 12345;
const LOCKED_BANK_ACCOUNT_ID = 99;
const POLICY_ID = 'policy_1';
const POLICY_NAME = 'My Workspace';
const CONCIERGE_REPORT_ID = 'concierge_report_1';

const renderTimeSensitiveSection = () =>
    render(
        <OnyxListItemProvider>
            <TimeSensitiveSection />
        </OnyxListItemProvider>,
    );

describe('TimeSensitiveSection - UnlockBankAccount', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.ACCOUNT, {primaryLogin: 'admin@example.com'});
        await waitForBatchedUpdates();
    });

    it('renders UnlockBankAccount widget when a workspace policy has achAccount.state === LOCKED', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: 'admin@example.com', accountID: ADMIN_ACCOUNT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: POLICY_NAME,
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            achAccount: {
                bankAccountID: LOCKED_BANK_ACCOUNT_ID,
                accountNumber: 'XXXXXXXX1234',
                routingNumber: '123456789',
                addressName: 'Test Bank',
                bankName: 'Test Bank',
                reimburser: 'admin@example.com',
                state: CONST.BANK_ACCOUNT.STATE.LOCKED,
            },
        });
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        expect(screen.getByText('homePage.timeSensitiveSection.unlockBankAccount.workspaceTitle')).toBeTruthy();
    });

    it('renders UnlockBankAccount widget when BANK_ACCOUNT_LIST has an entry with accountData.state === LOCKED', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: 'admin@example.com', accountID: ADMIN_ACCOUNT_ID});
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
            [`bankAccount-${LOCKED_BANK_ACCOUNT_ID}`]: {
                bankCurrency: 'USD',
                bankCountry: 'US',
                accountData: {
                    bankAccountID: LOCKED_BANK_ACCOUNT_ID,
                    state: CONST.BANK_ACCOUNT.STATE.LOCKED,
                    type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                },
            },
        });
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        expect(screen.getByText('homePage.timeSensitiveSection.unlockBankAccount.personalTitle')).toBeTruthy();
    });

    it('does NOT render personal UnlockBankAccount for locked business bank accounts', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: 'admin@example.com', accountID: ADMIN_ACCOUNT_ID});
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
            [`bankAccount-${LOCKED_BANK_ACCOUNT_ID}`]: {
                bankCurrency: 'USD',
                bankCountry: 'US',
                accountData: {
                    bankAccountID: LOCKED_BANK_ACCOUNT_ID,
                    state: CONST.BANK_ACCOUNT.STATE.LOCKED,
                    type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                },
            },
        });
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        expect(screen.queryByText('homePage.timeSensitiveSection.unlockBankAccount.personalTitle')).toBeNull();
    });

    it('does NOT render UnlockBankAccount when bank account state is OPEN', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: 'admin@example.com', accountID: ADMIN_ACCOUNT_ID});
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
            [`bankAccount-${LOCKED_BANK_ACCOUNT_ID}`]: {
                bankCurrency: 'USD',
                bankCountry: 'US',
                accountData: {
                    bankAccountID: LOCKED_BANK_ACCOUNT_ID,
                    state: CONST.BANK_ACCOUNT.STATE.OPEN,
                },
            },
        });
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        expect(screen.queryByText('homePage.timeSensitiveSection.unlockBankAccount.workspaceTitle')).toBeNull();
        expect(screen.queryByText('homePage.timeSensitiveSection.unlockBankAccount.personalTitle')).toBeNull();
    });

    it('does NOT render UnlockBankAccount for non-admin users (workspace VBA case)', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: 'member@example.com', accountID: ADMIN_ACCOUNT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: POLICY_NAME,
            role: CONST.POLICY.ROLE.USER,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            achAccount: {
                bankAccountID: LOCKED_BANK_ACCOUNT_ID,
                accountNumber: 'XXXXXXXX1234',
                routingNumber: '123456789',
                addressName: 'Test Bank',
                bankName: 'Test Bank',
                reimburser: 'admin@example.com',
                state: CONST.BANK_ACCOUNT.STATE.LOCKED,
            },
        });
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        expect(screen.queryByText('homePage.timeSensitiveSection.unlockBankAccount.workspaceTitle')).toBeNull();
    });

    it('renders multiple UnlockBankAccount widgets when multiple locked accounts exist', async () => {
        const SECOND_POLICY_ID = 'policy_2';
        const SECOND_LOCKED_BANK_ACCOUNT_ID = 100;

        await Onyx.set(ONYXKEYS.SESSION, {email: 'admin@example.com', accountID: ADMIN_ACCOUNT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: 'Workspace One',
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            achAccount: {
                bankAccountID: LOCKED_BANK_ACCOUNT_ID,
                accountNumber: 'XXXXXXXX1234',
                routingNumber: '123456789',
                addressName: 'Test Bank',
                bankName: 'Test Bank',
                reimburser: 'admin@example.com',
                state: CONST.BANK_ACCOUNT.STATE.LOCKED,
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SECOND_POLICY_ID}`, {
            id: SECOND_POLICY_ID,
            name: 'Workspace Two',
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            achAccount: {
                bankAccountID: SECOND_LOCKED_BANK_ACCOUNT_ID,
                accountNumber: 'XXXXXXXX5678',
                routingNumber: '987654321',
                addressName: 'Another Bank',
                bankName: 'Another Bank',
                reimburser: 'admin@example.com',
                state: CONST.BANK_ACCOUNT.STATE.LOCKED,
            },
        });
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        const widgets = screen.getAllByText('homePage.timeSensitiveSection.unlockBankAccount.workspaceTitle');
        expect(widgets).toHaveLength(2);
    });

    it('does not log duplicate key warnings when multiple workspaces share a locked bankAccountID', async () => {
        const SECOND_POLICY_ID = 'policy_2';
        const duplicateKeyWarningMessage = 'Encountered two children with the same key';
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        try {
            await Onyx.set(ONYXKEYS.SESSION, {email: 'admin@example.com', accountID: ADMIN_ACCOUNT_ID});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                id: POLICY_ID,
                name: 'Workspace One',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.TEAM,
                isPolicyExpenseChatEnabled: true,
                achAccount: {
                    bankAccountID: LOCKED_BANK_ACCOUNT_ID,
                    accountNumber: 'XXXXXXXX1234',
                    routingNumber: '123456789',
                    addressName: 'Test Bank',
                    bankName: 'Test Bank',
                    reimburser: 'admin@example.com',
                    state: CONST.BANK_ACCOUNT.STATE.LOCKED,
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SECOND_POLICY_ID}`, {
                id: SECOND_POLICY_ID,
                name: 'Workspace Two',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.TEAM,
                isPolicyExpenseChatEnabled: true,
                achAccount: {
                    bankAccountID: LOCKED_BANK_ACCOUNT_ID,
                    accountNumber: 'XXXXXXXX5678',
                    routingNumber: '987654321',
                    addressName: 'Another Bank',
                    bankName: 'Another Bank',
                    reimburser: 'admin@example.com',
                    state: CONST.BANK_ACCOUNT.STATE.LOCKED,
                },
            });
            await waitForBatchedUpdates();

            renderTimeSensitiveSection();

            const widgets = screen.getAllByText('homePage.timeSensitiveSection.unlockBankAccount.workspaceTitle');
            expect(widgets).toHaveLength(2);

            const duplicateKeyWarnings = consoleErrorSpy.mock.calls.flat().filter((arg) => typeof arg === 'string' && arg.includes(duplicateKeyWarningMessage));
            expect(duplicateKeyWarnings).toHaveLength(0);
        } finally {
            consoleErrorSpy.mockRestore();
        }
    });

    it('calls pressLockedBankAccount and navigates to Concierge when CTA is pressed', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: 'admin@example.com', accountID: ADMIN_ACCOUNT_ID});
        await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: POLICY_NAME,
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            achAccount: {
                bankAccountID: LOCKED_BANK_ACCOUNT_ID,
                accountNumber: 'XXXXXXXX1234',
                routingNumber: '123456789',
                addressName: 'Test Bank',
                bankName: 'Test Bank',
                reimburser: 'admin@example.com',
                state: CONST.BANK_ACCOUNT.STATE.LOCKED,
            },
        });
        await waitForBatchedUpdates();

        renderTimeSensitiveSection();

        const cta = screen.getByText('homePage.timeSensitiveSection.ctaFix');
        fireEvent.press(cta);

        expect(pressLockedBankAccount).toHaveBeenCalledWith(LOCKED_BANK_ACCOUNT_ID, expect.any(Function), CONCIERGE_REPORT_ID, undefined);
        expect(navigateToConciergeChat).toHaveBeenCalledWith(CONCIERGE_REPORT_ID, undefined, ADMIN_ACCOUNT_ID, false, undefined);
    });
});
