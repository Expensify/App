import _ from 'underscore';
import React from 'react';
import {View, ScrollView} from 'react-native';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import MenuItem from '../../components/MenuItem';
import compose from '../../libs/compose';
import * as Illustrations from '../../components/Icon/Illustrations';
import * as StyleUtils from '../../styles/StyleUtils';
import Icon from '../../components/Icon';

const propTypes = {
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

function LoungeAccessPage(props) {
    const menuItems = [
        {
            translationKey: 'loungeAccessPage.coffeePromo',
            icon: Illustrations.CoffeeMug,
        },
        {
            translationKey: 'loungeAccessPage.networkingPromo',
            icon: Illustrations.ChatBubbles,
        },
        {
            translationKey: 'loungeAccessPage.viewsPromo',
            icon: Illustrations.SanFrancisco,
        },
    ];

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        title={props.translate('loungeAccessPage.loungeAccess')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
                    />
                    <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexColumn, styles.justifyContentBetween, safeAreaPaddingBottomStyle]}>
                        <View style={[styles.flex1]}>
                            <Illustrations.Lounge />
                            <View style={styles.pageWrapper}>
                                <View style={[styles.settingsPageBody]}>
                                    <Text
                                        style={[styles.textHeadline, styles.preWrap]}
                                        numberOfLines={2}
                                    >
                                        {props.translate('loungeAccessPage.headline')}
                                    </Text>
                                    <Text style={[styles.baseFontStyle, styles.mt5]}>{props.translate('loungeAccessPage.description')}</Text>
                                </View>
                            </View>
                            {_.map(menuItems, (item) => (
                                <MenuItem
                                    key={item.translationKey}
                                    title={props.translate(item.translationKey)}
                                    icon={item.icon}
                                    iconWidth={60}
                                    iconHeight={60}
                                    iconStyles={[styles.mr2]}
                                />
                            ))}
                        </View>
                    </ScrollView>
                </>
            )}
        </ScreenWrapper>
    );
}

LoungeAccessPage.propTypes = propTypes;
LoungeAccessPage.displayName = 'LoungeAccessPage';

export default compose(withLocalize, withWindowDimensions)(LoungeAccessPage);
