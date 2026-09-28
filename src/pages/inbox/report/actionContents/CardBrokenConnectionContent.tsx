import RenderHTML from '@components/RenderHTML';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {isPersonalCardBrokenConnection} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {getCardConnectionBrokenMessage, getOriginalMessage} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
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

    const connectionLink =
        cardID && isPersonalCardBrokenConnection(card) ? `${environmentURL}/${createDynamicRoute(DYNAMIC_ROUTES.PERSONAL_CARD_DETAILS.getRoute(String(cardID)))}` : undefined;

    const is30DaysReminder = action.actionName === CONST.REPORT.ACTIONS.TYPE.PERSONAL_CARD_CONNECTION_BROKEN_30_DAYS;
    const brokenConnectionMessage = getCardConnectionBrokenMessage(card, cardName, translate, is30DaysReminder, connectionLink);

    return (
        <ReportActionItemBasicMessage message="">
            <RenderHTML html={`<comment>${brokenConnectionMessage}</comment>`} />
        </ReportActionItemBasicMessage>
    );
}

export default CardBrokenConnectionContent;
