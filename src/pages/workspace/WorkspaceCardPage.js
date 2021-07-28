import React from 'react';
import {
    View, ScrollView, Linking, StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
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
import BankAccount from '../../libs/models/BankAccount';

const propTypes = {
    /* Onyx Props */

    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** Whether or not the user has public domain */
        isFromPublicDomain: PropTypes.bool,

        /** Whether the user is using Expensify Card */
        isUsingExpensifyCard: PropTypes.bool,
    }),

    /** Bank account currently in setup */
    reimbursementAccount: PropTypes.shape({
        /** Additional data */
        achData: PropTypes.shape({
            /** Bank account state */
            state: PropTypes.string,
        }),

        /** Whether we are loading this bank account */
        loading: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    user: {
        isFromPublicDomain: false,
        isUsingExpensifyCard: false,
    },
    reimbursementAccount: {
        loading: false,
    },
};

const publicLink = CONFIG.EXPENSIFY.URL_EXPENSIFY_COM + CONST.ADD_SECONDARY_LOGIN_URL;
const manageCardLink = CONFIG.EXPENSIFY.URL_EXPENSIFY_COM + CONST.MANAGE_CARDS_URL;

const WorkspaceCardPage = ({
    user,
    translate,
    isSmallScreenWidth,
    reimbursementAccount,
}) => {
    const isVerifying = lodashGet(reimbursementAccount, 'achData.state', '') === BankAccount.STATE.VERIFYING;
    const isNotAutoProvisioned = !user.isUsingExpensifyCard
        && lodashGet(reimbursementAccount, 'achData.state', '') === BankAccount.STATE.OPEN;
    let buttonText;
    if (user.isFromPublicDomain) {
        buttonText = translate('workspace.card.addEmail');
    } else if (user.isUsingExpensifyCard) {
        buttonText = translate('workspace.card.manageCards');
    } else if (isVerifying || isNotAutoProvisioned) {
        buttonText = translate('workspace.card.finishSetup');
    } else {
        buttonText = translate('workspace.card.getStarted');
    }

    const onPress = () => {
        if (user.isFromPublicDomain) {
            Linking.openURL(publicLink);
        } else if (user.isUsingExpensifyCard) {
            Linking.openURL(manageCardLink);
        } else {
            Navigation.navigate(ROUTES.getBankAccountRoute());
        }
    };

    return (
        <ScreenWrapper style={[styles.defaultModalContainer]}>
            <HeaderWithCloseButton
                title={translate('workspace.common.card')}
                onCloseButtonPress={() => Navigation.dismissModal()}
                onBackButtonPress={() => Navigation.goBack()}
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
                                        isSmallScreenWidth ? styles.wAuto : {},
                                    ]}
                                    textStyles={[
                                        !isSmallScreenWidth ? styles.p5 : {},
                                    ]}
                                    onPress={onPress}
                                    success
                                    large
                                    text={buttonText}
                                    isLoading={reimbursementAccount.loading}
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
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(WorkspaceCardPage);
