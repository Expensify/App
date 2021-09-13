import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ExistingOwners from './ExistingOwners';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import ONYXKEYS from '../../ONYXKEYS';
import Text from '../../components/Text';
import {Exclamation} from '../../components/Icon/Expensicons';
import Icon from '../../components/Icon';
import colors from '../../styles/colors';
import TextLink from '../../components/TextLink';
import styles from '../../styles/styles';

const propTypes = {
    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: reimbursementAccountPropTypes,

    ...withLocalizePropTypes,

    onFixTheErrorsLinkPressed: PropTypes.func.isRequired,
};

const defaultProps = {
    reimbursementAccount: {},
};

class ReimbursementAccountFormAlert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    /**
     * @returns {React.Component|string}
     */
    getAlertPrompt() {
        if (lodashGet(this.props.reimbursementAccount, 'existingOwners', []).length > 0) {
            return <ExistingOwners />;
        }

        return this.props.reimbursementAccount.alertMessage || (
            <View style={[styles.flexRow, styles.ml2]}>
                {/* @TODO translate {this.props.translate('bankAccount.defaultFormAlertPrompt')} */}
                <Text style={styles.mutedTextLabel}>Please </Text>
                <TextLink
                    style={styles.label}
                    onPress={this.props.onFixTheErrorsLinkPressed}
                >
                    {'fix the errors '}
                </TextLink>
                <Text style={styles.mutedTextLabel}>in the form before continuing.</Text>
            </View>
        );
    }

    render() {
        const isVisible = _.size(lodashGet(this.props, 'reimbursementAccount.errors', {})) > 0;
        if (!isVisible) {
            return null;
        }

        return (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb4]}>
                <Icon src={Exclamation} fill={colors.red} />
                {this.getAlertPrompt()}
            </View>
        );
    }
}

ReimbursementAccountFormAlert.propTypes = propTypes;
ReimbursementAccountFormAlert.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(ReimbursementAccountFormAlert);
