import React from 'react';
import {Text as RNText, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import {useSession} from '@components/OnyxListItemProvider';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getExpensifyCardFromReportAction} from '@libs/CardMessageUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getCardIssuedMessage, getOriginalMessage, shouldShowAddMissingDetails} from '@libs/ReportActionsUtils';
import AppText from '@src/components/Text';
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
    const session = useSession();
    const assigneeAccountID = (getOriginalMessage(action) as IssueNewCardOriginalMessage)?.assigneeAccountID;
    const expensifyCard = getExpensifyCardFromReportAction({reportAction: action, policyID});
    const isAssigneeCurrentUser = !isEmptyObject(session) && session.accountID === assigneeAccountID;
    const shouldShowAddMissingDetailsButton = isAssigneeCurrentUser && shouldShowAddMissingDetails(action?.actionName, expensifyCard);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const companyCard = cardList?.[(getOriginalMessage(action) as IssueNewCardOriginalMessage)?.cardID];

    return (
        <>
            <RenderHTML html={`<muted-text>${getCardIssuedMessage({reportAction: action, shouldRenderHTML: true, policyID, expensifyCard, companyCard})}</muted-text>`} />
            {shouldShowAddMissingDetailsButton && (
                <>
                    <Button
                        onPress={() => Navigation.navigate(ROUTES.MISSING_PERSONAL_DETAILS)}
                        success
                        style={[styles.alignSelfStart, styles.mt3]}
                        text={translate('workspace.expensifyCard.addShippingDetails')}
                    />
                    <Button
                        onPress={() => Navigation.navigate(ROUTES.MISSING_PERSONAL_DETAILS)}
                        success
                        style={[styles.alignSelfStart, styles.mt3]}
                        text={translate('workspace.expensifyCard.addShippingDetails')}
                        fsClass="fs-mask"
                    />
                    <RNText style={{color: 'white'}}>RNText (no mask)</RNText>
                    <RNText
                        style={{color: 'white'}}
                        fsClass="fs-unmask"
                    >
                        RNText (fs-unmask)
                    </RNText>
                    <RNText
                        style={{color: 'white'}}
                        fsClass="fs-mask"
                    >
                        RNText (fs-mask)
                    </RNText>
                    <AppText style={{color: 'white'}}>AppText (no mask)</AppText>
                    <AppText
                        style={{color: 'white'}}
                        fsClass="fs-unmask"
                    >
                        AppText (fs-unmask)
                    </AppText>
                    <AppText
                        style={{color: 'white'}}
                        fsClass="fs-mask"
                    >
                        AppText (fs-mask)
                    </AppText>
                    <View>
                        <RNText style={{color: 'white'}}>RNText inner (no mask)</RNText>
                    </View>
                    <View fsClass="fs-unmask">
                        <RNText style={{color: 'white'}}>RNText inner (fs-unmask)</RNText>
                    </View>
                    <View fsClass="fs-mask">
                        <RNText
                            style={{color: 'white'}}
                            fsClass="fs-unmask"
                        >
                            RNText inner (fs-mask)
                        </RNText>
                    </View>
                    <View>
                        <AppText style={{color: 'white'}}>AppText inner (no mask)</AppText>
                    </View>
                    <View fsClass="fs-unmask">
                        <AppText style={{color: 'white'}}>AppText inner (fs-unmask)</AppText>
                    </View>
                    <View fsClass="fs-mask">
                        <AppText
                            style={{color: 'white'}}
                            fsClass="fs-unmask"
                        >
                            AppText inner (fs-mask)
                        </AppText>
                    </View>
                    <button role="button">
                        <div>Button div test</div>
                    </button>
                    <button
                        role="button"
                        type="button"
                    >
                        <div>Button div test with type button</div>
                    </button>
                    <button
                        role="button"
                        type="button"
                        fs-class="fs-mask"
                    >
                        <div>Button div test with type button and fs-mask</div>
                    </button>
                </>
            )}
        </>
    );
}

IssueCardMessage.displayName = 'IssueCardMessage';

export default IssueCardMessage;
