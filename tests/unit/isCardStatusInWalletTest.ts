import isCardStatusInWallet from '@libs/Wallet/isCardStatusInWallet';

import type {CardStatus} from '@expensify/react-native-wallet';

describe('isCardStatusInWallet', () => {
    it.each<CardStatus>(['active', 'requireActivation', 'pending', 'suspended'])('treats "%s" as already in the wallet', (status) => {
        // Given a card whose pass exists in the wallet, including passes still waiting for issuer verification (yellow path / "Verify later")
        // When checking whether the card is in the wallet
        const result = isCardStatusInWallet(status);

        // Then it is treated as in the wallet, so the app does not offer to add it again and hit the "already in wallet" error
        expect(result).toBe(true);
    });

    it.each<CardStatus>(['not found', 'deactivated'])('treats "%s" as not in the wallet', (status) => {
        // Given a card with no usable pass in the wallet
        // When checking whether the card is in the wallet
        const result = isCardStatusInWallet(status);

        // Then it is treated as not in the wallet, so the user can add it
        expect(result).toBe(false);
    });
});
