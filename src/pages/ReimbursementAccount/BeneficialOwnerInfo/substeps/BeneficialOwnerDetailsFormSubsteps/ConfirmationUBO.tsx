import React from 'react';
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
import getValuesForBeneficialOwner from '@pages/ReimbursementAccount/utils/getValuesForBeneficialOwner';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {ReimbursementAccount} from '@src/types/onyx';

type ConfirmationUBOOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};
type ConfirmationUBOProps = SubStepProps & ConfirmationUBOOnyxProps & {beneficialOwnerBeingModifiedID: string};

const UBO_STEP_INDEXES = CONST.REIMBURSEMENT_ACCOUNT.SUBSTEP_INDEX.UBO;

function ConfirmationUBO({reimbursementAccount, reimbursementAccountDraft, onNext, onMove, beneficialOwnerBeingModifiedID}: ConfirmationUBOProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const values = getValuesForBeneficialOwner(beneficialOwnerBeingModifiedID, reimbursementAccountDraft);
    const error = reimbursementAccount ? ErrorUtils.getLatestErrorMessage(reimbursementAccount) : '';

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <ScrollView
                    style={styles.pt0}
                    contentContainerStyle={[styles.flexGrow1, safeAreaPaddingBottomStyle]}
                >
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('beneficialOwnerInfoStep.letsDoubleCheck')}</Text>
                    <MenuItemWithTopDescription
                        description={translate('beneficialOwnerInfoStep.legalName')}
                        title={`${values.firstName} ${values.lastName}`}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(UBO_STEP_INDEXES.LEGAL_NAME);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('common.dob')}
                        title={values.dob}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(UBO_STEP_INDEXES.DATE_OF_BIRTH);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('beneficialOwnerInfoStep.last4SSN')}
                        title={values.ssnLast4}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(UBO_STEP_INDEXES.SSN);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('beneficialOwnerInfoStep.address')}
                        title={`${values.street}, ${values.city}, ${values.state} ${values.zipCode}`}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(UBO_STEP_INDEXES.ADDRESS);
                        }}
                    />

                    <Text style={[styles.mt3, styles.ph5, styles.textMicroSupporting]}>
                        {`${translate('beneficialOwnerInfoStep.byAddingThisBankAccount')} `}
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
                    <View style={[styles.ph5, styles.mtAuto]}>
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
                            style={[styles.w100, styles.mt2, styles.pb5]}
                            onPress={onNext}
                            text={translate('common.confirm')}
                        />
                    </View>
                </ScrollView>
            )}
        </SafeAreaConsumer>
    );
}

ConfirmationUBO.displayName = 'ConfirmationUBO';

export default withOnyx<ConfirmationUBOProps, ConfirmationUBOOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(ConfirmationUBO);
