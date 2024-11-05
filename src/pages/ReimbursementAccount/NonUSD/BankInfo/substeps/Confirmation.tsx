import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {BankInfoSubStepProps} from '@pages/ReimbursementAccount/NonUSD/BankInfo/types';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';

function Confirmation({onNext, onMove, corpayFields}: BankInfoSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const inputKeys = useMemo(() => {
        const keys: Record<string, keyof ReimbursementAccountForm> = {};
        corpayFields.forEach((field) => {
            keys[field.id] = field.id;
        });
        return keys;
    }, [corpayFields]);
    const values = useMemo(() => getSubstepValues(inputKeys, reimbursementAccountDraft, reimbursementAccount), [inputKeys, reimbursementAccount, reimbursementAccountDraft]);

    const items = useMemo(
        () =>
            corpayFields.map((field) => {
                return (
                    <MenuItemWithTopDescription
                        description={field.label}
                        title={values[field.id] ? String(values[field.id]) : ''}
                        shouldShowRightIcon
                        onPress={() => {
                            if (field.id.includes(CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX)) {
                                onMove(1);
                                return;
                            }

                            onMove(0);
                        }}
                        key={field.id}
                    />
                );
            }),
        [corpayFields, onMove, values],
    );

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <ScrollView
                    style={styles.pt0}
                    contentContainerStyle={[styles.flexGrow1, safeAreaPaddingBottomStyle]}
                >
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('bankInfoStep.letsDoubleCheck')}</Text>
                    <Text style={[styles.mutedTextLabel, styles.ph5, styles.mb5]}>{translate('bankInfoStep.thisBankAccount')}</Text>
                    {items}
                    <View style={[styles.p5, styles.flexGrow1, styles.justifyContentEnd]}>
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
