import Button from '@components/ButtonComposed';
import {useSession} from '@components/OnyxListItemProvider';
import RenderHTML from '@components/RenderHTML';

import useGetExpensifyCardFromReportAction from '@hooks/useGetExpensifyCardFromReportAction';
import useLocalize from '@hooks/useLocalize';
import useNonPersonalCardList from '@hooks/useNonPersonalCardList';
import useOnyx from '@hooks/useOnyx';
import useScreenBoundDynamicRoute from '@hooks/useScreenBoundDynamicRoute';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getCardIssuedMessage, getOriginalMessage, shouldShowActivateCard, shouldShowAddMissingDetails} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ReportAction} from '@src/types/onyx';
import type {IssueNewCardOriginalMessage} from '@src/types/onyx/OriginalMessage';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';
import React from 'react';

type IssueCardMessageProps = {
    action: OnyxEntry<ReportAction>;
    policyID: string | undefined;
};

function IssueCardMessage({action, policyID}: IssueCardMessageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const session = useSession();
    const assigneeAccountID = (getOriginalMessage(action) as IssueNewCardOriginalMessage)?.assigneeAccountID;
    const expensifyCard = useGetExpensifyCardFromReportAction({
        reportAction: action,
        policyID,
    });
    const isAssigneeCurrentUser = !isEmptyObject(session) && session.accountID === assigneeAccountID;
    const cardList = useNonPersonalCardList();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const shouldNavigateToCardDetails = isPolicyAdmin(policy);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const companyCard = cardList?.[(getOriginalMessage(action) as IssueNewCardOriginalMessage)?.cardID];
    const shouldShowAddMissingDetailsButton =
        !!expensifyCard?.cardID && isAssigneeCurrentUser && shouldShowAddMissingDetails(action?.actionName, privatePersonalDetails, expensifyCard?.state);
    const shouldShowActivateButton = isAssigneeCurrentUser && shouldShowActivateCard(action?.actionName, expensifyCard, privatePersonalDetails);

    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const buildDynamicRoute = useScreenBoundDynamicRoute();

    return (
        <>
            <RenderHTML
                html={`<muted-text>${getCardIssuedMessage({reportAction: action, shouldRenderHTML: true, shouldNavigateToCardDetails, policyID, buildDynamicRoute, expensifyCard, companyCard, translate, currentUserAccountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID})}</muted-text>`}
            />
            {shouldShowAddMissingDetailsButton && (
                <Button
                    onPress={() => {
                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS.getRoute(String(expensifyCard.cardID))));
                    }}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    style={[styles.alignSelfStart, styles.mt3]}
                >
                    <Button.Text>{translate('workspace.expensifyCard.addShippingDetails')}</Button.Text>
                </Button>
            )}
            {shouldShowActivateButton && (
                <Button
                    onPress={() => {
                        if (!expensifyCard?.cardID) {
                            return;
                        }
                        Navigation.navigate(ROUTES.REPORT_CARD_ACTIVATE.getRoute(expensifyCard.cardID, route.params?.reportID, route.params?.reportActionID));
                    }}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    style={[styles.alignSelfStart, styles.mt3]}
                >
                    <Button.Text>{translate('activateCardPage.activateCard')}</Button.Text>
                </Button>
            )}
        </>
    );
}

export default IssueCardMessage;
