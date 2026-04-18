import type {OnyxCollection} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {isCard, isCardPendingActivate, isCardPendingIssue, isCardWithCustomZeroLimit, isCardWithPotentialFraud, isExpensifyCard} from '@libs/CardUtils';
import {getOriginalMessage, isActionableCardFraudAlert} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, ReportActions} from '@src/types/onyx';

function useTimeSensitiveCards() {
    const [cards] = useOnyx(ONYXKEYS.CARD_LIST);

    const fraudAlertReportIDs = Object.values(cards ?? {})
        .filter((card): card is Card => isCard(card) && isExpensifyCard(card) && isCardWithPotentialFraud(card))
        .map((card) => card.nameValuePairs?.possibleFraud?.fraudAlertReportID)
        .filter((id): id is number => !!id);

    // We avoid using `getUnresolvedCardFraudAlertAction` here because it reads report actions from a
    // module-level Onyx.connect variable, which is not a React subscription and won't trigger re-renders.
    // Instead, we subscribe to ONYXKEYS.COLLECTION.REPORT_ACTIONS via useOnyx with a selector, so that
    // this hook re-renders when the relevant report actions are loaded or updated (e.g. fraud resolved).
    const fraudActionsSelector = (allReportActions: OnyxCollection<ReportActions>) => {
        const result: Record<number, boolean> = {};
        for (const reportID of fraudAlertReportIDs) {
            const actions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? {};
            result[reportID] = Object.values(actions).some((action) => isActionableCardFraudAlert(action) && !getOriginalMessage(action)?.resolution);
        }
        return result;
    };

    const [hasUnresolvedFraudByReport] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {selector: fraudActionsSelector}, [fraudActionsSelector]);

    const cardsNeedingShippingAddress: Card[] = [];
    const cardsNeedingActivation: Card[] = [];
    const cardsWithFraud: Card[] = [];

    for (const card of Object.values(cards ?? {})) {
        if (!isCard(card)) {
            continue;
        }

        if (!isExpensifyCard(card)) {
            continue;
        }

        const fraudAlertReportID = card.nameValuePairs?.possibleFraud?.fraudAlertReportID;
        const hasUnresolvedFraudAction = !!fraudAlertReportID && !!hasUnresolvedFraudByReport?.[fraudAlertReportID];

        if (isCardWithPotentialFraud(card) && !!fraudAlertReportID && hasUnresolvedFraudAction) {
            cardsWithFraud.push(card);
        }

        if (isCardWithCustomZeroLimit(card)) {
            continue;
        }

        const isPhysicalCard = !card.nameValuePairs?.isVirtual;
        if (!isPhysicalCard) {
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

    return {
        shouldShowAddShippingAddress,
        shouldShowActivateCard,
        shouldShowReviewCardFraud,
        cardsNeedingShippingAddress,
        cardsNeedingActivation,
        cardsWithFraud,
    };
}

export default useTimeSensitiveCards;
