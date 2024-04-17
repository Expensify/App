import React, {useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
// TODO: uncomment in the next PR
// import {parsePhoneNumber} from '@libs/PhoneNumber';
import Navigation from '@navigation/Navigation';
import PhoneNumber from '@pages/EnablePayments/PersonalInfo/substeps/PhoneNumber';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {WalletAdditionalDetailsForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';
import type {WalletAdditionalDetailsRefactor} from '@src/types/onyx/WalletAdditionalDetails';
import getInitialSubstepForPersonalInfo from '../utils/getInitialSubstepForPersonalInfo';
import getSubstepValues from '../utils/getSubstepValues';
import Address from './substeps/Address';
import Confirmation from './substeps/Confirmation';
import DateOfBirth from './substeps/DateOfBirth';
import FullName from './substeps/FullName';
import SocialSecurityNumber from './substeps/SocialSecurityNumber';

type PersonalInfoPageOnyxProps = {
    /** Reimbursement account from ONYX */
    walletAdditionalDetails: OnyxEntry<WalletAdditionalDetailsRefactor>;

    /** The draft values of the bank account being setup */
    walletAdditionalDetailsDraft: OnyxEntry<WalletAdditionalDetailsForm>;
};

type PersonalInfoPageProps = PersonalInfoPageOnyxProps;

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;
const bodyContent: Array<React.ComponentType<SubStepProps>> = [FullName, DateOfBirth, PhoneNumber, SocialSecurityNumber, Address, Confirmation];

function PersonalInfoPage({walletAdditionalDetails, walletAdditionalDetailsDraft}: PersonalInfoPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const values = useMemo(() => getSubstepValues(PERSONAL_INFO_STEP_KEYS, walletAdditionalDetailsDraft, walletAdditionalDetails), [walletAdditionalDetails, walletAdditionalDetailsDraft]);
    const submit = () => {
        // TODO: uncomment in the next PR
        // const personalDetails = {
        //     phoneNumber: (values.phoneNumber && parsePhoneNumber(values.phoneNumber, {regionCode: CONST.COUNTRY.US}).number?.significant) ?? '',
        //     legalFirstName: values?.[PERSONAL_INFO_STEP_KEYS.FIRST_NAME] ?? '',
        //     legalLastName: values?.[PERSONAL_INFO_STEP_KEYS.LAST_NAME] ?? '',
        //     addressStreet: values?.[PERSONAL_INFO_STEP_KEYS.STREET] ?? '',
        //     addressCity: values?.[PERSONAL_INFO_STEP_KEYS.CITY] ?? '',
        //     addressState: values?.[PERSONAL_INFO_STEP_KEYS.STATE] ?? '',
        //     addressZip: values?.[PERSONAL_INFO_STEP_KEYS.ZIP_CODE] ?? '',
        //     dob: values?.[PERSONAL_INFO_STEP_KEYS.DOB] ?? '',
        //     ssn: values?.[PERSONAL_INFO_STEP_KEYS.SSN_LAST_4] ?? '',
        // };
        // Attempt to set the personal details
        // Wallet.updatePersonalDetails(personalDetails);
        Navigation.navigate(ROUTES.SETTINGS_WALLET);
    };

    const startFrom = useMemo(() => getInitialSubstepForPersonalInfo(values), [values]);

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        moveTo,
        screenIndex,
    } = useSubStep({
        bodyContent,
        startFrom,
        onFinished: submit,
    });

    const handleBackButtonPress = () => {
        // TODO: connect to the fist step of the wallet setup
        if (screenIndex === 0) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET);
            Wallet.resetWalletAdditionalDetailsDraft();
            return;
        }
        prevScreen();
    };

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
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
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
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
