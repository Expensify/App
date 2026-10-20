import useAppFocusEvent from '@hooks/useAppFocusEvent';

import {checkIfWalletIsAvailable, isCardInWallet} from '@libs/Wallet';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import {useEffect, useState} from 'react';

type UseIsCardInWalletType = {
    isInWallet: boolean | null;
    isLoading: boolean;
    isCardAvailable: boolean;
    isWalletAvailable: boolean;

    /** Re-reads the card status from the device wallet, e.g. right after the user adds the card */
    refreshWalletStatus: () => Promise<void>;
};

function useIsCardInWallet(card: Card): UseIsCardInWalletType {
    const [isInWallet, setIsInWallet] = useState<boolean | null>(null);
    const [isWalletAvailable, setIsWalletAvailable] = useState(false);
    const isCardAvailable = card.state === CONST.EXPENSIFY_CARD.STATE.OPEN;
    const [isLoading, setIsLoading] = useState(false);
    const refreshWalletStatus = () =>
        isCardInWallet(card)
            .then((result) => {
                setIsInWallet(result);
            })
            .catch(() => {
                setIsInWallet(false);
            })
            .finally(() => {
                setIsLoading(false);
            });

    useEffect(() => {
        if (!isCardAvailable) {
            return;
        }

        refreshWalletStatus();
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
        isInWallet,
        isLoading,
        isCardAvailable,
        isWalletAvailable,
        refreshWalletStatus,
    };
}

export default useIsCardInWallet;
