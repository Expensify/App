/**
 * Reads whether a card is in the device wallet and shares the result through a RAM-only Onyx key, so every component
 * showing the card's wallet state (the Add to Wallet button, the "Added to wallet" text) updates from the same read.
 */
import {isCardInWallet} from '@libs/Wallet';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

type LatestRead = {
    requestNumber: number;
    promise: Promise<void>;
};

/** The newest read per cardID, so a slower older read never overwrites a newer result and settles only once that one is saved */
const latestReads = new Map<number, LatestRead>();

/** Re-reads the card from the device wallet. Resolves once the newest status for the card is saved to Onyx. */
function refreshCardWalletStatus(card: Card): Promise<void> {
    const {cardID} = card;
    const requestNumber = (latestReads.get(cardID)?.requestNumber ?? 0) + 1;

    const promise = isCardInWallet(card)
        .catch(() => false)
        .then((isInWallet): Promise<void> | undefined => {
            const latestRead = latestReads.get(cardID);
            if (latestRead && latestRead.requestNumber !== requestNumber) {
                return latestRead.promise;
            }
            return Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_CARD_WALLET_STATUS}${cardID}`, {isInWallet});
        });
    latestReads.set(cardID, {requestNumber, promise});
    return promise;
}

export default refreshCardWalletStatus;
