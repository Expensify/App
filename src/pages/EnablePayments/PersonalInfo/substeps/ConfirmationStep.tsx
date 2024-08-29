import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import getSubstepValues from '@pages/EnablePayments/utils/getSubstepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;
const PERSONAL_INFO_STEP_INDEXES = CONST.WALLET.SUBSTEP_INDEXES.PERSONAL_INFO;

function ConfirmationStep({onNext, onMove}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
    const [walletAdditionalDetailsDraft] = useOnyx(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT);

    const isLoading = walletAdditionalDetails?.isLoading ?? false;
    const error = ErrorUtils.getLatestErrorMessage(walletAdditionalDetails ?? {});
    const values = useMemo(() => getSubstepValues(PERSONAL_INFO_STEP_KEYS, walletAdditionalDetailsDraft, walletAdditionalDetails), [walletAdditionalDetails, walletAdditionalDetailsDraft]);
    const shouldAskForFullSSN = walletAdditionalDetails?.errorCode === CONST.WALLET.ERROR.SSN;

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <ScrollView
                    style={styles.pt0}
                    contentContainerStyle={[styles.flexGrow1, safeAreaPaddingBottomStyle]}
                >
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('personalInfoStep.letsDoubleCheck')}</Text>
                    <MenuItemWithTopDescription
                        description={translate('personalInfoStep.legalName')}
                        title={`${values[PERSONAL_INFO_STEP_KEYS.FIRST_NAME]} ${values[PERSONAL_INFO_STEP_KEYS.LAST_NAME]}`}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(PERSONAL_INFO_STEP_INDEXES.LEGAL_NAME);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('common.dob')}
                        title={values[PERSONAL_INFO_STEP_KEYS.DOB]}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(PERSONAL_INFO_STEP_INDEXES.DATE_OF_BIRTH);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('personalInfoStep.address')}
                        title={`${values[PERSONAL_INFO_STEP_KEYS.STREET]}, ${values[PERSONAL_INFO_STEP_KEYS.CITY]}, ${values[PERSONAL_INFO_STEP_KEYS.STATE]} ${
                            values[PERSONAL_INFO_STEP_KEYS.ZIP_CODE]
                        }`}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(PERSONAL_INFO_STEP_INDEXES.ADDRESS);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('common.phoneNumber')}
                        title={values[PERSONAL_INFO_STEP_KEYS.PHONE_NUMBER]}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(PERSONAL_INFO_STEP_INDEXES.PHONE_NUMBER);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate(shouldAskForFullSSN ? 'common.ssnFull9' : 'personalInfoStep.last4SSN')}
                        title={values[PERSONAL_INFO_STEP_KEYS.SSN_LAST_4]}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(PERSONAL_INFO_STEP_INDEXES.SSN);
                        }}
                    />
                    <Text style={[styles.mt3, styles.ph5, styles.textMicroSupporting]}>
                        {`${translate('personalInfoStep.byAddingThisBankAccount')} `}
                        <TextLink
                            href={CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}
                            style={[styles.textMicro]}
                        >
                            {translate('onfidoStep.facialScan')}
                        </TextLink>
                        {', '}
                        <TextLink
                            href={CONST.ONFIDO_PRIVACY_POLICY_URL}
                            style={[styles.textMicro]}
                        >
                            {translate('common.privacy')}
                        </TextLink>
                        {` ${translate('common.and')} `}
                        <TextLink
                            href={CONST.ONFIDO_TERMS_OF_SERVICE_URL}
                            style={[styles.textMicro]}
                        >
                            {translate('common.termsOfService')}
                        </TextLink>
                    </Text>
                    <View style={[styles.ph5, styles.pb5, styles.flexGrow1, styles.justifyContentEnd]}>
                        {error && error.length > 0 && (
                            <DotIndicatorMessage
                                textStyles={[styles.formError]}
                                type="error"
                                messages={{error}}
                            />
                        )}
                        <Button
                            isDisabled={isOffline}
                            success
                            large
                            isLoading={isLoading}
                            style={[styles.w100]}
                            onPress={onNext}
                            text={translate('common.confirm')}
                        />
                    </View>
                </ScrollView>
            )}
        </SafeAreaConsumer>
    );
}

ConfirmationStep.displayName = 'ConfirmationStep';

export default ConfirmationStep;
