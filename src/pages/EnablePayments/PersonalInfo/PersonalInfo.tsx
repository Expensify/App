import React, {useMemo} from 'react';
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
import IdologyQuestions from '@pages/EnablePayments/IdologyQuestions';
import getInitialSubstepForPersonalInfo from '@pages/EnablePayments/utils/getInitialSubstepForPersonalInfo';
import getSubstepValues from '@pages/EnablePayments/utils/getSubstepValues';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WalletAdditionalDetailsForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';
import type {WalletAdditionalDetailsRefactor} from '@src/types/onyx/WalletAdditionalDetails';
import Address from './substeps/AddressStep';
import Confirmation from './substeps/ConfirmationStep';
import DateOfBirth from './substeps/DateOfBirthStep';
import FullName from './substeps/FullNameStep';
import PhoneNumber from './substeps/PhoneNumberStep';
import SocialSecurityNumber from './substeps/SocialSecurityNumberStep';

type PersonalInfoPageOnyxProps = {
    /** Reimbursement account from ONYX */
    walletAdditionalDetails: OnyxEntry<WalletAdditionalDetailsRefactor>;

    /** The draft values of the bank account being setup */
    walletAdditionalDetailsDraft: OnyxEntry<WalletAdditionalDetailsForm>;
};

type PersonalInfoPageProps = PersonalInfoPageOnyxProps;

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;
const bodyContent: Array<React.ComponentType<SubStepProps>> = [FullName, DateOfBirth, Address, PhoneNumber, SocialSecurityNumber, Confirmation];

function PersonalInfoPage({walletAdditionalDetails, walletAdditionalDetailsDraft}: PersonalInfoPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const showIdologyQuestions = walletAdditionalDetails?.questions && walletAdditionalDetails?.questions.length > 0;

    const values = useMemo(() => getSubstepValues(PERSONAL_INFO_STEP_KEYS, walletAdditionalDetailsDraft, walletAdditionalDetails), [walletAdditionalDetails, walletAdditionalDetailsDraft]);
    const submit = () => {
        const personalDetails = {
            phoneNumber: (values.phoneNumber && parsePhoneNumber(values.phoneNumber, {regionCode: CONST.COUNTRY.US}).number?.significant) ?? '',
            legalFirstName: values?.[PERSONAL_INFO_STEP_KEYS.FIRST_NAME] ?? '',
            legalLastName: values?.[PERSONAL_INFO_STEP_KEYS.LAST_NAME] ?? '',
            addressStreet: values?.[PERSONAL_INFO_STEP_KEYS.STREET] ?? '',
            addressCity: values?.[PERSONAL_INFO_STEP_KEYS.CITY] ?? '',
            addressState: values?.[PERSONAL_INFO_STEP_KEYS.STATE] ?? '',
            addressZip: values?.[PERSONAL_INFO_STEP_KEYS.ZIP_CODE] ?? '',
            dob: values?.[PERSONAL_INFO_STEP_KEYS.DOB] ?? '',
            ssn: values?.[PERSONAL_INFO_STEP_KEYS.SSN_LAST_4] ?? '',
        };
        // Attempt to set the personal details
        Wallet.updatePersonalDetails(personalDetails);
    };

    const startFrom = useMemo(() => getInitialSubstepForPersonalInfo(values), [values]);

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        moveTo,
        screenIndex,
        goToTheLastStep,
    } = useSubStep({
        bodyContent,
        startFrom,
        onFinished: submit,
    });

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }
        if (screenIndex === 0) {
            Wallet.updateCurrentStep(CONST.WALLET.STEP.ADD_BANK_ACCOUNT);
            return;
        }
        if (showIdologyQuestions) {
            Wallet.setAdditionalDetailsQuestions(null, '');
            return;
        }
        prevScreen();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={PersonalInfoPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('personalInfoStep.personalInfo')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={1}
                    stepNames={CONST.WALLET.STEP_NAMES}
                />
            </View>
            {showIdologyQuestions ? (
                <IdologyQuestions
                    questions={walletAdditionalDetails?.questions ?? []}
                    idNumber={walletAdditionalDetails?.idNumber ?? ''}
                />
            ) : (
                <SubStep
                    isEditing={isEditing}
                    onNext={nextScreen}
                    onMove={moveTo}
                />
            )}
        </ScreenWrapper>
    );
}

PersonalInfoPage.displayName = 'PersonalInfoPage';

export default withOnyx<PersonalInfoPageProps, PersonalInfoPageOnyxProps>({
    // @ts-expect-error ONYXKEYS.WALLET_ADDITIONAL_DETAILS is conflicting with ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_FORM
    walletAdditionalDetails: {
        key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
    },
    // @ts-expect-error ONYXKEYS.WALLET_ADDITIONAL_DETAILS is conflicting with ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_FORM
    walletAdditionalDetailsDraft: {
        key: ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT,
    },
})(PersonalInfoPage);
