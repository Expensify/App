import {isActingAsDelegateSelector} from '@selectors/Account';
import useOnyx from '@hooks/useOnyx';
import {isCard, isCardPendingActivate, isCardPendingIssue, isCardPendingReplace, isCardWithCustomZeroLimit, isCardWithPotentialFraud, isExpensifyCard} from '@libs/CardUtils';
import {arePersonalDetailsMissing} from '@libs/PersonalDetailsUtils';
import {getUnresolvedCardFraudAlertAction} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';

function useTimeSensitiveCards() {
    const [cards] = useOnyx(ONYXKEYS.CARD_LIST);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector});
    const personalDetailsMissing = arePersonalDetailsMissing(privatePersonalDetails);

    const cardsNeedingShippingAddress: Card[] = [];
    const cardsNeedingActivation: Card[] = [];
    const cardsWithFraud: Card[] = [];
    const virtualCardsNeedingPersonalDetails: Card[] = [];

    for (const card of Object.values(cards ?? {})) {
        if (!isCard(card) || !isExpensifyCard(card) || !CONST.EXPENSIFY_CARD.ACTIVE_STATES.includes(card.state)) {
            continue;
        }

        const fraudAlertReportID = card.nameValuePairs?.possibleFraud?.fraudAlertReportID;
        const reportActions = fraudAlertReportID ? allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fraudAlertReportID}`] : undefined;
        const hasUnresolvedFraudAction = !!fraudAlertReportID && !!getUnresolvedCardFraudAlertAction(String(fraudAlertReportID), reportActions);

        if (isCardWithPotentialFraud(card) && !!fraudAlertReportID && hasUnresolvedFraudAction) {
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
            if (personalDetailsMissing && !isActingAsDelegate) {
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

    return {
        shouldShowAddShippingAddress,
        shouldShowActivateCard,
        shouldShowReviewCardFraud,
        shouldShowAddVirtualCardPersonalDetails,
        cardsNeedingShippingAddress,
        cardsNeedingActivation,
        cardsWithFraud,
        virtualCardsNeedingPersonalDetails,
    };
}

export default useTimeSensitiveCards;
