import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {annualVolumeRange, applicantType, natureOfBusiness} from '@pages/ReimbursementAccount/NonUSD/BusinessInfo/mockedCorpayLists';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const BUSINESS_INFO_STEP_KEYS = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const {
    COMPANY_NAME,
    BUSINESS_REGISTRATION_INCORPORATION_NUMBER,
    COMPANY_STREET,
    COMPANY_CITY,
    COMPANY_STATE,
    COMPANY_ZIP_CODE,
    BUSINESS_CONTACT_NUMBER,
    FORMATION_INCORPORATION_COUNTRY_CODE,
    ANNUAL_VOLUME,
    APPLICANT_TYPE_ID,
    BUSINESS_CATEGORY,
} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

const displayStringValue = (list: Array<{id: string; name: string; stringValue: string}>, matchingName: string) => {
    return list.find((item) => item.name === matchingName)?.stringValue ?? '';
};

function Confirmation({onNext, onMove}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const values = useMemo(() => getSubstepValues(BUSINESS_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const paymentVolume = useMemo(() => displayStringValue(annualVolumeRange, values[ANNUAL_VOLUME]), [values]);
    const businessCategory = useMemo(() => displayStringValue(natureOfBusiness, values[BUSINESS_CATEGORY]), [values]);
    const businessType = useMemo(() => displayStringValue(applicantType, values[APPLICANT_TYPE_ID]), [values]);

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
                        description={translate('businessInfoStep.businessAddress')}
                        title={`${values[COMPANY_STREET]}, ${values[COMPANY_CITY]}, ${values[COMPANY_STATE]}, ${values[COMPANY_ZIP_CODE]}`}
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
                        description={translate('businessInfoStep.businessType')}
                        title={businessType}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(5);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('businessInfoStep.incorporation')}
                        title={values[FORMATION_INCORPORATION_COUNTRY_CODE]}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(4);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('businessInfoStep.businessCategory')}
                        title={businessCategory}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(5);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('businessInfoStep.annualPaymentVolume')}
                        title={paymentVolume}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(6);
                        }}
                    />
                    <View style={[styles.p5, styles.flexGrow1, styles.justifyContentEnd]}>
                        <Button
                            success
                            style={[styles.w100]}
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
