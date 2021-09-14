import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';

import TextLink from '../../components/TextLink';
import Text from '../../components/Text';
import Button from '../../components/Button';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ExistingOwners from './ExistingOwners';
import Icon from '../../components/Icon';
import {Exclamation} from '../../components/Icon/Expensicons';
import colors from '../../styles/colors';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** Called when the form is submitted */
    onSubmit: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    reimbursementAccount: {},
};

class ReimbursementAccountForm extends React.Component {
    /**
     * @returns {React.Component|string}
     */
    getAlertPrompt() {
        if (lodashGet(this.props.reimbursementAccount, 'existingOwners', []).length > 0) {
            return <ExistingOwners />;
        }

        return (
            <View style={[styles.flexRow, styles.ml2]}>
                {!_.isEmpty(this.props.reimbursementAccount.alertMessage)
                    ? (
                        <Text style={styles.mutedTextLabel}>{this.props.reimbursementAccount.alertMessage}</Text>
                    )
                    : (
                        <>
                            {/* @TODO translate {this.props.translate('bankAccount.defaultFormAlertPrompt')} */}
                            <Text style={styles.mutedTextLabel}>Please </Text>
                            <TextLink
                                style={styles.label}
                                onPress={() => {
                                    this.form.scrollTo({y: 0, animated: true});
                                }}
                            >
                                {'fix the errors '}
                            </TextLink>
                            <Text style={styles.mutedTextLabel}>in the form before continuing.</Text>
                        </>
                    )}
            </View>
        );
    }

    render() {
        const isErrorVisible = _.size(lodashGet(this.props, 'reimbursementAccount.errors', {})) > 0
            || lodashGet(this.props, 'reimbursementAccount.alertMessage', '').length > 0

            // @TODO once all validation errors show in multiples we can remove this check
            || lodashGet(this.props, 'reimbursementAccount.error', '').length > 0;

        return (
            <ScrollView
                style={[styles.w100, styles.flex1]}
                ref={el => this.form = el}
                contentContainerStyle={styles.flexGrow1}
            >
                {/* Form elements */}
                <View style={[styles.mh5, styles.mb5]}>
                    {this.props.children}
                </View>
                <View style={[styles.mh5, styles.mb5, styles.flex1, styles.justifyContentEnd]}>
                    {isErrorVisible && (
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                            <Icon src={Exclamation} fill={colors.red} />
                            {this.getAlertPrompt()}
                        </View>
                    )}
                    <Button
                        success
                        text={this.props.translate('common.saveAndContinue')}
                        onPress={this.props.onSubmit}
                    />
                </View>
            </ScrollView>
        );
    }
}

ReimbursementAccountForm.propTypes = propTypes;
ReimbursementAccountForm.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(ReimbursementAccountForm);
