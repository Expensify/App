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
import getValuesForBeneficialOwner from '@pages/ReimbursementAccount/NonUSD/utils/getValuesForBeneficialOwner';
import ONYXKEYS from '@src/ONYXKEYS';

type ConfirmationProps = SubStepProps & {ownerBeingModifiedID: string};

function Confirmation({onNext, onMove, ownerBeingModifiedID}: ConfirmationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const values = getValuesForBeneficialOwner(ownerBeingModifiedID, reimbursementAccountDraft);

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
                    <MenuItemWithTopDescription
                        description={translate('ownershipInfoStep.last4')}
                        title={values.ssnLast4}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(4);
                        }}
                    />
                    <MenuItemWithTopDescription
                        description={translate('ownershipInfoStep.address')}
                        title={`${values.street}, ${values.city}, ${values.state} ${values.zipCode}`}
                        shouldShowRightIcon
                        onPress={() => {
                            onMove(3);
                        }}
                    />
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
