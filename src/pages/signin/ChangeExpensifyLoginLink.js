import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import redirectToSignIn from '../../libs/actions/SignInRedirect';
import themeColors from '../../styles/themes/default';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';

const propTypes = {
    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email the user logged in with */
        login: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

const ChangeExpensifyLoginLink = ({credentials, translate, toLocalPhone}) => (
    <View style={[styles.changeExpensifyLoginLinkContainer, styles.mb4, styles.mt3]}>
        <Text>
            {translate('common.not')}
            &nbsp;
            {Str.isSMSLogin(credentials.login)
                ? toLocalPhone(Str.removeSMSDomain(credentials.login))
                : Str.removeSMSDomain(credentials.login)}
            {'? '}
        </Text>
        <TouchableOpacity
            style={[styles.link]}
            onPress={() => redirectToSignIn()}
            underlayColor={themeColors.componentBG}
        >
            <Text style={[styles.link]}>
                {translate('common.goBack')}
                {'.'}
            </Text>
        </TouchableOpacity>
    </View>
);

ChangeExpensifyLoginLink.propTypes = propTypes;
ChangeExpensifyLoginLink.displayName = 'ChangeExpensifyLoginLink';

export default compose(
    withLocalize,
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
    }),
)(ChangeExpensifyLoginLink);
