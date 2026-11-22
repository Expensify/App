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
    const latestReadRef = useRef<Promise<void>>(Promise.resolve());
    const refreshWalletStatus = () => {
        latestRequestIDRef.current += 1;
        const requestID = latestRequestIDRef.current;

        const read = isCardInWallet(card)
            .catch(() => false)
            .then((result): Promise<void> | undefined => {
                // Reads can resolve out of order (e.g. a focus refresh started meanwhile), so a stale one waits for the newest
                if (requestID !== latestRequestIDRef.current) {
                    return latestReadRef.current;
                }
                setIsInWallet(result);
                setIsLoading(false);
            });
        latestReadRef.current = read;
        return read;
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
