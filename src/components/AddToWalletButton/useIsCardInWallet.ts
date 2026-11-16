import useAppFocusEvent from '@hooks/useAppFocusEvent';
import useOnyx from '@hooks/useOnyx';

import {checkIfWalletIsAvailable} from '@libs/Wallet';

import refreshCardWalletStatus from '@userActions/refreshCardWalletStatus';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';

import {useEffect, useState} from 'react';

type UseIsCardInWalletType = {
    isInWallet: boolean | null;
    isCardAvailable: boolean;
    isWalletAvailable: boolean;

    /** Re-reads the card status from the device wallet, e.g. right after the user adds the card */
    refreshWalletStatus: () => Promise<void>;
};

function useIsCardInWallet(card: Card): UseIsCardInWalletType {
    const [walletStatus] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_CARD_WALLET_STATUS}${card.cardID}`);
    const [isWalletAvailable, setIsWalletAvailable] = useState(false);

    // The stored status may be from an earlier visit (e.g. the card was added in the wallet app), so wait for a fresh read
    const [freshStatusCardID, setFreshStatusCardID] = useState<number>();
    const isCardAvailable = card.state === CONST.EXPENSIFY_CARD.STATE.OPEN;
    const refreshWalletStatus = () => refreshCardWalletStatus(card);

    useEffect(() => {
        if (!isCardAvailable) {
            return;
        }

        const {cardID} = card;
        let isCurrentRead = true;
        refreshWalletStatus().then(() => {
            if (!isCurrentRead) {
                return;
            }
            setFreshStatusCardID(cardID);
        });
        return () => {
            isCurrentRead = false;
        };
    }, [refreshWalletStatus, isCardAvailable, card]);

    useEffect(() => {
        if (!isCardAvailable) {
            return;
        }

        checkIfWalletIsAvailable()
            .then((result) => {
                setIsWalletAvailable(result);
            })
            .catch(() => {
                setIsWalletAvailable(false);
            });
    }, [isCardAvailable]);

    // Recheck card status when app regains focus in case user manually adds card to wallet outside the app
    useAppFocusEvent(() => {
        if (!isCardAvailable) {
            return;
        }
        refreshWalletStatus();
    });

    return {
        isInWallet: freshStatusCardID === card.cardID ? (walletStatus?.isInWallet ?? null) : null,
        isCardAvailable,
        isWalletAvailable,
        refreshWalletStatus,
    };
}

export default useIsCardInWallet;
