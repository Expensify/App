import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import RenderHTML from '@components/RenderHTML';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type IssueCardMessageProps = {
    action: OnyxEntry<ReportAction>;
};

function IssueCardMessage({action}: IssueCardMessageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    // TODO: now mocking accountID with current user accountID instead of action.message.assigneeAccountID
    const personalData = useCurrentUserPersonalDetails();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);

    // TODO: now mocking accountID with current user accountID instead of action.message.assigneeAccountID
    const assignee = `<mention-user accountID=${personalData.accountID}></mention-user>`;
    const link = `<a href='${environmentURL}/${ROUTES.SETTINGS_WALLET}'>${translate('cardPage.expensifyCard')}</a>`;

    const noMailingAddress = action?.actionName === CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS && isEmptyObject(privatePersonalDetails?.address);

    const getTranslation = () => {
        switch (action?.actionName) {
            case CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED:
                return translate('workspace.expensifyCard.issuedCard', assignee);
            case CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL:
                return translate('workspace.expensifyCard.issuedCardVirtual', {assignee, link});
            case CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS:
                return translate(`workspace.expensifyCard.${noMailingAddress ? 'issuedCardNoMailingAddress' : 'addedAddress'}`, assignee);
            default:
                return '';
        }
    };

    return (
        <>
            <RenderHTML html={`<muted-text>${getTranslation()}</muted-text>`} />
            {noMailingAddress && (
                <Button
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_ADDRESS)}
                    success
                    medium
                    style={[styles.alignSelfStart, styles.mt3]}
                    text={translate('workspace.expensifyCard.addMailingAddress')}
                />
            )}
        </>
    );
}

IssueCardMessage.displayName = 'IssueCardMessage';

export default IssueCardMessage;
