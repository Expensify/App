import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getPolicy, getWorkspaceAccountID, isPolicyAdmin} from '@libs/PolicyUtils';
import {getCardIssuedMessage, getOriginalMessage, isActionOfType, shouldShowAddMissingDetails} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import type {IssueNewCardOriginalMessage} from '@src/types/onyx/OriginalMessage';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type IssueCardMessageProps = {
    action: OnyxEntry<ReportAction>;
    policyID: string | undefined;
};

function IssueCardMessage({action, policyID}: IssueCardMessageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const workspaceAccountID = getWorkspaceAccountID(policyID);
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`);
    const assigneeAccountID = (getOriginalMessage(action) as IssueNewCardOriginalMessage)?.assigneeAccountID;
    const cardIssuedActionOriginalMessage = isActionOfType(
        action,
        CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED,
        CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL,
        CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS,
    )
        ? getOriginalMessage(action)
        : undefined;
    const cardID = cardIssuedActionOriginalMessage?.cardID ?? CONST.DEFAULT_NUMBER_ID;
    const card = isPolicyAdmin(getPolicy(policyID)) ? cardsList?.[cardID] : cardList[cardID];
    const isAssigneeCurrentUser = !isEmptyObject(session) && session.accountID === assigneeAccountID;
    const shouldShowAddMissingDetailsButton = isAssigneeCurrentUser && shouldShowAddMissingDetails(action?.actionName, card);

    return (
        <>
            <RenderHTML html={`<muted-text>${getCardIssuedMessage(action, true, policyID, card)}</muted-text>`} />
            {shouldShowAddMissingDetailsButton && (
                <Button
                    onPress={() => Navigation.navigate(ROUTES.MISSING_PERSONAL_DETAILS)}
                    success
                    style={[styles.alignSelfStart, styles.mt3]}
                    text={translate('workspace.expensifyCard.addShippingDetails')}
                />
            )}
        </>
    );
}

IssueCardMessage.displayName = 'IssueCardMessage';

export default IssueCardMessage;
