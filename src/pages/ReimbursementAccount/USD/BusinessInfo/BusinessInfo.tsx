import {Str} from 'expensify-common';
import lodashPick from 'lodash/pick';
import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import {isValidWebsite} from '@libs/ValidationUtils';
import getInitialSubStepForBusinessInfo from '@pages/ReimbursementAccount/USD/utils/getInitialSubStepForBusinessInfo';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import {updateCompanyInformationForBankAccount} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import AddressBusiness from './subSteps/AddressBusiness';
import ConfirmationBusiness from './subSteps/ConfirmationBusiness';
import IncorporationDateBusiness from './subSteps/IncorporationDateBusiness';
import IncorporationStateBusiness from './subSteps/IncorporationStateBusiness';
import NameBusiness from './subSteps/NameBusiness';
import PhoneNumberBusiness from './subSteps/PhoneNumberBusiness';
import TaxIdBusiness from './subSteps/TaxIdBusiness';
import TypeBusiness from './subSteps/TypeBusiness/TypeBusiness';
import WebsiteBusiness from './subSteps/WebsiteBusiness';

type BusinessInfoProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

const BUSINESS_INFO_STEP_KEYS = INPUT_IDS.BUSINESS_INFO_STEP;

const bodyContent: Array<React.ComponentType<SubStepProps>> = [
    NameBusiness,
    TaxIdBusiness,
    WebsiteBusiness,
    PhoneNumberBusiness,
    AddressBusiness,
    TypeBusiness,
    IncorporationDateBusiness,
    IncorporationStateBusiness,
    ConfirmationBusiness,
];

function BusinessInfo({onBackButtonPress}: BusinessInfoProps) {
    const {translate} = useLocalize();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const getBankAccountFields = useCallback(
        (fieldNames: string[]) => ({
            ...lodashPick(reimbursementAccount?.achData, ...fieldNames),
            ...lodashPick(reimbursementAccountDraft, ...fieldNames),
        }),
        [reimbursementAccount, reimbursementAccountDraft],
    );

    const policyID = reimbursementAccount?.achData?.policyID;
    const values = useMemo(() => getSubStepValues(BUSINESS_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const submit = useCallback(
        (isConfirmPage: boolean) => {
            const companyWebsite = Str.sanitizeURL(values.website, CONST.COMPANY_WEBSITE_DEFAULT_SCHEME);
            updateCompanyInformationForBankAccount(
                Number(reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID),
                {
                    ...values,
                    ...getBankAccountFields(['routingNumber', 'accountNumber', 'bankName', 'plaidAccountID', 'plaidAccessToken', 'isSavings']),
                    companyTaxID: values.companyTaxID?.replace(CONST.REGEX.NON_NUMERIC, ''),
                    companyPhone: parsePhoneNumber(values.companyPhone ?? '', {regionCode: CONST.COUNTRY.US}).number?.significant,
                    website: isValidWebsite(companyWebsite) ? companyWebsite : undefined,
                },
                policyID,
                isConfirmPage,
            );
        },
        [reimbursementAccount, values, getBankAccountFields, policyID],
    );

    const startFrom = useMemo(() => getInitialSubStepForBusinessInfo(values), [values]);

    const {
        componentToRender: SubStep,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep({bodyContent, startFrom, onFinished: () => submit(true), onNextSubStep: () => submit(false)});

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        if (screenIndex === 0) {
            onBackButtonPress();
        } else {
            prevScreen();
        }
    };

    return (
        <InteractiveStepWrapper
            wrapperID={BusinessInfo.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('businessInfoStep.businessInfo')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={3}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </InteractiveStepWrapper>
    );
}

BusinessInfo.displayName = 'BusinessInfo';

export default BusinessInfo;
