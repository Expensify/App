import {getExpensifyCardPendingWalletApproval} from '@libs/actions/Card';

import ONYXKEYS from '@src/ONYXKEYS';

import {useFocusEffect} from '@react-navigation/native';
import {hasActiveExpensifyCardSelector} from '@selectors/Card';

import useOnyx from './useOnyx';

/** Re-reads the pending wallet addition on focus, since a new one can arrive at any time. Only cardholders can have one. */
function useRefreshPendingDigitalWalletApproval() {
    const [hasActiveExpensifyCard] = useOnyx(ONYXKEYS.CARD_LIST, {selector: hasActiveExpensifyCardSelector});

    useFocusEffect(() => {
        if (!hasActiveExpensifyCard) {
            return;
        }
        getExpensifyCardPendingWalletApproval();
    });
}

export default useRefreshPendingDigitalWalletApproval;
