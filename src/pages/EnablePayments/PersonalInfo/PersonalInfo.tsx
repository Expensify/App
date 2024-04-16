import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import PhoneNumber from '@pages/EnablePayments/PersonalInfo/substeps/PhoneNumber';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalBankAccountForm} from '@src/types/form/PersonalBankAccountForm';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';
import type {UserWallet, WalletAdditionalDetails} from '@src/types/onyx';
import getInitialSubstepForPersonalInfo from '../utils/getInitialSubstepForPersonalInfo';
import getSubstepValues from '../utils/getSubstepValues';
import Address from './substeps/Address';
import Confirmation from './substeps/Confirmation';
import DateOfBirth from './substeps/DateOfBirth';
import FullName from './substeps/FullName';
import SocialSecurityNumber from './substeps/SocialSecurityNumber';

type PersonalInfoPageOnyxProps = {
    /** The user's wallet */
    userWallet: OnyxEntry<UserWallet>;

    /** Reimbursement account from ONYX */
    walletAdditionalDetails: OnyxEntry<WalletAdditionalDetails>;

    /** The draft values of the bank account being setup */
    walletAdditionalDetailsDraft: OnyxEntry<PersonalBankAccountForm>;
};

type PersonalInfoPageProps = PersonalInfoPageOnyxProps;

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;
const bodyContent: Array<React.ComponentType<SubStepProps>> = [FullName, DateOfBirth, PhoneNumber, SocialSecurityNumber, Address, Confirmation];

function PersonalInfoPage({userWallet, walletAdditionalDetails, walletAdditionalDetailsDraft}: PersonalInfoPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();

    const {isPendingOnfidoResult, hasFailedOnfido} = userWallet ?? {};

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

    useEffect(() => {
        if (isOffline) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isPendingOnfidoResult || hasFailedOnfido) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET, CONST.NAVIGATION.TYPE.UP);
            return;
        }

        Wallet.openEnablePaymentsPage();
    }, [isOffline, isPendingOnfidoResult, hasFailedOnfido]);

    const startFrom = useMemo(() => getInitialSubstepForPersonalInfo(values), [values]);

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        moveTo,
    } = useSubStep({
        bodyContent,
        startFrom,
        onFinished: submit,
    });

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={userWallet?.currentStep !== CONST.WALLET.STEP.ONFIDO}
            includeSafeAreaPaddingBottom={false}
            testID={PersonalInfoPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('personalInfoStep.personalInfo')}
                onBackButtonPress={prevScreen}
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
    userWallet: {
        key: ONYXKEYS.USER_WALLET,

        // We want to refresh the wallet each time the user attempts to activate the wallet so we won't use the
        // stored values here.
        initWithStoredValues: false,
    },
    // @ts-expect-error ONYXKEYS.WALLET_ADDITIONAL_DETAILS is conflicting with ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_FORM
    walletAdditionalDetails: {
        key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
    },
    // @ts-expect-error ONYXKEYS.WALLET_ADDITIONAL_DETAILS is conflicting with ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_FORM
    walletAdditionalDetailsDraft: {
        key: ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT,
    },
})(PersonalInfoPage);
