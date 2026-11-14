import useAppFocusEvent from '@hooks/useAppFocusEvent';

import {checkIfWalletIsAvailable, isCardInWallet} from '@libs/Wallet';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import {useEffect, useRef, useState} from 'react';

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
    const latestRequestIDRef = useRef(0);
    const refreshWalletStatus = () => {
        // Reads can resolve out of order (e.g. a focus refresh started before the card was added), so only the newest one is applied
        latestRequestIDRef.current += 1;
        const requestID = latestRequestIDRef.current;
        const isLatestRequest = () => requestID === latestRequestIDRef.current;

        return isCardInWallet(card)
            .then((result) => {
                if (!isLatestRequest()) {
                    return;
                }
                setIsInWallet(result);
            })
            .catch(() => {
                if (!isLatestRequest()) {
                    return;
                }
                setIsInWallet(false);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

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
