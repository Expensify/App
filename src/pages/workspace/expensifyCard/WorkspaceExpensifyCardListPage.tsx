import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {FlatList, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
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
import type {Card, WorkspaceCardsList} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import EmptyCardView from './EmptyCardView';
import WorkspaceCardListHeader from './WorkspaceCardListHeader';
import WorkspaceCardListRow from './WorkspaceCardListRow';

type WorkspaceExpensifyCardListPageProps = {route: StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>['route']};

// TODO: remove this const altogether and take the card data from component prop when Onyx data is available
const mockedCards: OnyxEntry<WorkspaceCardsList> = {
    test1: {
        // @ts-expect-error TODO: change cardholder to accountID
        cardholder: {accountID: 1, lastName: 'Smith', firstName: 'Bob', displayName: 'Bob Smith'},
        cardID: 1,
        nameValuePairs: {
            unapprovedExpenseLimit: 1000,
            cardTitle: 'Test 1',
        },
        lastFourPAN: '1234',
    },
    test2: {
        // @ts-expect-error TODO: change cardholder to accountID
        cardholder: {accountID: 2, lastName: 'Miller', firstName: 'Alex', displayName: 'Alex Miller'},
        cardID: 2,
        nameValuePairs: {
            unapprovedExpenseLimit: 2000,
            cardTitle: 'Test 2',
        },
        lastFourPAN: '1234',
    },
    test3: {
        // @ts-expect-error TODO: change cardholder to accountID
        cardholder: {accountID: 3, lastName: 'Brown', firstName: 'Kevin', displayName: 'Kevin Brown'},
        cardID: 3,
        nameValuePairs: {
            unapprovedExpenseLimit: 3000,
            cardTitle: 'Test 3',
        },
        lastFourPAN: '1234',
    },
};

function WorkspaceExpensifyCardListPage({route}: WorkspaceExpensifyCardListPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = route.params.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const policyCurrency = useMemo(() => policy?.outputCurrency ?? CONST.CURRENCY.USD, [policy]);

    // TODO: uncomment the code line below to use cardsList data from Onyx when it's supported
    // const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${policyID}_${CONST.EXPENSIFY_CARD.BANK}`);
    const cardsList = mockedCards;

    const fetchExpensifyCards = useCallback(() => {
        // TODO: uncomment when OpenPolicyExpensifyCardsPage API call is supported
        // Policy.openPolicyExpensifyCardsPage(policyID);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [policyID]);

    useFocusEffect(fetchExpensifyCards);

    const sortedCards = useMemo(
        () =>
            Object.values(cardsList ?? {}).sort((a, b) => {
                // @ts-expect-error TODO: change cardholder to accountID and get personal details with it
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const aName = PersonalDetailsUtils.getDisplayNameOrDefault(a.cardholder ?? {});
                // @ts-expect-error TODO: change cardholder to accountID and get personal details with it
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const bName = PersonalDetailsUtils.getDisplayNameOrDefault(b.cardholder ?? {});
                return localeCompare(aName, bName);
            }),
        [cardsList],
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

    const renderItem = ({item, index}: ListRenderItemInfo<Card>) => (
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
                    // @ts-expect-error TODO: change cardholder to accountID and get personal details with it
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    cardholder={item.cardholder}
                    limit={item.nameValuePairs?.unapprovedExpenseLimit ?? 0}
                    name={item.nameValuePairs?.cardTitle ?? ''}
                    currency={policyCurrency}
                />
            </PressableWithFeedback>
        </OfflineWithFeedback>
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
            {!isEmptyObject(cardsList) ? (
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
