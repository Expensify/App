import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getUpdatedPrivatePersonalDetails, goToNextPhysicalCardRoute} from '@libs/GetPhysicalCardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPolicy, getWorkspaceAccountID, isPolicyAdmin as isPolicyAdminPolicyUtils} from '@libs/PolicyUtils';
import {getCardIssuedMessage, getOriginalMessage, isActionOfType} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
    const workspaceAccountID = getWorkspaceAccountID(policyID);
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`);
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM_DRAFT);

    const assigneeAccountID = (getOriginalMessage(action) as IssueNewCardOriginalMessage)?.assigneeAccountID;

    const missingDetails =
        !privatePersonalDetails?.legalFirstName ||
        !privatePersonalDetails?.legalLastName ||
        !privatePersonalDetails?.dob ||
        !privatePersonalDetails?.phoneNumber ||
        isEmptyObject(privatePersonalDetails?.addresses) ||
        privatePersonalDetails.addresses.length === 0;

    const isAssigneeCurrentUser = !isEmptyObject(session) && session.accountID === assigneeAccountID;

    const cardIssuedActionOriginalMessage = isActionOfType(
        action,
        CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED,
        CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL,
        CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS,
    )
        ? getOriginalMessage(action)
        : undefined;
    const cardID = cardIssuedActionOriginalMessage?.cardID ?? CONST.DEFAULT_NUMBER_ID;
    const isPolicyAdmin = isPolicyAdminPolicyUtils(getPolicy(policyID));
    const card = isPolicyAdmin ? cardsList?.[cardID] : cardList[cardID];
    const shouldShowAddMissingDetailsButton = !isEmptyObject(card) && action?.actionName === CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS && missingDetails && isAssigneeCurrentUser;

    const domain = cardList?.[cardID]?.domainName ?? '';
    const goToNextRoute = useCallback(() => {
        goToNextPhysicalCardRoute(domain, getUpdatedPrivatePersonalDetails(draftValues, privatePersonalDetails), Navigation.getActiveRoute());
    }, [domain, draftValues, privatePersonalDetails]);

    return (
        <>
            <RenderHTML html={`<muted-text>${getCardIssuedMessage(action, true, policyID, !!card)}</muted-text>`} />
            {shouldShowAddMissingDetailsButton && (
                <Button
                    onPress={goToNextRoute}
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
