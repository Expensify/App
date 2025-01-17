import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import getValuesForBeneficialOwner from '@pages/ReimbursementAccount/NonUSD/utils/getValuesForBeneficialOwner';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type BeneficialOwnersListProps = {
    /** Method called when user confirms data */
    handleConfirmation: () => void;

    /** Method called when user presses on one of owners to edit its data */
    handleOwnerEdit: (value: string) => void;

    /** List of owner keys */
    ownerKeys: string[];
};

function BeneficialOwnersList({handleConfirmation, ownerKeys, handleOwnerEdit}: BeneficialOwnersListProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
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
                    icon={FallbackAvatar}
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
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <ScrollView
                    style={styles.pt0}
                    contentContainerStyle={[styles.flexGrow1, styles.ph0, safeAreaPaddingBottomStyle]}
                >
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('beneficialOwnerInfoStep.letsDoubleCheck')}</Text>
                    <Text style={[styles.p5, styles.textSupporting]}>{translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}</Text>
                    {areThereOwners && (
                        <View>
                            <Text style={[styles.textSupporting, styles.pv1, styles.ph5]}>{`${translate('beneficialOwnerInfoStep.owners')}:`}</Text>
                            {owners}
                        </View>
                    )}
                    <View style={[styles.mtAuto, styles.p5]}>
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
                            isDisabled={isOffline}
                            style={[styles.w100, styles.mt2]}
                            onPress={handleConfirmation}
                            text={translate('common.confirm')}
                        />
                    </View>
                </ScrollView>
            )}
        </SafeAreaConsumer>
    );
}

BeneficialOwnersList.displayName = 'BeneficialOwnersList';

export default BeneficialOwnersList;
