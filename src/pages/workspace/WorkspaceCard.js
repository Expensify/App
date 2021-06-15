import React from 'react';
import {View, ScrollView, Image} from 'react-native';
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

const propTypes = {
    /* Onyx Props */

    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** Whether or not the user is subscribed to news updates */
        isFromPublicDomain: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    user: {
        isFromPublicDomain: false,
    },
};

const WorkspaceCard = ({
    user,
    translate,
}) => {
    /**
     * When user is on public domain, navigate the user to Add new bank Account.
     *
     */
    const getStarted = () => {
        if (user.isFromPublicDomain) {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_NEW);
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
                                    {translate('workspace.card.tagline')}
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
                                            onPress={getStarted}
                                            success
                                            large
                                            text="Get Started"
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

WorkspaceCard.propTypes = propTypes;
WorkspaceCard.defaultProps = defaultProps;
WorkspaceCard.displayName = 'WorkspaceCard';

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(WorkspaceCard);
