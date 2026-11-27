import useOnyx from '@hooks/useOnyx';

import {
    isActionableVirtualExpensifyCard,
    isActiveExpensifyCard,
    isCardPendingActivate,
    isCardPendingDigitalWalletApproval,
    isCardPendingIssue,
    isCardPendingReplace,
    isCardWithCustomZeroLimit,
} from '@libs/CardUtils';
import {areAddressAndPersonalDetailsMissing} from '@libs/PersonalDetailsUtils';
import {getUnresolvedCardFraudAlertAction} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, ReportActions} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {isActingAsDelegateSelector} from '@selectors/Account';

function useTimeSensitiveCards() {
    const [cards] = useOnyx(ONYXKEYS.CARD_LIST);
    // Resolved in the selector, so other report action writes don't re-render Home.
    const [cardIDsWithFraud] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: (reportActions: OnyxCollection<ReportActions>) => {
            const cardIDs: Record<string, true> = {};
            for (const card of Object.values(cards ?? {})) {
                const fraudAlertReportID = card?.nameValuePairs?.possibleFraud?.fraudAlertReportID;
                if (
                    fraudAlertReportID &&
                    !!getUnresolvedCardFraudAlertAction(card, String(fraudAlertReportID), reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fraudAlertReportID}`])
                ) {
                    cardIDs[card.cardID] = true;
                }
            }
            return cardIDs;
        },
    });
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector});
    const personalDetailsMissing = areAddressAndPersonalDetailsMissing(privatePersonalDetails);

    const cardsNeedingShippingAddress: Card[] = [];
    const cardsNeedingActivation: Card[] = [];
    const cardsWithFraud: Card[] = [];
    const virtualCardsNeedingPersonalDetails: Card[] = [];
    const cardsPendingDigitalWalletApproval: Card[] = [];

    for (const card of Object.values(cards ?? {})) {
        if (!isActiveExpensifyCard(card)) {
            continue;
        }

        if (isCardPendingDigitalWalletApproval(card)) {
            cardsPendingDigitalWalletApproval.push(card);
        }

        if (cardIDsWithFraud?.[card.cardID]) {
            cardsWithFraud.push(card);
        }

        if (isCardWithCustomZeroLimit(card)) {
            continue;
        }

        if (isCardPendingReplace(card)) {
            continue;
        }

        const isVirtualCard = !!card.nameValuePairs?.isVirtual;
        if (isVirtualCard) {
            if (personalDetailsMissing && !isActingAsDelegate && isActionableVirtualExpensifyCard(card)) {
                virtualCardsNeedingPersonalDetails.push(card);
            }
            continue;
        }

        if (isCardPendingIssue(card)) {
            cardsNeedingShippingAddress.push(card);
        }

        if (isCardPendingActivate(card)) {
            cardsNeedingActivation.push(card);
        }
    }

    const shouldShowAddShippingAddress = cardsNeedingShippingAddress.length > 0;
    const shouldShowActivateCard = cardsNeedingActivation.length > 0;
    const shouldShowReviewCardFraud = cardsWithFraud.length > 0;
    const shouldShowAddVirtualCardPersonalDetails = virtualCardsNeedingPersonalDetails.length > 0;
    const shouldShowConfirmDigitalWalletAddition = cardsPendingDigitalWalletApproval.length > 0;

    return {
        shouldShowAddShippingAddress,
        shouldShowActivateCard,
        shouldShowReviewCardFraud,
        shouldShowAddVirtualCardPersonalDetails,
        shouldShowConfirmDigitalWalletAddition,
        cardsNeedingShippingAddress,
        cardsNeedingActivation,
        cardsWithFraud,
        virtualCardsNeedingPersonalDetails,
        cardsPendingDigitalWalletApproval,
    };
}

export default useTimeSensitiveCards;
