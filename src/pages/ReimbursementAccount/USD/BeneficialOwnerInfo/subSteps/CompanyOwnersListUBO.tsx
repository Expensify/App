import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import getValuesForBeneficialOwner from '@pages/ReimbursementAccount/USD/utils/getValuesForBeneficialOwner';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type CompanyOwnersListUBOProps = {
    /** Method called when user confirms data */
    handleUBOsConfirmation: () => void;

    /** Method called when user presses on one of UBOs to edit its data */
    handleUBOEdit: (value: string) => void;

    /** List of UBO keys */
    beneficialOwnerKeys: string[];

    /** Info is user UBO */
    isUserUBO: boolean;

    /** Info about other existing UBOs */
    isAnyoneElseUBO: boolean;
};

const REQUESTOR_PERSONAL_INFO_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;

function CompanyOwnersListUBO({isAnyoneElseUBO, isUserUBO, handleUBOsConfirmation, beneficialOwnerKeys, handleUBOEdit}: CompanyOwnersListUBOProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const isLoading = reimbursementAccount?.isLoading ?? false;
    const requestorData = getSubStepValues(REQUESTOR_PERSONAL_INFO_KEYS, undefined, reimbursementAccount);
    const error = ErrorUtils.getLatestErrorMessage(reimbursementAccount);

    const extraBeneficialOwners =
        isAnyoneElseUBO &&
        reimbursementAccountDraft &&
        beneficialOwnerKeys.map((ownerKey) => {
            const beneficialOwnerData = getValuesForBeneficialOwner(ownerKey, reimbursementAccountDraft);

            return (
                <MenuItem
                    key={ownerKey}
                    title={`${beneficialOwnerData.firstName} ${beneficialOwnerData.lastName}`}
                    description={`${beneficialOwnerData.street}, ${beneficialOwnerData.city}, ${beneficialOwnerData.state} ${beneficialOwnerData.zipCode}`}
                    wrapperStyle={[styles.ph5]}
                    icon={Expensicons.FallbackAvatar}
                    iconType={CONST.ICON_TYPE_AVATAR}
                    onPress={() => {
                        handleUBOEdit(ownerKey);
                    }}
                    iconWidth={40}
                    iconHeight={40}
                    interactive
                    shouldShowRightIcon
                    displayInDefaultIconColor
                />
            );
        });

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <ScrollView
                    style={styles.pt0}
                    contentContainerStyle={[styles.flexGrow1, styles.ph0, safeAreaPaddingBottomStyle]}
                >
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('beneficialOwnerInfoStep.letsDoubleCheck')}</Text>
                    <Text style={[styles.p5, styles.textSupporting]}>{translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}</Text>
                    <View>
                        <Text style={[styles.textSupporting, styles.pv1, styles.ph5]}>{`${translate('beneficialOwnerInfoStep.owners')}:`}</Text>
                        {isUserUBO && (
                            <MenuItem
                                title={`${requestorData.firstName} ${requestorData.lastName}`}
                                description={`${requestorData.requestorAddressStreet}, ${requestorData.requestorAddressCity}, ${requestorData.requestorAddressState} ${requestorData.requestorAddressZipCode}`}
                                wrapperStyle={[styles.ph5]}
                                icon={Expensicons.FallbackAvatar}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                iconWidth={40}
                                iconHeight={40}
                                interactive={false}
                                shouldShowRightIcon={false}
                                displayInDefaultIconColor
                            />
                        )}
                        {extraBeneficialOwners}
                    </View>

                    <View style={[styles.ph5, styles.mtAuto]}>
                        {!!error && error.length > 0 && (
                            <DotIndicatorMessage
                                textStyles={[styles.formError]}
                                type="error"
                                messages={{error}}
                            />
                        )}
                    </View>
                    <Button
                        success
                        large
                        isLoading={isLoading}
                        isDisabled={isOffline}
                        style={[styles.w100, styles.mt2, styles.pb5, styles.ph5]}
                        onPress={handleUBOsConfirmation}
                        text={translate('common.confirm')}
                    />
                </ScrollView>
            )}
        </SafeAreaConsumer>
    );
}

CompanyOwnersListUBO.displayName = 'CompanyOwnersListUBO';

export default CompanyOwnersListUBO;
