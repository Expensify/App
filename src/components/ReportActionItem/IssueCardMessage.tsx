import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
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

    const assigneeAccountID = (action?.originalMessage as IssueNewCardOriginalMessage)?.assigneeAccountID;

    const missingDetails =
        !privatePersonalDetails?.legalFirstName ||
        !privatePersonalDetails?.legalLastName ||
        !privatePersonalDetails?.dob ||
        !privatePersonalDetails?.phoneNumber ||
        isEmptyObject(privatePersonalDetails?.addresses) ||
        privatePersonalDetails.addresses.length === 0;

    const isAssigneeCurrentUser = !isEmptyObject(session) && session.accountID === assigneeAccountID;

    const shouldShowAddMissingDetailsButton = action?.actionName === CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS && missingDetails && isAssigneeCurrentUser;

    return (
        <>
            <RenderHTML html={`<muted-text>${ReportActionsUtils.getCardIssuedMessage(action, true, policyID)}</muted-text>`} />
            {shouldShowAddMissingDetailsButton && (
                <Button
                    onPress={() => {
                        if (!policyID) {
                            return;
                        }
                        Navigation.navigate(ROUTES.MISSING_PERSONAL_DETAILS.getRoute(policyID));
                    }}
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
