import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import RenderHTML from '@components/RenderHTML';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import type OriginalMessage from '@src/types/onyx/OriginalMessage';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type IssueCardMessageProps = {
    action: OnyxEntry<ReportAction>;

    policyID: string | undefined;
};

type IssueNewCardOriginalMessage = OriginalMessage<
    typeof CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS | typeof CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED | typeof CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL
>;

function IssueCardMessage({action, policyID}: IssueCardMessageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const assigneeAccountID = (action?.originalMessage as IssueNewCardOriginalMessage)?.assigneeAccountID;

    const assignee = `<mention-user accountID=${assigneeAccountID}></mention-user>`;
    const link = `<a href='${environmentURL}/${ROUTES.SETTINGS_WALLET}'>${translate('cardPage.expensifyCard')}</a>`;

    const missingDetails =
        !privatePersonalDetails?.legalFirstName ||
        !privatePersonalDetails?.legalLastName ||
        !privatePersonalDetails?.dob ||
        !privatePersonalDetails?.phoneNumber ||
        isEmptyObject(privatePersonalDetails?.addresses) ||
        privatePersonalDetails.addresses.length === 0;

    const isAssigneeCurrentUser = !isEmptyObject(session) && session.accountID === assigneeAccountID;

    const shouldShowDetailsButton = action?.actionName === CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS && missingDetails && isAssigneeCurrentUser;

    const getTranslation = () => {
        switch (action?.actionName) {
            case CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED:
                return translate('workspace.expensifyCard.issuedCard', assignee);
            case CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL:
                return translate('workspace.expensifyCard.issuedCardVirtual', {assignee, link});
            case CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS:
                return translate(`workspace.expensifyCard.${!isAssigneeCurrentUser || shouldShowDetailsButton ? 'issuedCardNoShippingDetails' : 'addedShippingDetails'}`, assignee);
            default:
                return '';
        }
    };

    return (
        <>
            <RenderHTML html={`<muted-text>${getTranslation()}</muted-text>`} />
            {shouldShowDetailsButton && (
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
