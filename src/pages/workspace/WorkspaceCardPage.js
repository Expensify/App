import React from 'react';
import {
    View, ScrollView, Image, Text as RNText, Linking,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import Text from '../../components/Text';
import Button from '../../components/Button';
import variables from '../../styles/variables';
import themeDefault from '../../styles/themes/default';
import ROUTES from '../../ROUTES';
import CONFIG from '../../CONFIG';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';

const propTypes = {
    /* Onyx Props */

    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** Whether or not the user is subscribed to news updates */
        isFromPublicDomain: PropTypes.bool,
        isCardEnabled: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    user: {
        isFromPublicDomain: false,
        isCardEnabled: false,
    },
};

const WorkspaceCardPage = ({
    user,
    translate,
}) => {
    const publicLink = CONFIG.EXPENSIFY.URL_EXPENSIFY_COM + CONST.ADD_SECONDARY_LOGIN_URL;
    const manageCardLink = CONFIG.EXPENSIFY.URL_EXPENSIFY_COM + CONST.MANAGE_CARDS_URL;

    /**
     * When user is on public domain, navigate the user to Add new bank Account.
     *
     */
    const onPress = () => {
        if (user.isFromPublicDomain) {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_NEW);
        } else if (user.isCardEnabled) {
            Linking.openURL(manageCardLink);
        } else {
            Navigation.navigate(ROUTES.getBankAccountRoute('new'));
        }
    };

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={translate('workspace.common.card')}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView style={[styles.settingsPageBackground]} bounces={false}>
                <View style={styles.pageWrapper}>
                    <View style={[styles.mb3, styles.workspaceCard, styles.flexRow]}>
                        <Image
                            style={styles.fullscreenCard}
                            source="https://d2k5nsl2zxldvw.cloudfront.net/images/homepage/expensify-card/card-cascade--blue.svg"
                        />
                        <View style={[styles.fullscreenCard, styles.workspaceCardContent]}>
                            <View
                                style={[
                                    styles.w50,
                                    styles.flexGrow1,
                                    styles.justifyContentEnd,
                                    styles.alignItemsStart,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.workspaceCardMainText,
                                        styles.mb5,
                                    ]}
                                    color={themeDefault.textReversed}
                                >
                                    {user.isCardEnabled
                                        ? translate('workspace.card.cardReadyTagline')
                                        : translate('workspace.card.tagline')}
                                </Text>
                                <Text
                                    fontSize={variables.fontSizeLarge}
                                    color={themeDefault.textReversed}
                                    style={[styles.mb8]}
                                >
                                    {user.isFromPublicDomain
                                        ? (
                                            <>
                                                <RNText>{translate('workspace.card.publicCopy')}</RNText>
                                                {' '}
                                                <TextLink
                                                    href={publicLink}
                                                    style={[styles.cWhite]}
                                                    hoveredStyle={[styles.cWhite]}
                                                >
                                                    {translate('common.here')}
                                                </TextLink>
                                                .
                                            </>
                                        )
                                        : translate('workspace.card.privateCopy')}
                                </Text>
                                {!user.isFromPublicDomain
                                    && (
                                        <Button
                                            style={[
                                                styles.alignSelfStart,
                                                styles.workspaceCardCTA,
                                            ]}
                                            textStyles={[
                                                styles.p5,
                                            ]}
                                            onPress={onPress}
                                            success
                                            large
                                            text={
                                                user.isCardEnabled
                                                    ? translate('workspace.card.manageCards')
                                                    : translate('workspace.card.getStarted')
                                            }
                                        />
                                    )}
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
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(WorkspaceCardPage);
