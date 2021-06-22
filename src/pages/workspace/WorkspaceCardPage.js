import React from 'react';
import {
    View, ScrollView, Linking, StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';
import Text from '../../components/Text';
import Button from '../../components/Button';
import variables from '../../styles/variables';
import themeDefault from '../../styles/themes/default';
import ROUTES from '../../ROUTES';
import CONFIG from '../../CONFIG';
import CONST from '../../CONST';
import HeroCardWebImage from '../../../assets/images/cascading-cards-web.svg';
import HeroCardMobileImage from '../../../assets/images/cascading-cards-mobile.svg';

const propTypes = {
    /* Onyx Props */

    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** Whether or not the user has public domain */
        isFromPublicDomain: PropTypes.bool,

        /** Whether the user is using Expensify Card */
        isUsingExpensifyCard: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    user: {
        isFromPublicDomain: false,
        isUsingExpensifyCard: false,
    },
};

const WorkspaceCardPage = ({
    user,
    translate,
    isSmallScreenWidth,
}) => {
    const publicLink = CONFIG.EXPENSIFY.URL_EXPENSIFY_COM + CONST.ADD_SECONDARY_LOGIN_URL;
    const manageCardLink = CONFIG.EXPENSIFY.URL_EXPENSIFY_COM + CONST.MANAGE_CARDS_URL;
    const buttonTextIfUsingCard = user.isUsingExpensifyCard
        ? translate('workspace.card.manageCards')
        : translate('workspace.card.getStarted');
    const buttonText = user.isFromPublicDomain ? translate('workspace.card.addEmail') : buttonTextIfUsingCard;

    const onPress = () => {
        if (user.isFromPublicDomain) {
            Linking.openURL(publicLink);
        } else if (user.isUsingExpensifyCard) {
            Linking.openURL(manageCardLink);
        } else {
            Navigation.navigate(ROUTES.getBankAccountRoute('new'));
        }
    };

    return (
        <ScreenWrapper style={[styles.defaultModalContainer]}>
            <HeaderWithCloseButton
                title={translate('workspace.common.card')}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
                shouldShowBackButton={isSmallScreenWidth}
            />
            <ScrollView style={[styles.settingsPageBackground]} bounces={false}>
                <View style={styles.pageWrapper}>
                    <View style={[
                        styles.mb3,
                        styles.flexRow,
                        styles.workspaceCard,
                        isSmallScreenWidth && styles.workspaceCardMobile,
                    ]}
                    >
                        {isSmallScreenWidth
                            ? (
                                <HeroCardMobileImage
                                    style={StyleSheet.flatten([styles.fullscreenCard, styles.fullscreenCardMobile])}
                                />
                            )
                            : (
                                <HeroCardWebImage
                                    style={StyleSheet.flatten([styles.fullscreenCard, styles.fullscreenCardWeb])}
                                />
                            )}

                        <View style={[
                            styles.fullscreenCard,
                            styles.workspaceCardContent,
                            isSmallScreenWidth && styles.p5,
                        ]}
                        >
                            <View
                                style={[
                                    styles.flexGrow1,
                                    styles.justifyContentEnd,
                                    styles.alignItemsStart,
                                    !isSmallScreenWidth && styles.w50,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.workspaceCardMainText,
                                        styles.mb5,
                                    ]}
                                    color={themeDefault.textReversed}
                                >
                                    {user.isUsingExpensifyCard
                                        ? translate('workspace.card.cardReadyTagline')
                                        : translate('workspace.card.tagline')}
                                </Text>
                                <Text
                                    fontSize={variables.fontSizeLarge}
                                    color={themeDefault.textReversed}
                                    style={[styles.mb8]}
                                >
                                    {user.isFromPublicDomain
                                        ? translate('workspace.card.publicCopy')
                                        : translate('workspace.card.privateCopy')}
                                </Text>
                                <Button
                                    style={[
                                        styles.alignSelfStart,
                                        styles.workspaceCardCTA,
                                        isSmallScreenWidth && styles.wAuto,
                                    ]}
                                    textStyles={[
                                        !isSmallScreenWidth && styles.p5,
                                    ]}
                                    onPress={onPress}
                                    success
                                    large
                                    text={buttonText}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

WorkspaceCardPage.propTypes = propTypes;
WorkspaceCardPage.defaultProps = defaultProps;
WorkspaceCardPage.displayName = 'WorkspaceCardPage';

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(WorkspaceCardPage);
