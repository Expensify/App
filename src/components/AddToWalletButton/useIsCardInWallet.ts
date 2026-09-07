import useAppFocusEvent from '@hooks/useAppFocusEvent';

import {isCardInWallet} from '@libs/Wallet';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import {useCallback, useEffect, useState} from 'react';

type UseIsCardInWalletType = {
    isInWallet: boolean | null;
    isLoading: boolean;
    isCardAvailable: boolean;
};

function useIsCardInWallet(card: Card): UseIsCardInWalletType {
    const [isInWallet, setIsInWallet] = useState<boolean | null>(null);
    const isCardAvailable = card.state === CONST.EXPENSIFY_CARD.STATE.OPEN;
    const [isLoading, setIsLoading] = useState(false);
    const checkIfCardIsInWallet = useCallback(() => {
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
    }, [card]);

    useEffect(() => {
        if (!isCardAvailable) {
            return;
        }

        checkIfCardIsInWallet();
    }, [checkIfCardIsInWallet, isCardAvailable, card]);

    // Recheck card status when app regains focus in case user manually adds card to wallet outside the app
    useAppFocusEvent(
        useCallback(() => {
            if (!isCardAvailable) {
                return;
            }
            checkIfCardIsInWallet();
        }, [checkIfCardIsInWallet, isCardAvailable]),
    );

    return {
        isInWallet,
        isLoading,
        isCardAvailable,
    };
}

export default useIsCardInWallet;
