import Str from 'expensify-common/lib/str';
import React, {useEffect, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount, Session, User} from '@src/types/onyx';
import type {FormValues} from '@src/types/onyx/Form';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type WebsiteBusinessOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;

    /** Object with various information about the user */
    user: OnyxEntry<User>;
};

type WebsiteBusinessProps = WebsiteBusinessOnyxProps & SubStepProps;

const companyWebsiteKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_WEBSITE;

const validate = (values: FormValues): OnyxCommon.Errors => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [companyWebsiteKey]);

    if (values.website && !ValidationUtils.isValidWebsite(values.website)) {
        errors.website = 'bankAccount.error.website';
    }

    return errors;
};

function WebsiteBusiness({reimbursementAccount, user, session, onNext, isEditing}: WebsiteBusinessProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultWebsiteExample = useMemo(
        () => (user?.isFromPublicDomain ? 'https://' : `https://www.${Str.extractEmailDomain(session?.email ?? '')}`),
        [session?.email, user?.isFromPublicDomain],
    );
    const defaultCompanyWebsite = reimbursementAccount?.achData?.website ?? defaultWebsiteExample;

    useEffect(() => {
        BankAccounts.addBusinessWebsiteForDraft(defaultCompanyWebsite);
    }, [defaultCompanyWebsite]);

    return (
        // @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
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
        </FormProvider>
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
