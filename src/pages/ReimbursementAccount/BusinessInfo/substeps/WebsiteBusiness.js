import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import TextInput from '../../../../components/TextInput';
import CONST from '../../../../CONST';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import subStepPropTypes from '../../subStepPropTypes';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import {reimbursementAccountPropTypes} from '../../reimbursementAccountPropTypes';
import getDefaultStateForField from '../../utils/getDefaultStateForField';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

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
    session: {
        email: null,
    },
    user: {},
};

const companyWebsiteKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_WEBSITE;

const validate = (values) => ValidationUtils.getFieldRequiredErrors(values, [companyWebsiteKey]);

function WebsiteBusiness({reimbursementAccount, user, session, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultWebsiteExample = useMemo(() => (lodashGet(user, 'isFromPublicDomain', false) ? 'https://' : `https://www.${Str.extractEmailDomain(session.email, '')}`), [user, session]);

    const defaultCompanyWebsite = getDefaultStateForField({reimbursementAccount, fieldName: companyWebsiteKey, defaultValue: defaultWebsiteExample});

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <View>
                <Text style={[styles.textHeadline]}>{translate('businessInfoStep.enterYourCompanysWebsite')}</Text>
                <Text style={[styles.label, styles.mb2]}>{translate('common.websiteExample')}</Text>
                <TextInput
                    inputID={companyWebsiteKey}
                    label={translate('businessInfoStep.companyWebsite')}
                    accessibilityLabel={translate('businessInfoStep.companyWebsite')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    containerStyles={[styles.mt4]}
                    defaultValue={defaultCompanyWebsite}
                    shouldSaveDraft
                    keyboardType={CONST.KEYBOARD_TYPE.URL}
                />
            </View>
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
