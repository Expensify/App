import Str from 'expensify-common/lib/str';
import React, {useEffect, useMemo} from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {ReimbursementAccount, Session, User} from '@src/types/onyx';
import * as OnyxCommon from '@src/types/onyx/OnyxCommon';

const companyWebsiteKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_WEBSITE;

const validate = (values: OnyxCommon.Errors) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [companyWebsiteKey]);

    if (values.website && !ValidationUtils.isValidWebsite(values.website)) {
        errors.website = 'bankAccount.error.website';
    }

    return errors;
};

type WebsiteBusinessOnyxProps = {
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
    session: OnyxEntry<Session>;
    user: OnyxEntry<User>;
};

type WebsiteBusinessProps = {
    reimbursementAccount: ReimbursementAccount;
    session: Session;
    user: User;
} & SubStepProps;

function WebsiteBusiness({reimbursementAccount, user, session, onNext, isEditing}: WebsiteBusinessProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultWebsiteExample = useMemo(
        () => (user.isFromPublicDomain ?? false ? 'https://' : `https://www.${Str.extractEmailDomain(session.email ?? '')}`),
        [session.email, user.isFromPublicDomain],
    );

    const defaultCompanyWebsite = getDefaultValueForReimbursementAccountField(reimbursementAccount, companyWebsiteKey, defaultWebsiteExample);

    useEffect(() => {
        BankAccounts.addBusinessWebsiteForDraft(defaultCompanyWebsite);
    }, [defaultCompanyWebsite]);

    return (
        // @ts-expect-error TODO: Remove this once Form (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
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
            <InputWrapper
                // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
                InputComponent={TextInput}
                inputID={companyWebsiteKey}
                label={translate('businessInfoStep.companyWebsite')}
                aria-label={translate('businessInfoStep.companyWebsite')}
                role={CONST.ROLE.PRESENTATION}
                containerStyles={[styles.mt4]}
                defaultValue={defaultCompanyWebsite}
                shouldSaveDraft
                inputMode={CONST.INPUT_MODE.URL}
            />
        </Form>
    );
}

WebsiteBusiness.displayName = 'WebsiteBusiness';

export default withOnyx<WebsiteBusinessProps, WebsiteBusinessOnyxProps>({
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
