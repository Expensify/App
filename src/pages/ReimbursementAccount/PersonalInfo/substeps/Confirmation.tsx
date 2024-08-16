import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
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
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

type ConfirmationOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};

type ConfirmationProps = ConfirmationOnyxProps & SubStepProps;

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;
const PERSONAL_INFO_STEP_INDEXES = CONST.REIMBURSEMENT_ACCOUNT.SUBSTEP_INDEX.PERSONAL_INFO;

function Confirmation({reimbursementAccount, reimbursementAccountDraft, onNext, onMove}: ConfirmationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const isLoading = reimbursementAccount?.isLoading ?? false;
    const values = useMemo(() => getSubstepValues(PERSONAL_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const error = ErrorUtils.getLatestErrorMessage(reimbursementAccount ?? {});

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
                        description={translate('personalInfoStep.last4SSN')}
                        title={values[PERSONAL_INFO_STEP_KEYS.SSN_LAST_4]}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(PERSONAL_INFO_STEP_INDEXES.SSN);
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

Confirmation.displayName = 'Confirmation';

export default withOnyx<ConfirmationProps, ConfirmationOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(Confirmation);
