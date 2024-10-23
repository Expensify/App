import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
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
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID ?? '-1');
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`);

    const assigneeAccountID = (ReportActionsUtils.getOriginalMessage(action) as IssueNewCardOriginalMessage)?.assigneeAccountID;

    const missingDetails =
        !privatePersonalDetails?.legalFirstName ||
        !privatePersonalDetails?.legalLastName ||
        !privatePersonalDetails?.dob ||
        !privatePersonalDetails?.phoneNumber ||
        isEmptyObject(privatePersonalDetails?.addresses) ||
        privatePersonalDetails.addresses.length === 0;

    const isAssigneeCurrentUser = !isEmptyObject(session) && session.accountID === assigneeAccountID;

    const shouldShowAddMissingDetailsButton = action?.actionName === CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS && missingDetails && isAssigneeCurrentUser;
    const cardIssuedActionOriginalMessage = ReportActionsUtils.isActionOfType(
        action,
        CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED,
        CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL,
        CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS,
    )
        ? ReportActionsUtils.getOriginalMessage(action)
        : undefined;
    const cardID = cardIssuedActionOriginalMessage?.cardID ?? -1;
    const isPolicyAdmin = PolicyUtils.isPolicyAdmin(PolicyUtils.getPolicy(policyID));
    const card = isPolicyAdmin ? cardsList?.[cardID] : cardList[cardID];

    return (
        <>
            <RenderHTML html={`<muted-text>${ReportActionsUtils.getCardIssuedMessage(action, true, policyID, !!card)}</muted-text>`} />
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
