import type {RouteProp} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {FlatList, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import localeCompare from '@libs/LocaleCompare';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Card} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import EmptyCardView from './EmptyCardView';
import WorkspaceCardListHeader from './WorkspaceCardListHeader';
import WorkspaceCardListRow from './WorkspaceCardListRow';

type WorkspaceExpensifyCardListPageProps = {route: RouteProp<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>};

function WorkspaceExpensifyCardListPage({route}: WorkspaceExpensifyCardListPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = route.params.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${policy?.workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`);

    const policyCurrency = useMemo(() => policy?.outputCurrency ?? CONST.CURRENCY.USD, [policy]);

    const sortedCards = useMemo(
        () =>
            Object.values(cardsList ?? {}).sort((cardA: Card, cardB: Card) => {
                const userA = personalDetails?.[cardA.accountID ?? '-1'] ?? {};
                const userB = personalDetails?.[cardB.accountID ?? '-1'] ?? {};
                const aName = PersonalDetailsUtils.getDisplayNameOrDefault(userA);
                const bName = PersonalDetailsUtils.getDisplayNameOrDefault(userB);
                return localeCompare(aName, bName);
            }),
        [cardsList, personalDetails],
    );

    const getHeaderButtons = () => (
        <View style={[styles.w100, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
            <Button
                medium
                success
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID))}
                icon={Expensicons.Plus}
                text={translate('workspace.expensifyCard.issueCard')}
                style={shouldUseNarrowLayout && styles.flex1}
            />
            <Button
                medium
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
                errorRowStyles={styles.ph5}
                errors={item.errors}
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
                    />
                </PressableWithFeedback>
            </OfflineWithFeedback>
        ),
        [personalDetails, policyCurrency, policyID, styles],
    );

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
                {!shouldUseNarrowLayout && getHeaderButtons()}
            </HeaderWithBackButton>
            {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
            {isEmptyObject(cardsList) ? (
                <EmptyCardView />
            ) : (
                <FlatList
                    data={sortedCards}
                    renderItem={renderItem}
                    ListHeaderComponent={WorkspaceCardListHeader}
                />
            )}
        </ScreenWrapper>
    );
}

WorkspaceExpensifyCardListPage.displayName = 'WorkspaceExpensifyCardListPage';

export default WorkspaceExpensifyCardListPage;
