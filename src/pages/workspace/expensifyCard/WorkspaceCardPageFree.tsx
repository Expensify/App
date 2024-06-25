import React from 'react';
import {FlatList, View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithoutFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@navigation/Navigation';
import WorkspaceCardListHeader from '@pages/workspace/expensifyCard/WorkspaceCardListHeader';
import WorkspaceCardListRow from '@pages/workspace/expensifyCard/WorkspaceCardListRow';
import CONST from '@src/CONST';

type WorkspaceCardPageFreeProps = {};

const stickyHeaderIndices = [0];

function WorkspaceCardPageFree({}: WorkspaceCardPageFreeProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const cards = [
        {cardholder: {accountID: 1, lastName: 'Smith', firstName: 'Bob', displayName: 'Bob Smith', avatar: ''}, description: 'Test 1', limit: 1000, lastFour: '1234'},
        {cardholder: {accountID: 2, lastName: 'Miller', firstName: 'Alex', displayName: 'Alex Miller', avatar: ''}, description: 'Test 2', limit: 2000, lastFour: '5678'},
        {cardholder: {accountID: 3, lastName: 'Brown', firstName: 'Kevin', displayName: 'Kevin Brown', avatar: ''}, description: 'Test 3', limit: 3000, lastFour: '9108'},
    ];

    const cardsInfo = [
        {title: 'Current balance', value: 0, description: 'WIP'},
        {title: 'Current balance', value: 0, description: 'WIP'},
        {title: 'Current balance', value: 0, description: 'WIP'},
    ];

    const renderCardsInfo = () => {
        return (
            <View style={[styles.flexRow, styles.mv5, styles.mh5]}>
                {cardsInfo.map((item) => (
                    <View style={[styles.flex3]}>
                        <View style={[styles.flexRow, styles.mb1]}>
                            <Text style={styles.mutedNormalTextLabel}>{item.title}</Text>
                        </View>
                        <View style={styles.flexRow}>
                            <Text style={styles.shortTermsHeadline}>{CurrencyUtils.convertToDisplayString(item.value, 'USD')}</Text>
                        </View>
                    </View>
                ))}
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
                    disabled={item.disabled}
                    onPress={item.action}
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
                data={cards}
                renderItem={renderItem}
                ListHeaderComponent={WorkspaceCardListHeader}
                stickyHeaderIndices={stickyHeaderIndices}
            />
        </ScreenWrapper>
    );
}

WorkspaceCardPageFree.displayName = 'WorkspacesListPage';

export default WorkspaceCardPageFree;
