import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';

const propTypes = {
    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email the user logged in with */
        login: PropTypes.string,
    }),

    /** Callback to navigate back to email form */
    onPress: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    credentials: {
        login: '',
    },
};

const ChangeExpensifyLoginLink = props => (
    <View style={[styles.changeExpensifyLoginLinkContainer, styles.mt3]}>
        {props.credentials.login && (
            <Text>
                {props.translate('common.not')}
                &nbsp;
                {Str.isSMSLogin(props.credentials.login || '')
                    ? props.toLocalPhone(Str.removeSMSDomain(props.credentials.login || ''))
                    : Str.removeSMSDomain(props.credentials.login || '')}
                {'? '}
            </Text>
        )}
        <TouchableOpacity
            style={[styles.link]}
            onPress={props.onPress}
        >
            <Text style={[styles.link]}>
                {props.translate('common.goBack')}
                {'.'}
            </Text>
        </TouchableOpacity>
    </View>
);

ChangeExpensifyLoginLink.propTypes = propTypes;
ChangeExpensifyLoginLink.defaultProps = defaultProps;
ChangeExpensifyLoginLink.displayName = 'ChangeExpensifyLoginLink';

export default compose(
    withLocalize,
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
    }),
)(ChangeExpensifyLoginLink);
