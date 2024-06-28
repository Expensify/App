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
import {PressableWithoutFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import localeCompare from '@libs/LocaleCompare';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {ExpensifyCard, ExpensifyCardsList} from '@src/types/onyx';
import WorkspaceCardListHeader from './WorkspaceCardListHeader';
import WorkspaceCardListRow from './WorkspaceCardListRow';

type WorkspaceExpensifyCardPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>;

const stickyHeaderIndices = [0];

// TODO: remove when Onyx data is available
const mockedCards: OnyxEntry<ExpensifyCardsList> = {
    test1: {
        cardholder: {accountID: 1, lastName: 'Smith', firstName: 'Bob', displayName: 'Bob Smith', avatar: ''},
        name: 'Test 1',
        limit: 1000,
        lastFourPAN: '1234',
    },
    test2: {
        cardholder: {accountID: 2, lastName: 'Miller', firstName: 'Alex', displayName: 'Alex Miller', avatar: ''},
        name: 'Test 2',
        limit: 2000,
        lastFourPAN: '1234',
    },
    test3: {
        cardholder: {accountID: 3, lastName: 'Brown', firstName: 'Kevin', displayName: 'Kevin Brown', avatar: ''},
        name: 'Test 3',
        limit: 3000,
        lastFourPAN: '1234',
    },
};

function WorkspaceExpensifyCardPage({route}: WorkspaceExpensifyCardPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = route.params.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const policyCurrency = useMemo(() => policy?.outputCurrency ?? CONST.CURRENCY.USD, [policy]);

    // TODO: uncomment the code line below to use cardsList data from Onyx when it's supported
    // const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARDS_LIST}${policyID}_Expensify Card`);
    const cardsList = mockedCards;

    const fetchExpensifyCards = useCallback(() => {
        // TODO: uncomment when OpenPolicyExpensifyCardsPage API call is supported
        // Policy.openPolicyExpensifyCardsPage(policyID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [policyID]);

    useFocusEffect(fetchExpensifyCards);

    const sortedCards = useMemo(
        () =>
            Object.values(cardsList ?? {}).sort((a, b) => {
                const aName = PersonalDetailsUtils.getDisplayNameOrDefault(a.cardholder);
                const bName = PersonalDetailsUtils.getDisplayNameOrDefault(b.cardholder);
                return localeCompare(aName, bName);
            }),
        [cardsList],
    );

    const getHeaderButtons = () => (
        <View style={[styles.w100, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
            <Button
                medium
                success
                onPress={() => {}} // TODO: add navigation action when card issue flow is implemented (https://github.com/Expensify/App/issues/44309)
                icon={Expensicons.Plus}
                text={translate('workspace.expensifyCard.issueCard')}
                style={shouldUseNarrowLayout && styles.flex1}
            />
            <Button
                medium
                onPress={() => {}} // TODO: add navigation action when settings screen is implemented (https://github.com/Expensify/App/issues/44311)
                icon={Expensicons.Gear}
                text={translate('common.settings')}
                style={shouldUseNarrowLayout && styles.flex1}
            />
        </View>
    );

    const renderItem = ({item, index}: ListRenderItemInfo<ExpensifyCard>) => (
        <OfflineWithFeedback
            key={`${item.name}_${index}`}
            pendingAction={item.pendingAction}
            errorRowStyles={styles.ph5}
            errors={item.errors}
        >
            <PressableWithoutFeedback
                role={CONST.ROLE.BUTTON}
                accessibilityLabel="row"
                onPress={() => {}} // TODO: add navigation action when card details screen is implemented (https://github.com/Expensify/App/issues/44325)
            >
                {({hovered}) => (
                    <WorkspaceCardListRow
                        style={hovered && styles.hoveredComponentBG}
                        lastFourPAN={item.lastFourPAN}
                        cardholder={item.cardholder}
                        limit={item.limit}
                        name={item.name}
                        currency={policyCurrency}
                    />
                )}
            </PressableWithoutFeedback>
        </OfflineWithFeedback>
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            // TODO: uncomment when feature support is implemented (https://github.com/Expensify/App/issues/44301)
            // featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                shouldEnablePickerAvoiding={false}
                shouldShowOfflineIndicatorInWideScreen
                shouldEnableMaxHeight
                testID={WorkspaceExpensifyCardPage.displayName}
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

                <FlatList
                    data={sortedCards}
                    renderItem={renderItem}
                    ListHeaderComponent={WorkspaceCardListHeader}
                    stickyHeaderIndices={stickyHeaderIndices}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceExpensifyCardPage.displayName = 'WorkspacesListPage';

export default WorkspaceExpensifyCardPage;
