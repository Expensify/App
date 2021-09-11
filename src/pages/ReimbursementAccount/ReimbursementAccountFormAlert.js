import React from 'react';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ExistingOwners from './ExistingOwners';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: reimbursementAccountPropTypes,

    ...withLocalizePropTypes,
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
    getErrorPrompt() {
        if (lodashGet(this.props.reimbursementAccount, 'existingOwners', []).length > 0) {
            return <ExistingOwners />;
        }

        return this.props.reimbursementAccount.errorMessage || this.props.translate('bankAccount.defaultFormAlertPrompt');
    }

    render() {
        const isVisible = lodashGet(this.props, 'reimbursementAccount.isFormAlertVisible', false);
        if (!isVisible) {
            return null;
        }

        return (
            <View>
                <Text>{this.getErrorPrompt()}</Text>
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
