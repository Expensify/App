import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getExpensifyCardFromReportAction} from '@libs/CardMessageUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getCardIssuedMessage, getOriginalMessage, shouldShowAddMissingDetails} from '@libs/ReportActionsUtils';
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
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const assigneeAccountID = (getOriginalMessage(action) as IssueNewCardOriginalMessage)?.assigneeAccountID;
    const card = getExpensifyCardFromReportAction({reportAction: action, policyID});
    const isAssigneeCurrentUser = !isEmptyObject(session) && session.accountID === assigneeAccountID;
    const shouldShowAddMissingDetailsButton = isAssigneeCurrentUser && shouldShowAddMissingDetails(action?.actionName, card);

    return (
        <>
            <RenderHTML html={`<muted-text>${getCardIssuedMessage({reportAction: action, shouldRenderHTML: true, policyID, card})}</muted-text>`} />
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
