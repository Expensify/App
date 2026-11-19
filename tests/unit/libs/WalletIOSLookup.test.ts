import Log from '@libs/Log';
import {isCardInWallet} from '@libs/Wallet/index.ios';

import type {Card} from '@src/types/onyx';

import type {IOSWalletPass} from '@expensify/react-native-wallet';

import {getCardStatusByIdentifier, getCardStatusBySuffix, listAppleWalletPasses} from '@expensify/react-native-wallet';

import createMock from '../../utils/createMock';

jest.mock('@libs/Log', () => ({
    info: jest.fn(),
    warn: jest.fn(),
}));
jest.mock('@libs/actions/Wallet', () => ({
    issuerEncryptPayloadCallback: jest.fn(),
}));
jest.mock('@expensify/react-native-wallet', () => ({
    addCardToAppleWallet: jest.fn(),
    checkWalletAvailability: jest.fn(),
    getCardStatusByIdentifier: jest.fn(),
    getCardStatusBySuffix: jest.fn(),
    listAppleWalletPasses: jest.fn(),
}));

const PAN_REFERENCE_ID = 'pan-reference-secret';
const PASS_IDENTIFIER = 'pass-identifier-secret';
const LAST_FOUR = '4321';
const card = createMock<Card>({
    cardID: 123,
    token: 'token-secret',
    lastFourPAN: LAST_FOUR,
    // eslint-disable-next-line @typescript-eslint/naming-convention -- matches the backend field name
    nameValuePairs: {expensifyCard_panReferenceID: PAN_REFERENCE_ID},
});

const mockByIdentifier = jest.mocked(getCardStatusByIdentifier);
const mockBySuffix = jest.mocked(getCardStatusBySuffix);
const mockList = jest.mocked(listAppleWalletPasses);
// eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock does not rely on `this` binding
const mockLogInfo = jest.mocked(Log.info);

function createPass(overrides: Partial<IOSWalletPass>): IOSWalletPass {
    return {passTypeIdentifier: 'pass.type', serialNumber: 'serial-secret', activationState: 'active', isRemote: false, ...overrides};
}

describe('isCardInWallet on iOS', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('uses the lookup by identifier when it finds the pass', async () => {
        // Given Wallet finds the pass by the card's panReferenceID.
        mockByIdentifier.mockResolvedValue('active');

        // When checking whether the card is in Wallet.
        const result = await isCardInWallet(card);

        // Then the card is in Wallet, the pass list is not read and the log names the identifier lookup.
        expect(result).toBe(true);
        expect(mockList).not.toHaveBeenCalled();
        expect(mockLogInfo).toHaveBeenCalledWith('Card status: active (lookup: identifier)');
    });

    it('falls back to the last digits when the identifier lookup misses and the pass ID differs', async () => {
        // Given the identifier lookup misses but a local pass with the card's last digits exists under another ID.
        mockByIdentifier.mockResolvedValue('not found');
        mockList.mockResolvedValue([createPass({lastDigits: LAST_FOUR, primaryAccountIdentifier: PASS_IDENTIFIER, activationState: 'requireActivation'}), createPass({isRemote: true})]);

        // When checking whether the card is in Wallet.
        const result = await isCardInWallet(card);

        // Then the pass found by last digits decides the status and the log marks the ID mismatch.
        expect(result).toBe(true);
        expect(mockLogInfo).toHaveBeenCalledWith('Card status: requireActivation (lookup: suffix fallback, passes: 1 local 1 remote, last4 pass: yes, id matches: no)');
    });

    it('reports an ID match in the log when the fallback finds a pass the identifier lookup missed', async () => {
        // Given the identifier lookup misses although the listed pass has the same ID and last digits.
        mockByIdentifier.mockResolvedValue('not found');
        mockList.mockResolvedValue([createPass({lastDigits: LAST_FOUR, primaryAccountIdentifier: PAN_REFERENCE_ID})]);

        // When checking whether the card is in Wallet.
        const result = await isCardInWallet(card);

        // Then the log tells the two lookups disagree, which needs a separate library fix.
        expect(result).toBe(true);
        expect(mockLogInfo).toHaveBeenCalledWith('Card status: active (lookup: suffix fallback, passes: 1 local 0 remote, last4 pass: yes, id matches: yes)');
    });

    it('reports the card as missing when no listed pass matches', async () => {
        // Given the identifier lookup misses and the listed passes belong to other cards.
        mockByIdentifier.mockResolvedValue('not found');
        mockList.mockResolvedValue([createPass({lastDigits: '9999', primaryAccountIdentifier: 'other'}), createPass({isRemote: true, lastDigits: LAST_FOUR})]);

        // When checking whether the card is in Wallet.
        const result = await isCardInWallet(card);

        // Then the card is not in Wallet, and a matching remote-only pass is not used.
        expect(result).toBe(false);
        expect(mockLogInfo).toHaveBeenCalledWith('Card status: not found (lookup: none, passes: 1 local 1 remote, last4 pass: no, id matches: no)');
    });

    it('keeps the identifier result when the pass list cannot be read', async () => {
        // Given the identifier lookup misses and listing passes fails.
        mockByIdentifier.mockResolvedValue('not found');
        mockList.mockRejectedValue(new Error('unavailable'));

        // When checking whether the card is in Wallet.
        const result = await isCardInWallet(card);

        // Then the card is not in Wallet and the log says the list was unavailable.
        expect(result).toBe(false);
        expect(mockLogInfo).toHaveBeenCalledWith('Card status: not found (lookup: none, passes: unavailable)');
    });

    it('looks up by last digits when the card has no token', async () => {
        // Given a card without a token.
        mockBySuffix.mockResolvedValue('active');

        // When checking whether the card is in Wallet.
        const result = await isCardInWallet({...card, token: undefined});

        // Then the library suffix lookup is used and the pass list is not read.
        expect(result).toBe(true);
        expect(mockByIdentifier).not.toHaveBeenCalled();
        expect(mockList).not.toHaveBeenCalled();
    });

    it('logs no identifiers, tokens or card digits', async () => {
        // Given a miss with a matching pass that carries identifiers and last digits.
        mockByIdentifier.mockResolvedValue('not found');
        mockList.mockResolvedValue([createPass({lastDigits: LAST_FOUR, primaryAccountIdentifier: PASS_IDENTIFIER})]);

        // When checking whether the card is in Wallet.
        await isCardInWallet(card);

        // Then no log line contains the panReferenceID, pass identifiers, serial numbers, token or last digits.
        const logged = mockLogInfo.mock.calls.map(([message]) => message).join('\n');
        for (const secret of [PAN_REFERENCE_ID, PASS_IDENTIFIER, 'serial-secret', 'token-secret', LAST_FOUR, 'pass.type']) {
            expect(logged).not.toContain(secret);
        }
    });
});
