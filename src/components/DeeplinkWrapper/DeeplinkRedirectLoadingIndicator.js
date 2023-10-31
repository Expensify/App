import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    openLinkInBrowser: PropTypes.func.isRequired,

    session: PropTypes.shape({
        /** Currently logged-in user email */
        email: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {
        email: '',
    },
};

function DeeplinkRedirectLoadingIndicator({translate, openLinkInBrowser, session}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    return (
        <View style={styles.deeplinkWrapperContainer}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Icon
                        width={200}
                        height={164}
                        src={Illustrations.RocketBlue}
                    />
                </View>
                <Text style={[styles.textHeadline, styles.textXXLarge]}>{translate('deeplinkWrapper.launching')}</Text>
                <View style={[styles.mt2, styles.fontSizeNormal, styles.textAlignCenter]}>
                    <Text>{translate('deeplinkWrapper.loggedInAs', {email: session.email})}</Text>
                    <Text style={[styles.textAlignCenter]}>
                        {translate('deeplinkWrapper.doNotSeePrompt')} <TextLink onPress={() => openLinkInBrowser(true)}>{translate('deeplinkWrapper.tryAgain')}</TextLink>
                        {translate('deeplinkWrapper.or')} <TextLink onPress={() => Navigation.navigate(ROUTES.HOME)}>{translate('deeplinkWrapper.continueInWeb')}</TextLink>.
                    </Text>
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={154}
                    height={34}
                    fill={theme.success}
                    src={Expensicons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

DeeplinkRedirectLoadingIndicator.propTypes = propTypes;
DeeplinkRedirectLoadingIndicator.defaultProps = defaultProps;
DeeplinkRedirectLoadingIndicator.displayName = 'DeeplinkRedirectLoadingIndicator';

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(DeeplinkRedirectLoadingIndicator);
