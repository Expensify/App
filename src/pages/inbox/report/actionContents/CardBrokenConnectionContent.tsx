import React from 'react';
import RenderHTML from '@components/RenderHTML';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {isPersonalCardBrokenConnection} from '@libs/CardUtils';
import {getCardConnectionBrokenMessage, getOriginalMessage, isCardBrokenConnectionAction} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type CardBrokenConnectionContentProps = {
    action: OnyxTypes.ReportAction;
};

function CardBrokenConnectionContent({action}: CardBrokenConnectionContentProps) {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);

    // Type-narrow action to access cardID/cardName from originalMessage
    const originalMessage = isCardBrokenConnectionAction(action) ? getOriginalMessage(action) : undefined;
    const cardID = originalMessage?.cardID;
    const cardName = originalMessage?.cardName;
    const card = cardID ? cardList?.[cardID] : undefined;
    const connectionLink = cardID && isPersonalCardBrokenConnection(card) ? `${environmentURL}/${ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(String(cardID))}` : undefined;

    return (
        <ReportActionItemBasicMessage message="">
            <RenderHTML html={`<comment>${getCardConnectionBrokenMessage(card, cardName, translate, connectionLink)}</comment>`} />
        </ReportActionItemBasicMessage>
    );
}

export default CardBrokenConnectionContent;
