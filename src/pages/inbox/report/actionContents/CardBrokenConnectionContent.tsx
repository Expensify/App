import RenderHTML from '@components/RenderHTML';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {isPersonalCardBrokenConnection} from '@libs/CardUtils';
import {getCardConnectionBroken30DaysMessage, getCardConnectionBrokenMessage, getOriginalMessage} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';

import {cardByIdSelector} from '@selectors/Card';
import React from 'react';

type CardBrokenConnectionContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.PERSONAL_CARD_CONNECTION_BROKEN | typeof CONST.REPORT.ACTIONS.TYPE.PERSONAL_CARD_CONNECTION_BROKEN_30_DAYS>;
};

function CardBrokenConnectionContent({action}: CardBrokenConnectionContentProps) {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();

    const message = getOriginalMessage(action);
    const cardID = message?.cardID;
    const cardName = message?.cardName;

    const [card] = useOnyx(ONYXKEYS.CARD_LIST, {selector: cardByIdSelector(String(cardID))});

    const connectionLink = cardID && isPersonalCardBrokenConnection(card) ? `${environmentURL}/${ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(String(cardID))}` : undefined;

    const brokenConnectionMessage =
        action.actionName === CONST.REPORT.ACTIONS.TYPE.PERSONAL_CARD_CONNECTION_BROKEN_30_DAYS
            ? getCardConnectionBroken30DaysMessage(card, cardName, translate, connectionLink)
            : getCardConnectionBrokenMessage(card, cardName, translate, connectionLink);

    return (
        <ReportActionItemBasicMessage message="">
            <RenderHTML html={`<comment>${brokenConnectionMessage}</comment>`} />
        </ReportActionItemBasicMessage>
    );
}

export default CardBrokenConnectionContent;
