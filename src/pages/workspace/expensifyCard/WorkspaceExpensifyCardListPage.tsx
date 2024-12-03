import React, {useCallback, useMemo, useState} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {FlatList, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@navigation/types';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Card, WorkspaceCardsList} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import EmptyCardView from './EmptyCardView';
import WorkspaceCardListHeader from './WorkspaceCardListHeader';
import WorkspaceCardListRow from './WorkspaceCardListRow';

type WorkspaceExpensifyCardListPageProps = {
    /** Route from navigation */
    route: PlatformStackRouteProp<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>;

    /** List of Expensify cards */
    cardsList: OnyxEntry<WorkspaceCardsList>;
};

function WorkspaceExpensifyCardListPage({route, cardsList}: WorkspaceExpensifyCardListPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [cardOnWaitlist] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST}${policyID}`);

    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate});
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const isBankAccountVerified = !cardOnWaitlist;

    const policyCurrency = useMemo(() => policy?.outputCurrency ?? CONST.CURRENCY.USD, [policy]);

    const sortedCards = useMemo(() => CardUtils.sortCardsByCardholderName(cardsList, personalDetails), [cardsList, personalDetails]);

    const handleIssueCardPress = () => {
        if (isActingAsDelegate) {
            setIsNoDelegateAccessMenuVisible(true);
            return;
        }
        const activeRoute = Navigation.getActiveRoute();
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, activeRoute));
    };

    const getHeaderButtons = () => (
        <View style={[styles.w100, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
            <Button
                success
                onPress={handleIssueCardPress}
                icon={Expensicons.Plus}
                text={translate('workspace.expensifyCard.issueCard')}
                style={shouldUseNarrowLayout && styles.flex1}
            />
            <Button
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS.getRoute(policyID))}
                icon={Expensicons.Gear}
                text={translate('common.settings')}
                style={shouldUseNarrowLayout && styles.flex1}
            />
        </View>
    );

    const renderItem = useCallback(
        ({item, index}: ListRenderItemInfo<Card>) => (
            <OfflineWithFeedback
                key={`${item.nameValuePairs?.cardTitle}_${index}`}
                pendingAction={item.pendingAction}
                errorRowStyles={styles.ph5}
                errors={item.errors}
                onClose={() => PaymentMethods.clearDeletePaymentMethodError(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, item.cardID)}
            >
                <PressableWithFeedback
                    role={CONST.ROLE.BUTTON}
                    style={[styles.mh5, styles.br3, styles.mb3, styles.highlightBG]}
                    accessibilityLabel="row"
                    hoverStyle={[styles.hoveredComponentBG]}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, item.cardID.toString()))}
                >
                    <WorkspaceCardListRow
                        lastFourPAN={item.lastFourPAN ?? ''}
                        cardholder={personalDetails?.[item.accountID ?? '-1']}
                        limit={item.nameValuePairs?.unapprovedExpenseLimit ?? 0}
                        name={item.nameValuePairs?.cardTitle ?? ''}
                        currency={policyCurrency}
                        isVirtual={!!item.nameValuePairs?.isVirtual}
                    />
                </PressableWithFeedback>
            </OfflineWithFeedback>
        ),
        [personalDetails, policyCurrency, policyID, workspaceAccountID, styles],
    );

    const renderListHeader = useCallback(() => <WorkspaceCardListHeader policyID={policyID} />, [policyID]);

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            shouldEnableMaxHeight
            testID={WorkspaceExpensifyCardListPage.displayName}
        >
            <HeaderWithBackButton
                icon={Illustrations.HandCard}
                title={translate('workspace.common.expensifyCard')}
                shouldShowBackButton={shouldUseNarrowLayout}
                onBackButtonPress={() => Navigation.goBack()}
            >
                {!shouldUseNarrowLayout && isBankAccountVerified && getHeaderButtons()}
            </HeaderWithBackButton>
            {shouldUseNarrowLayout && isBankAccountVerified && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
            {isEmptyObject(cardsList) ? (
                <EmptyCardView isBankAccountVerified={isBankAccountVerified} />
            ) : (
                <FlatList
                    data={sortedCards}
                    renderItem={renderItem}
                    ListHeaderComponent={renderListHeader}
                />
            )}
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />
        </ScreenWrapper>
    );
}

WorkspaceExpensifyCardListPage.displayName = 'WorkspaceExpensifyCardListPage';

export default WorkspaceExpensifyCardListPage;
