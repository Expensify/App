import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {compose} from 'underscore';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import colors from '../../styles/colors';
import styles from '../../styles/styles';
import Icon from '../Icon';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Text from '../Text';
import * as Expensicons from '../Icon/Expensicons';
import * as Illustrations from '../Icon/Illustrations';
import variables from '../../styles/variables';
import TextLink from '../TextLink';
import ONYXKEYS from '../../ONYXKEYS';
import * as Session from '../../libs/actions/Session';

const propTypes = {
    /** Code to display. */
    code: PropTypes.string.isRequired,

    /** The ID of the account to which the code belongs. */
    accountID: PropTypes.string.isRequired,

    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Currently logged in user authToken */
        authToken: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {
        authToken: null,
    },
};

function ValidateCodeModal(props) {
    const signInHere = useCallback(() => Session.signInWithValidateCode(props.accountID, props.code), [props.accountID, props.code]);

    return (
        <View style={styles.deeplinkWrapperContainer}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Icon
                        width={variables.modalTopIconWidth}
                        height={variables.modalTopIconHeight}
                        src={Illustrations.MagicCode}
                    />
                </View>
                <Text style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>{props.translate('validateCodeModal.title')}</Text>
                <View style={[styles.mt2, styles.mb2]}>
                    <Text style={[styles.fontSizeNormal, styles.textAlignCenter]}>
                        {props.translate('validateCodeModal.description')}
                        {!lodashGet(props, 'session.authToken', null) && (
                            <>
                                {props.translate('validateCodeModal.or')} <TextLink onPress={signInHere}>{props.translate('validateCodeModal.signInHere')}</TextLink>
                            </>
                        )}
                        {props.shouldShowSignInHere ? '!' : '.'}
                    </Text>
                </View>
                <View style={styles.mt6}>
                    <Text style={styles.validateCodeDigits}>{props.code}</Text>
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={variables.modalWordmarkWidth}
                    height={variables.modalWordmarkHeight}
                    fill={colors.green}
                    src={Expensicons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

ValidateCodeModal.propTypes = propTypes;
ValidateCodeModal.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        session: {key: ONYXKEYS.SESSION},
    }),
)(ValidateCodeModal);
