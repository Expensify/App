import React from 'react';
import {FlatList, View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@navigation/Navigation';

type WorkspaceCardPageFreeProps = {};

function WorkspaceCardPageFree({}: WorkspaceCardPageFreeProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isMediumScreenWidth, isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const isLessThanMediumScreen = isMediumScreenWidth || isSmallScreenWidth;

    const cards = [];

    const cardsData = [
        {title: 'Current balance', value: 0, description: 'WIP'},
        {title: 'Current balance', value: 0, description: 'WIP'},
        {title: 'Current balance', value: 0, description: 'WIP'},
    ];

    const renderCardsData = () => {
        return (
            <View style={[styles.p2, styles.mb6]}>
                <View style={[styles.flexRow, styles.mb4]}>
                    {cardsData.map((item) => (
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
            </View>
        );
    };

    const getHeaderButtons = () => {
        return (
            <View style={[styles.w100, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                <Button
                    medium
                    success
                    onPress={() => {}} // TODO: add card flow
                    icon={Expensicons.Plus}
                    text={translate('workspace.expensifyCard.issueCard')}
                    style={[shouldUseNarrowLayout && styles.flex1]}
                />
                <Button
                    medium
                    onPress={() => {}} // TODO: add settings open
                    icon={Expensicons.Gear}
                    text={translate('common.settings')}
                    style={[shouldUseNarrowLayout && styles.flex1]}
                />
            </View>
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
                icon={Illustrations.FolderOpen}
                title={translate('workspace.common.expensifyCard')}
                shouldShowBackButton={shouldUseNarrowLayout}
                onBackButtonPress={() => Navigation.goBack()}
            >
                {!shouldUseNarrowLayout && getHeaderButtons()}
            </HeaderWithBackButton>

            {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}

            {renderCardsData()}

            <FlatList
                data={cards}
                renderItem={() => null}
                // ListHeaderComponent={listHeaderComponent}
                // stickyHeaderIndices={stickyHeaderIndices}
            />
        </ScreenWrapper>
    );
}

WorkspaceCardPageFree.displayName = 'WorkspacesListPage';

export default WorkspaceCardPageFree;
