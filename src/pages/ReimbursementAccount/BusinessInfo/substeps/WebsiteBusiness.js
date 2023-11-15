import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import * as ValidationUtils from '@libs/ValidationUtils';
import {reimbursementAccountDefaultProps, reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    /** Object with various information about the user */
    user: PropTypes.shape({
        /** Whether or not the user is on a public domain email account or not */
        isFromPublicDomain: PropTypes.bool,
    }),

    ...subStepPropTypes,
};

const defaultProps = {
    reimbursementAccount: reimbursementAccountDefaultProps,
    session: {
        email: null,
    },
    user: {},
};

const companyWebsiteKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_WEBSITE;

const validate = (values) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [companyWebsiteKey]);

    if (values.website && !ValidationUtils.isValidWebsite(values.website)) {
        errors.website = 'bankAccount.error.website';
    }

    return errors;
};

function WebsiteBusiness({reimbursementAccount, user, session, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultWebsiteExample = useMemo(() => (lodashGet(user, 'isFromPublicDomain', false) ? 'https://' : `https://www.${Str.extractEmailDomain(session.email, '')}`), [user, session]);

    const defaultCompanyWebsite = getDefaultValueForReimbursementAccountField(reimbursementAccount, companyWebsiteKey, defaultWebsiteExample);

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <Text style={[styles.textHeadline]}>{translate('businessInfoStep.enterYourCompanysWebsite')}</Text>
            <Text style={[styles.label, styles.mb2]}>{translate('common.websiteExample')}</Text>
            <TextInput
                inputID={companyWebsiteKey}
                label={translate('businessInfoStep.companyWebsite')}
                aria-label={translate('businessInfoStep.companyWebsite')}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                containerStyles={[styles.mt4]}
                defaultValue={defaultCompanyWebsite}
                shouldSaveDraft
                inputMode={CONST.INPUT_MODE.URL}
            />
        </Form>
    );
}

WebsiteBusiness.propTypes = propTypes;
WebsiteBusiness.defaultProps = defaultProps;
WebsiteBusiness.displayName = 'WebsiteBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
    user: {
        key: ONYXKEYS.USER,
    },
})(WebsiteBusiness);
