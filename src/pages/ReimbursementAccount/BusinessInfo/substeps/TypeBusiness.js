import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Form from '@components/Form';
import Picker from '@components/Picker';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import * as ValidationUtils from '@libs/ValidationUtils';
import {reimbursementAccountDefaultProps, reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import getDefaultStateForField from '@pages/ReimbursementAccount/utils/getDefaultStateForField';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    ...subStepPropTypes,
};

const defaultProps = {
    reimbursementAccount: reimbursementAccountDefaultProps,
};

const companyIncorporationTypeKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.INCORPORATION_TYPE;

const validate = (values) => ValidationUtils.getFieldRequiredErrors(values, [companyIncorporationTypeKey]);

function TypeBusiness({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultIncorporationType = getDefaultStateForField({reimbursementAccount, fieldName: companyIncorporationTypeKey, defaultValue: ''});

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <Text style={[styles.textHeadline, styles.mb3]}>{translate('businessInfoStep.selectYourCompanysType')}</Text>
            <Picker
                inputID={companyIncorporationTypeKey}
                label={translate('businessInfoStep.companyType')}
                items={_.map(_.keys(CONST.INCORPORATION_TYPES), (key) => ({value: key, label: translate(`businessInfoStep.incorporationType.${key}`)}))}
                placeholder={{value: '', label: '-'}}
                defaultValue={defaultIncorporationType}
                shouldSaveDraft
            />
        </Form>
    );
}

TypeBusiness.propTypes = propTypes;
TypeBusiness.defaultProps = defaultProps;
TypeBusiness.displayName = 'TypeBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(TypeBusiness);
