import type {CardStatus} from '@expensify/react-native-wallet';

/** Statuses where a pass for the card already exists in the device wallet, so adding it again would fail. */
const IN_WALLET_STATUSES = new Set<CardStatus>(['active', 'requireActivation', 'pending', 'suspended']);

function isCardStatusInWallet(status: CardStatus): boolean {
    return IN_WALLET_STATUSES.has(status);
}

export default isCardStatusInWallet;
