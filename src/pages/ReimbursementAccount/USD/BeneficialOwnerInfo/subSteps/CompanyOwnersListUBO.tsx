import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
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
    const {paddingBottom: safeAreaInsetPaddingBottom} = useSafeAreaPaddings();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const isLoading = reimbursementAccount?.isLoading ?? false;
    const requestorData = getSubStepValues(REQUESTOR_PERSONAL_INFO_KEYS, undefined, reimbursementAccount);
    const error = getLatestErrorMessage(reimbursementAccount);

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
                    icon={FallbackAvatar}
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
        <ScrollView
            style={styles.pt0}
            contentContainerStyle={[styles.flexGrow1, {paddingBottom: safeAreaInsetPaddingBottom + styles.pb5.paddingBottom}]}
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
                        icon={FallbackAvatar}
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

            <View style={[styles.ph5, styles.mt5, styles.flexGrow1, styles.justifyContentEnd]}>
                {!!error && error.length > 0 && (
                    <DotIndicatorMessage
                        textStyles={[styles.formError]}
                        type="error"
                        messages={{error}}
                    />
                )}
                <Button
                    success
                    large
                    isLoading={isLoading}
                    isDisabled={isOffline}
                    style={[styles.w100]}
                    onPress={handleUBOsConfirmation}
                    text={translate('common.confirm')}
                />
            </View>
        </ScrollView>
    );
}

CompanyOwnersListUBO.displayName = 'CompanyOwnersListUBO';

export default CompanyOwnersListUBO;
