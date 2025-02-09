import React from 'react';
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
import getNeededDocumentsStatusForBeneficialOwner from '@pages/ReimbursementAccount/NonUSD/utils/getNeededDocumentsStatusForBeneficialOwner';
import getValuesForBeneficialOwner from '@pages/ReimbursementAccount/NonUSD/utils/getValuesForBeneficialOwner';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type ConfirmationProps = SubStepProps & {ownerBeingModifiedID: string};

const {PREFIX, COUNTRY} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

function Confirmation({onNext, onMove, ownerBeingModifiedID}: ConfirmationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const values = getValuesForBeneficialOwner(ownerBeingModifiedID, reimbursementAccountDraft);
    const beneficialOwnerCountryInputID = `${PREFIX}_${ownerBeingModifiedID}_${COUNTRY}` as const;
    const beneficialOwnerCountry = String(reimbursementAccountDraft?.[beneficialOwnerCountryInputID] ?? '');
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? '';
    const countryStepCountryValue = reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';
    const isDocumentNeededStatus = getNeededDocumentsStatusForBeneficialOwner(currency, countryStepCountryValue, beneficialOwnerCountry);

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <ScrollView
                    style={styles.pt0}
                    contentContainerStyle={[styles.flexGrow1, safeAreaPaddingBottomStyle]}
                >
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('ownershipInfoStep.letsDoubleCheck')}</Text>
                    <MenuItemWithTopDescription
                        description={translate('ownershipInfoStep.legalName')}
                        title={`${values.firstName} ${values.lastName}`}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(0);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('ownershipInfoStep.ownershipPercentage')}
                        title={values.ownershipPercentage}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(1);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('common.dob')}
                        title={values.dob}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(2);
                        }}
                    />
                    {beneficialOwnerCountry === CONST.COUNTRY.US && (
                        <MenuItemWithTopDescription
                            description={translate('ownershipInfoStep.last4')}
                            title={values.ssnLast4}
                            shouldShowRightIcon
                            onPress={() => {
                                onMove(4);
                            }}
                        />
                    )}
                    <MenuItemWithTopDescription
                        description={translate('ownershipInfoStep.address')}
                        title={`${values.street}, ${values.city}, ${values.state} ${values.zipCode}`}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(3);
                        }}
                    />
                    {isDocumentNeededStatus.isProofOfOwnershipNeeded && values.proofOfOwnership.length > 0 && (
                        <MenuItemWithTopDescription
                            description={translate('ownershipInfoStep.proofOfBeneficialOwner')}
                            title={values.proofOfOwnership.map((file) => file.name).join(', ')}
                            shouldShowRightIcon
                            onPress={() => {
                                onMove(5);
                            }}
                        />
                    )}
                    {isDocumentNeededStatus.isCopyOfIDNeeded && values.copyOfID.length > 0 && (
                        <MenuItemWithTopDescription
                            description={translate('ownershipInfoStep.copyOfID')}
                            title={values.copyOfID.map((file) => file.name).join(', ')}
                            shouldShowRightIcon
                            onPress={() => {
                                onMove(5);
                            }}
                        />
                    )}
                    {isDocumentNeededStatus.isProofOfAddressNeeded && values.addressProof.length > 0 && (
                        <MenuItemWithTopDescription
                            description={translate('ownershipInfoStep.proofOfAddress')}
                            title={values.addressProof.map((file) => file.name).join(', ')}
                            shouldShowRightIcon
                            onPress={() => {
                                onMove(5);
                            }}
                        />
                    )}
                    {isDocumentNeededStatus.isCodiceFiscaleNeeded && values.codiceFisacle.length > 0 && (
                        <MenuItemWithTopDescription
                            description={translate('ownershipInfoStep.codiceFiscale')}
                            title={values.codiceFisacle.map((file) => file.name).join(', ')}
                            shouldShowRightIcon
                            onPress={() => {
                                onMove(5);
                            }}
                        />
                    )}
                    <View style={[styles.ph5, styles.pb5, styles.flexGrow1, styles.justifyContentEnd]}>
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
