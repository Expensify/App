import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import subStepPropTypes from '../../subStepPropTypes';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import {reimbursementAccountPropTypes} from '../../reimbursementAccountPropTypes';
import * as BankAccounts from '../../../../libs/actions/BankAccounts';
import getDefaultStateForField from '../../utils/getDefaultStateForField';
import NewDatePicker from '../../../../components/NewDatePicker';
import FormProvider from '../../../../components/Form/FormProvider';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...subStepPropTypes,
};

const companyIncorporationDateKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.INCORPORATION_DATE;

const validate = (values) => ValidationUtils.getFieldRequiredErrors(values, [companyIncorporationDateKey]);

function IncorporationDateBusiness({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultCompanyIncorporationDate = getDefaultStateForField({reimbursementAccount, fieldName: companyIncorporationDateKey, defaultValue: new Date()});

    const handleSubmit = (values) => {
        BankAccounts.updateOnyxVBBAData({
            [companyIncorporationDateKey]: values[companyIncorporationDateKey],
        });

        onNext();
    };

    return (
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <View>
                <Text style={[styles.textHeadline, styles.mb3]}>{translate('businessInfoStep.selectYourCompanysIncorporationDate')}</Text>
                <NewDatePicker
                    inputID={companyIncorporationDateKey}
                    label={translate('businessInfoStep.incorporationDate')}
                    containerStyles={[styles.mt6]}
                    placeholder={translate('businessInfoStep.incorporationDatePlaceholder')}
                    defaultValue={defaultCompanyIncorporationDate}
                    shouldSaveDraft
                />
            </View>
        </FormProvider>
    );
}

IncorporationDateBusiness.propTypes = propTypes;
IncorporationDateBusiness.displayName = 'IncorporationDateBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(IncorporationDateBusiness);
