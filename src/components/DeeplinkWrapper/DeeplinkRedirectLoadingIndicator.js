import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import TextLink from '../TextLink';
import Text from '../Text';
import Icon from '../Icon';
import * as Illustrations from '../Icon/Illustrations';
import * as Expensicons from '../Icon/Expensicons';
import colors from '../../styles/colors';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';

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
                    fill={colors.green}
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
