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
import styles from '../../styles/styles';

const propTypes = {
    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: reimbursementAccountPropTypes,

    ...withLocalizePropTypes,

    onFixTheErrorsPressed: PropTypes.func.isRequired,
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
            <>
                {/* @TODO translate {this.props.translate('bankAccount.defaultFormAlertPrompt')} */}
                <Text>Please </Text>
                <Text style={styles.link} onPress={this.props.onFixTheErrorsPressed}>fix the errors </Text>
                <Text>in the form before continuing.</Text>
            </>
        );
    }

    render() {
        const isVisible = lodashGet(this.props, 'reimbursementAccount.isFormAlertVisible', false);
        if (!isVisible) {
            return null;
        }

        return (
            <View>
                <Text>{this.getAlertPrompt()}</Text>
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
