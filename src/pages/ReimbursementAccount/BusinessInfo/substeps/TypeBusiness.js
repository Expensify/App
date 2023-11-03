import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import _ from 'underscore';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import CONST from '../../../../CONST';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import subStepPropTypes from '../../subStepPropTypes';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import {reimbursementAccountPropTypes} from '../../reimbursementAccountPropTypes';
import * as BankAccounts from '../../../../libs/actions/BankAccounts';
import getDefaultStateForField from '../../utils/getDefaultStateForField';
import Picker from '../../../../components/Picker';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...subStepPropTypes,
};

const companyIncorporationTypeKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.INCORPORATION_TYPE;

const validate = (values) => ValidationUtils.getFieldRequiredErrors(values, [companyIncorporationTypeKey]);

function NameBusiness({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultIncorporationType = getDefaultStateForField({reimbursementAccount, fieldName: companyIncorporationTypeKey, defaultValue: ''});

    const handleSubmit = (values) => {
        BankAccounts.updateOnyxVBBAData({
            [companyIncorporationTypeKey]: values[companyIncorporationTypeKey],
        });

        onNext();
    };

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <View>
                <Text style={[styles.textHeadline, styles.mb3]}>{translate('businessInfoStep.selectYourCompanysType')}</Text>
                <Picker
                    inputID={companyIncorporationTypeKey}
                    label={translate('businessInfoStep.companyType')}
                    items={_.map(_.keys(CONST.INCORPORATION_TYPES), (key) => ({value: key, label: translate(`businessInfoStep.incorporationType.${key}`)}))}
                    placeholder={{value: '', label: '-'}}
                    defaultValue={defaultIncorporationType}
                    shouldSaveDraft
                />
            </View>
        </Form>
    );
}

NameBusiness.propTypes = propTypes;
NameBusiness.displayName = 'NameBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(NameBusiness);
