import _ from 'underscore';
import React from 'react';
import {View, ScrollView} from 'react-native';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import * as Expensicons from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import MenuItem from '../../components/MenuItem';
import Logo from '../../../assets/images/new-expensify.svg';
import compose from '../../libs/compose';

const propTypes = {
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

function LoungeAccessPage(props) {
    const menuItems = [
        {
            translationKey: 'loungeAccessPage.coffeePromo',
            icon: Expensicons.Link,
        },
        {
            translationKey: 'loungeAccessPage.networkingPromo',
            icon: Expensicons.Link,
        },
        {
            translationKey: 'loungeAccessPage.viewsPromo',
            icon: Expensicons.Link,
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
                            <View style={styles.pageWrapper}>
                                <View style={[styles.settingsPageBody]}>
                                    <Logo
                                        height={80}
                                        width={80}
                                    />
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
