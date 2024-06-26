import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {FlatList, View} from 'react-native';
import {OnyxEntry} from 'react-native-onyx';
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
import WorkspaceCardListHeader from '@pages/workspace/expensifyCard/WorkspaceCardListHeader';
import WorkspaceCardListRow from '@pages/workspace/expensifyCard/WorkspaceCardListRow';
import WorkspaceCardsListLabel from '@pages/workspace/expensifyCard/WorkspaceCardsListLabel';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {ExpensifyCard, ExpensifyCardsList} from '@src/types/onyx';

type WorkspaceCardPageFreeProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>;

const stickyHeaderIndices = [0];

const mockedCards: OnyxEntry<ExpensifyCardsList> = {
    '1': {
        cardholder: {accountID: 1, lastName: 'Smith', firstName: 'Bob', displayName: 'Bob Smith', avatar: ''},
        name: 'Test 1',
        limit: 1000,
        lastFourPAN: '1234',
    },
    '2': {
        cardholder: {accountID: 2, lastName: 'Miller', firstName: 'Alex', displayName: 'Alex Miller', avatar: ''},
        name: 'Test 2',
        limit: 2000,
        lastFourPAN: '1234',
    },
    '3': {
        cardholder: {accountID: 3, lastName: 'Brown', firstName: 'Kevin', displayName: 'Kevin Brown', avatar: ''},
        name: 'Test 3',
        limit: 3000,
        lastFourPAN: '1234',
    },
};

const mockedSettings = {
    currentBalance: 5000,
    remainingLimit: 3000,
    cashBack: 2000,
};

function WorkspaceCardPageFree({route}: WorkspaceCardPageFreeProps) {
    const {shouldUseNarrowLayout, isMediumScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const isLessThanMediumScreen = isMediumScreenWidth || isSmallScreenWidth;
    const policyID = route.params.policyID;

    // TODO: uncomment code below to use data from Onyx when it's supported
    // const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARDS_LIST}${policyID}_Expensify Card`);
    // const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`);
    const cardsList = mockedCards;
    const cardSettings = mockedSettings;

    const fetchExpensifyCards = useCallback(() => {
        // TODO: uncomment code below when API call is supported
        // openPolicyExpensifyCardsPage(policyID);
    }, [policyID]);

    useFocusEffect(fetchExpensifyCards);

    const sortedCards = useMemo(() => {
        return Object.values(cardsList ?? {}).sort((a, b) => {
            const aName = PersonalDetailsUtils.getDisplayNameOrDefault(a.cardholder);
            const bName = PersonalDetailsUtils.getDisplayNameOrDefault(b.cardholder);
            return localeCompare(aName, bName);
        });
    }, [cardsList]);

    const renderCardsInfo = () => {
        return (
            <View style={[isLessThanMediumScreen ? styles.flexColumn : styles.flexRow, styles.mv5, styles.mh5]}>
                <View style={[styles.flexRow, styles.flex1]}>
                    <WorkspaceCardsListLabel
                        type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE}
                        value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE] as number}
                    />
                    <WorkspaceCardsListLabel
                        type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT}
                        value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT] as number}
                    />
                </View>
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK] as number}
                    style={isLessThanMediumScreen ? styles.mt3 : undefined}
                />
            </View>
        );
    };

    const getHeaderButtons = () => {
        return (
            <View style={[styles.w100, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                <Button
                    medium
                    success
                    onPress={() => {}} // TODO: add action when card issue is implemented
                    icon={Expensicons.Plus}
                    text={translate('workspace.expensifyCard.issueCard')}
                    style={shouldUseNarrowLayout && styles.flex1}
                />
                <Button
                    medium
                    onPress={() => {}} // TODO: add navigation action when settings screen is implemented
                    icon={Expensicons.Gear}
                    text={translate('common.settings')}
                    style={shouldUseNarrowLayout && styles.flex1}
                />
            </View>
        );
    };

    const renderItem = ({item, index}: ListRenderItemInfo<ExpensifyCard>) => {
        return (
            <OfflineWithFeedback
                key={`${item.title}_${index}`}
                pendingAction={item.pendingAction}
                errorRowStyles={styles.ph5}
                errors={item.errors}
            >
                <PressableWithoutFeedback
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel="row"
                    onPress={() => {}} // TODO: open card details
                >
                    {({hovered}) => (
                        <WorkspaceCardListRow
                            style={hovered && styles.hoveredComponentBG}
                            lastFourPAN={item.lastFourPAN as string}
                            cardholder={item.cardholder}
                            limit={item.limit as string}
                            name={item.name as string}
                        />
                    )}
                </PressableWithoutFeedback>
            </OfflineWithFeedback>
        );
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            // TODO: uncomment when feature support is implemented
            // featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                shouldEnablePickerAvoiding={false}
                shouldShowOfflineIndicatorInWideScreen
                shouldEnableMaxHeight
                testID={WorkspaceCardPageFree.displayName}
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

                {renderCardsInfo()}

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

WorkspaceCardPageFree.displayName = 'WorkspacesListPage';

export default WorkspaceCardPageFree;
