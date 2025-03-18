import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Option} from '@libs/searchOptions';
import type {CustomSubStepProps} from '@pages/settings/Wallet/InternationalDepositAccount/types';
import {setDraftValues} from '@userActions/FormActions';
import Text from '@src/components/Text';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';

function AccountType({isEditing, onNext, formValues, fieldsMap}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [currentAccountType, setCurrentAccountType] = useState(formValues[CONST.CORPAY_FIELDS.ACCOUNT_TYPE_KEY]);
    const [error, setError] = useState<TranslationPaths | undefined>(undefined);

    const fieldData = fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE]?.[CONST.CORPAY_FIELDS.ACCOUNT_TYPE_KEY] ?? {};

    const onAccountTypeSelected = useCallback(() => {
        setError(undefined);
        if (isEditing && formValues[CONST.CORPAY_FIELDS.ACCOUNT_TYPE_KEY] === currentAccountType) {
            onNext();
            return;
        }
        if (fieldData.isRequired && !currentAccountType) {
            setError('common.error.pleaseSelectOne');
            return;
        }
        setDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM, {[CONST.CORPAY_FIELDS.ACCOUNT_TYPE_KEY]: currentAccountType});
        onNext();
    }, [currentAccountType, fieldData.isRequired, formValues, isEditing, onNext]);

    const onSelectionChange = useCallback(
        (country: Option) => {
            if (!isEditing) {
                setDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM, {[CONST.CORPAY_FIELDS.ACCOUNT_TYPE_KEY]: country.value});
            }
            setCurrentAccountType(country.value);
        },
        [isEditing],
    );

    const options = useMemo(
        () =>
            (fieldData.valueSet ?? []).map((item) => {
                return {
                    value: item.id,
                    keyForList: item.id,
                    text: item.text,
                    isSelected: currentAccountType === item.id,
                    searchValue: item.text,
                };
            }),
        [fieldData.valueSet, currentAccountType],
    );

    const button = useMemo(() => {
        const buttonText = isEditing ? translate('common.confirm') : translate('common.next');
        return (
            <FormAlertWithSubmitButton
                message={error ? translate(error) : ''}
                isAlertVisible={!!error}
                buttonText={buttonText}
                onSubmit={onAccountTypeSelected}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                enabledWhenOffline
            />
        );
    }, [error, isEditing, onAccountTypeSelected, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate]);

    return (
        <>
            <View style={styles.ph5}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('addPersonalBankAccount.accountTypeStepHeader')}</Text>
            </View>
            <SelectionList
                sections={[{data: options}]}
                onSelectRow={onSelectionChange}
                ListItem={RadioListItem}
                initiallyFocusedOptionKey={currentAccountType}
                footerContent={button}
                shouldSingleExecuteRowSelect
                shouldStopPropagation
                shouldUseDynamicMaxToRenderPerBatch
                shouldUpdateFocusedIndex
            />
        </>
    );
}

AccountType.displayName = 'AccountType';

export default AccountType;
