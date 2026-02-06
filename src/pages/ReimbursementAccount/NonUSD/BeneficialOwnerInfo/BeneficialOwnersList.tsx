import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MenuItem from '@components/MenuItem';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import getValuesForBeneficialOwner from '@pages/ReimbursementAccount/NonUSD/utils/getValuesForBeneficialOwner';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type BeneficialOwnersListProps = {
    /** Method called when user confirms data */
    handleConfirmation: (value: {anyIndividualOwn25PercentOrMore?: boolean}) => void;

    /** Method called when user presses on one of owners to edit its data */
    handleOwnerEdit: (value: string) => void;

    /** List of owner keys */
    ownerKeys: string[];
};

function BeneficialOwnersList({handleConfirmation, ownerKeys, handleOwnerEdit}: BeneficialOwnersListProps) {
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {paddingBottom: safeAreaInsetPaddingBottom} = useSafeAreaPaddings();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: false});
    const error = getLatestErrorMessage(reimbursementAccount);

    const owners =
        reimbursementAccountDraft &&
        ownerKeys.map((ownerKey) => {
            const ownerData = getValuesForBeneficialOwner(ownerKey, reimbursementAccountDraft);

            return (
                <MenuItem
                    key={ownerKey}
                    title={`${ownerData.firstName} ${ownerData.lastName}`}
                    description={`${ownerData.street}, ${ownerData.city}, ${ownerData.state} ${ownerData.zipCode}`}
                    wrapperStyle={[styles.ph5]}
                    icon={icons.FallbackAvatar}
                    iconType={CONST.ICON_TYPE_AVATAR}
                    onPress={() => {
                        handleOwnerEdit(ownerKey);
                    }}
                    iconWidth={40}
                    iconHeight={40}
                    interactive
                    shouldShowRightIcon
                    displayInDefaultIconColor
                />
            );
        });

    const areThereOwners = owners !== undefined && owners?.length > 0;

    return (
        <ScrollView
            style={styles.pt0}
            contentContainerStyle={[styles.flexGrow1, {paddingBottom: safeAreaInsetPaddingBottom + styles.pb5.paddingBottom}]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('beneficialOwnerInfoStep.letsDoubleCheck')}</Text>
            <Text style={[styles.p5, styles.textSupporting]}>{translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}</Text>
            {areThereOwners && (
                <View>
                    <Text style={[styles.textSupporting, styles.pv1, styles.ph5]}>{`${translate('beneficialOwnerInfoStep.owners')}:`}</Text>
                    {owners}
                </View>
            )}
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
                    isLoading={reimbursementAccount?.isSavingCorpayOnboardingBeneficialOwnersFields}
                    isDisabled={isOffline}
                    style={styles.w100}
                    onPress={() => {
                        handleConfirmation({anyIndividualOwn25PercentOrMore: true});
                    }}
                    text={translate('common.confirm')}
                />
            </View>
        </ScrollView>
    );
}

export default BeneficialOwnersList;
