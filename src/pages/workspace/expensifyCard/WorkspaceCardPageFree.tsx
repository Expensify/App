import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {FlatList, View} from 'react-native';
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
import Navigation from '@navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspaceCardListHeader from '@pages/workspace/expensifyCard/WorkspaceCardListHeader';
import WorkspaceCardListRow from '@pages/workspace/expensifyCard/WorkspaceCardListRow';
import WorkspaceCardsListLabel from '@pages/workspace/expensifyCard/WorkspaceCardsListLabel';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type WorkspaceCardPageFreeProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>;

const stickyHeaderIndices = [0];

const mockedCards = [
    {cardholder: {accountID: 1, lastName: 'Smith', firstName: 'Bob', displayName: 'Bob Smith', avatar: ''}, description: 'Test 1', limit: 1000, lastFour: '1234'},
    {cardholder: {accountID: 2, lastName: 'Miller', firstName: 'Alex', displayName: 'Alex Miller', avatar: ''}, description: 'Test 2', limit: 2000, lastFour: '5678'},
    {cardholder: {accountID: 3, lastName: 'Brown', firstName: 'Kevin', displayName: 'Kevin Brown', avatar: ''}, description: 'Test 3', limit: 3000, lastFour: '9108'},
];

function WorkspaceCardPageFree({route}: WorkspaceCardPageFreeProps) {
    const {shouldUseNarrowLayout, isMediumScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const isLessThanMediumScreen = isMediumScreenWidth || isSmallScreenWidth;
    const policyID = route.params.policyID;

    const renderCardsInfo = () => {
        return (
            <View style={[isLessThanMediumScreen ? styles.flexColumn : styles.flexRow, styles.mv5, styles.mh5]}>
                <View style={[styles.flexRow, styles.flex1]}>
                    <WorkspaceCardsListLabel
                        type={'currentBalance'}
                        value={10000}
                    />
                    <WorkspaceCardsListLabel
                        type={'remainingLimit'}
                        value={20000}
                    />
                </View>
                <WorkspaceCardsListLabel
                    type={'cashBack'}
                    value={30000}
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

    const renderItem = ({item, index}) => {
        return (
            <OfflineWithFeedback
                key={`${item.title}_${index}`}
                pendingAction={item.pendingAction}
                errorRowStyles={styles.ph5}
                onClose={item.dismissError}
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
                            lastFour={item.lastFour}
                            cardholder={item.cardholder}
                            limit={item.limit}
                            description={item.description}
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
                    data={mockedCards}
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
