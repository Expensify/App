import React from 'react';
import {ScrollView, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import getValuesForBeneficialOwner from '@pages/ReimbursementAccount/utils/getValuesForBeneficialOwner';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount, ReimbursementAccountForm} from '@src/types/onyx';

type ConfirmationUBOOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};
type ConfirmationUBOProps = SubStepProps & ConfirmationUBOOnyxProps & {beneficialOwnerBeingModifiedID: string};

function ConfirmationUBO({reimbursementAccount, reimbursementAccountDraft, onNext, onMove, beneficialOwnerBeingModifiedID}: ConfirmationUBOProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const values = getValuesForBeneficialOwner(beneficialOwnerBeingModifiedID, reimbursementAccountDraft);
    const error = reimbursementAccount ? ErrorUtils.getLatestErrorMessage(reimbursementAccount) : '';

    return (
        <ScreenWrapper
            testID={ConfirmationUBO.displayName}
            style={[styles.pt0]}
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <Text style={[styles.textHeadline, styles.ph5, styles.mt5, styles.mb3]}>{translate('beneficialOwnerInfoStep.letsDoubleCheck')}</Text>
                <MenuItemWithTopDescription
                    description={translate('beneficialOwnerInfoStep.legalName')}
                    title={`${values.firstName} ${values.lastName}`}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(0);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('common.dob')}
                    title={values.dob}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(1);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('beneficialOwnerInfoStep.last4SSN')}
                    title={values.ssnLast4}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(2);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('beneficialOwnerInfoStep.address')}
                    title={`${values.street}, ${values.city}, ${values.state} ${values.zipCode}`}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(3);
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
                    {error.length > 0 && (
                        <DotIndicatorMessage
                            textStyles={[styles.formError]}
                            type="error"
                            messages={{error}}
                        />
                    )}
                    <Button
                        success
                        style={[styles.w100, styles.mt2, styles.pb5]}
                        onPress={onNext}
                        text={translate('common.confirm')}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

ConfirmationUBO.displayName = 'ConfirmationUBO';

export default withOnyx<ConfirmationUBOProps, ConfirmationUBOOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(ConfirmationUBO);
