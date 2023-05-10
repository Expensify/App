import React, {PureComponent} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _, {compose} from 'underscore';
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
import * as ErrorUtils from '../../libs/ErrorUtils';
import * as Session from '../../libs/actions/Session';

const propTypes = {
    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** An error message to display to the user */
        errors: PropTypes.objectOf(PropTypes.string),

        /** The message to be displayed when code requested */
        message: PropTypes.string,
    }),

    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email the user logged in with */
        login: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
    credentials: {},
};

class ExpiredValidateCodeModal extends PureComponent {
    constructor(props) {
        super(props);

        this.requestNewCode = this.requestNewCode.bind(this);
    }

    shouldShowRequestCodeLink() {
        return Boolean(lodashGet(this.props, 'credentials.login', null));
    }

    requestNewCode() {
        Session.resendValidateCode();
    }

    render() {
        const codeRequestedMessage = lodashGet(this.props, 'account.message', null);
        const accountErrors = lodashGet(this.props, 'account.errors', {});
        let codeRequestedErrors;
        if (_.keys(accountErrors).length > 1) {
            codeRequestedErrors = ErrorUtils.getLatestErrorMessage(this.props.account);
        }
        return (
            <View style={styles.deeplinkWrapperContainer}>
                <View style={styles.deeplinkWrapperMessage}>
                    <View style={styles.mb2}>
                        <Icon
                            width={variables.modalTopIconWidth}
                            height={variables.modalTopIconHeight}
                            src={Illustrations.ToddBehindCloud}
                        />
                    </View>
                    <Text style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>{this.props.translate('validateCodeModal.expiredCodeTitle')}</Text>
                    <View style={[styles.mt2, styles.mb2]}>
                        <Text style={[styles.fontSizeNormal, styles.textAlignCenter]}>
                            {this.props.translate('validateCodeModal.expiredCodeDescription')}
                            {this.shouldShowRequestCodeLink() && !codeRequestedMessage && (
                                <>
                                    <br />
                                    {this.props.translate('validateCodeModal.requestNewCode')}{' '}
                                    <TextLink onPress={this.requestNewCode}>{this.props.translate('validateCodeModal.requestNewCodeLink')}</TextLink>!
                                </>
                            )}
                        </Text>
                        {this.shouldShowRequestCodeLink() && Boolean(codeRequestedErrors) && (
                            <Text style={[styles.textDanger, styles.validateCodeMessage]}>
                                <br />
                                <br />
                                {codeRequestedErrors}
                            </Text>
                        )}
                        {this.shouldShowRequestCodeLink() && Boolean(codeRequestedMessage) && (
                            <Text style={styles.validateCodeMessage}>
                                <br />
                                <br />
                                {this.props.translate(codeRequestedMessage)}
                            </Text>
                        )}
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
}

ExpiredValidateCodeModal.propTypes = propTypes;
ExpiredValidateCodeModal.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
        credentials: {key: ONYXKEYS.CREDENTIALS},
    }),
)(ExpiredValidateCodeModal);
