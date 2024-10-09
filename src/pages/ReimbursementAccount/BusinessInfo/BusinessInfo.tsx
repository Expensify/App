import lodashPick from 'lodash/pick';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import getInitialSubstepForBusinessInfo from '@pages/ReimbursementAccount/utils/getInitialSubstepForBusinessInfo';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';
import AddressBusiness from './substeps/AddressBusiness';
import ConfirmationBusiness from './substeps/ConfirmationBusiness';
import IncorporationDateBusiness from './substeps/IncorporationDateBusiness';
import IncorporationStateBusiness from './substeps/IncorporationStateBusiness';
import NameBusiness from './substeps/NameBusiness';
import PhoneNumberBusiness from './substeps/PhoneNumberBusiness';
import TaxIdBusiness from './substeps/TaxIdBusiness';
import TypeBusiness from './substeps/TypeBusiness/TypeBusiness';
import WebsiteBusiness from './substeps/WebsiteBusiness';

type BusinessInfoOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};

type BusinessInfoProps = BusinessInfoOnyxProps & {
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

function BusinessInfo({reimbursementAccount, reimbursementAccountDraft, onBackButtonPress}: BusinessInfoProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const getBankAccountFields = useCallback(
        (fieldNames: string[]) => ({
            ...lodashPick(reimbursementAccount?.achData, ...fieldNames),
            ...lodashPick(reimbursementAccountDraft, ...fieldNames),
        }),
        [reimbursementAccount, reimbursementAccountDraft],
    );

    const policyID = reimbursementAccount?.achData?.policyID;
    const values = useMemo(() => getSubstepValues(BUSINESS_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const submit = useCallback(
        (isConfirmPage: boolean) => {
            BankAccounts.updateCompanyInformationForBankAccount(
                Number(reimbursementAccount?.achData?.bankAccountID),
                {
                    ...values,
                    ...getBankAccountFields(['routingNumber', 'accountNumber', 'bankName', 'plaidAccountID', 'plaidAccessToken', 'isSavings']),
                    companyTaxID: values.companyTaxID?.replace(CONST.REGEX.NON_NUMERIC, ''),
                    companyPhone: parsePhoneNumber(values.companyPhone ?? '', {regionCode: CONST.COUNTRY.US}).number?.significant,
                },
                policyID,
                isConfirmPage,
            );
        },
        [reimbursementAccount, values, getBankAccountFields, policyID],
    );

    const startFrom = useMemo(() => getInitialSubstepForBusinessInfo(values), [values]);

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
        <ScreenWrapper
            testID={BusinessInfo.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('businessInfoStep.businessInfo')}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={3}
                    stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
                />
            </View>
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

BusinessInfo.displayName = 'BusinessInfo';

export default withOnyx<BusinessInfoProps, BusinessInfoOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(BusinessInfo);
