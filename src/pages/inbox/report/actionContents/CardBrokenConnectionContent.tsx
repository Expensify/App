import {cardByIdSelector} from '@selectors/Card';
import React from 'react';
import RenderHTML from '@components/RenderHTML';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {isPersonalCardBrokenConnection} from '@libs/CardUtils';
import {getCardConnectionBrokenMessage, getOriginalMessage} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';

type CardBrokenConnectionContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.PERSONAL_CARD_CONNECTION_BROKEN>;
};

function CardBrokenConnectionContent({action}: CardBrokenConnectionContentProps) {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();

    const message = getOriginalMessage(action);
    const cardID = message?.cardID;
    const cardName = message?.cardName;

    const [card] = useOnyx(ONYXKEYS.CARD_LIST, {selector: cardByIdSelector(String(cardID))});

    const connectionLink = cardID && isPersonalCardBrokenConnection(card) ? `${environmentURL}/${ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(String(cardID))}` : undefined;

    return (
        <ReportActionItemBasicMessage message="">
            <RenderHTML html={`<comment>${getCardConnectionBrokenMessage(card, cardName, translate, connectionLink)}</comment>`} />
        </ReportActionItemBasicMessage>
    );
}

CardBrokenConnectionContent.displayName = 'CardBrokenConnectionContent';

export default CardBrokenConnectionContent;
