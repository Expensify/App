import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const BUSINESS_INFO_STEP_KEYS = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const {
    COMPANY_NAME,
    BUSINESS_REGISTRATION_INCORPORATION_NUMBER,
    TAX_ID_EIN_NUMBER,
    COMPANY_COUNTRY_CODE,
    COMPANY_STREET,
    COMPANY_CITY,
    COMPANY_STATE,
    COMPANY_POSTAL_CODE,
    BUSINESS_CONTACT_NUMBER,
    BUSINESS_CONFIRMATION_EMAIL,
    FORMATION_INCORPORATION_COUNTRY_CODE,
    ANNUAL_VOLUME,
    APPLICANT_TYPE_ID,
    TRADE_VOLUME,
    BUSINESS_CATEGORY,
} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

const displayStringValue = (list: Array<{id: string; name: string; stringValue: string}>, matchingName: string) => {
    return list.find((item) => item.name === matchingName)?.stringValue ?? '';
};

const displayAddress = (street: string, city: string, state: string, zipCode: string, country: string): string => {
    return country === CONST.COUNTRY.US || country === CONST.COUNTRY.CA ? `${street}, ${city}, ${state}, ${zipCode}, ${country}` : `${street}, ${city}, ${zipCode}, ${country}`;
};

function Confirmation({onNext, onMove}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [corpayOnboardingFields] = useOnyx(ONYXKEYS.CORPAY_ONBOARDING_FIELDS);
    const error = ErrorUtils.getLatestErrorMessage(reimbursementAccount);

    const values = useMemo(() => getSubstepValues(BUSINESS_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const paymentVolume = useMemo(
        () => displayStringValue(corpayOnboardingFields?.picklists.AnnualVolumeRange ?? [], values[ANNUAL_VOLUME]),
        [corpayOnboardingFields?.picklists.AnnualVolumeRange, values],
    );
    const businessCategory = useMemo(
        () => displayStringValue(corpayOnboardingFields?.picklists.NatureOfBusiness ?? [], values[BUSINESS_CATEGORY]),
        [corpayOnboardingFields?.picklists.NatureOfBusiness, values],
    );
    const businessType = useMemo(
        () => displayStringValue(corpayOnboardingFields?.picklists.ApplicantType ?? [], values[APPLICANT_TYPE_ID]),
        [corpayOnboardingFields?.picklists.ApplicantType, values],
    );
    const tradeVolumeRange = useMemo(
        () => displayStringValue(corpayOnboardingFields?.picklists.TradeVolumeRange ?? [], values[TRADE_VOLUME]),
        [corpayOnboardingFields?.picklists.TradeVolumeRange, values],
    );

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <ScrollView
                    style={styles.pt0}
                    contentContainerStyle={[styles.flexGrow1, safeAreaPaddingBottomStyle]}
                >
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('businessInfoStep.letsDoubleCheck')}</Text>
                    <MenuItemWithTopDescription
                        description={translate('businessInfoStep.legalBusinessName')}
                        title={values[COMPANY_NAME]}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(0);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('businessInfoStep.registrationNumber')}
                        title={values[BUSINESS_REGISTRATION_INCORPORATION_NUMBER]}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(3);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('businessInfoStep.taxIDEIN')}
                        title={values[TAX_ID_EIN_NUMBER]}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(4);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('businessInfoStep.businessAddress')}
                        title={displayAddress(values[COMPANY_STREET], values[COMPANY_CITY], values[COMPANY_STATE], values[COMPANY_POSTAL_CODE], values[COMPANY_COUNTRY_CODE])}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(1);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('common.phoneNumber')}
                        title={values[BUSINESS_CONTACT_NUMBER]}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(2);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('common.email')}
                        title={values[BUSINESS_CONFIRMATION_EMAIL]}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(2);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('businessInfoStep.businessType')}
                        title={businessType}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(6);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('businessInfoStep.incorporation')}
                        title={values[FORMATION_INCORPORATION_COUNTRY_CODE]}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(5);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('businessInfoStep.businessCategory')}
                        title={businessCategory}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(6);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('businessInfoStep.annualPaymentVolume')}
                        title={paymentVolume}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(7);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('businessInfoStep.averageReimbursementAmount')}
                        title={tradeVolumeRange}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(8);
                        }}
                    />
                    <View style={[styles.p5, styles.flexGrow1, styles.justifyContentEnd]}>
                        {!!error && error.length > 0 && (
                            <DotIndicatorMessage
                                textStyles={[styles.formError]}
                                type="error"
                                messages={{error}}
                            />
                        )}
                        <Button
                            success
                            isLoading={reimbursementAccount?.isSavingCorpayOnboardingCompanyFields}
                            style={[styles.w100, styles.mt2]}
                            onPress={onNext}
                            large
                            text={translate('common.confirm')}
                        />
                    </View>
                </ScrollView>
            )}
        </SafeAreaConsumer>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
