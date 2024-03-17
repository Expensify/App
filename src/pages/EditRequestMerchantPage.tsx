import {isEmpty} from 'lodash';
import React, {useCallback, useRef} from 'react';
import {TextInput, View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type Merchant = {
    merchant: string;
};

type EditRequestMerchantPageProps = {
    defaultMerchant?: string;
    isPolicyExpenseChat?: string;
    onSubmit: (merchant: Merchant) => void;
};

function EditRequestMerchantPage({defaultMerchant, onSubmit, isPolicyExpenseChat}: EditRequestMerchantPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const merchantInputRef = useRef<TextInput>(null);
    const isEmptyMerchant = defaultMerchant === '' || defaultMerchant === CONST.TRANSACTION.UNKNOWN_MERCHANT || defaultMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;

    const validate = useCallback(
        (value: Merchant) => {
            const errors = {merchant: ''};
            if (isEmpty(value.merchant) && value.merchant.trim() === '' && isPolicyExpenseChat) {
                errors.merchant = 'common.error.fieldRequired';
            }
            return errors;
        },
        [isPolicyExpenseChat],
    );

    return (
        // @ts-expect-error TODO: Remove once ScreenWrapper () is migrated
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            onEntryTransitionEnd={() => merchantInputRef.current?.focus()}
            testID={EditRequestMerchantPage.displayName}
        >
            <HeaderWithBackButton title={translate('common.merchant')}>
                {/** @ts-expect-error TODO: Remove once FormProvider () is migrated */}
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM}
                    onSubmit={onSubmit}
                    validate={validate}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            // @ts-expect-error TODO: Remove once InputWrapper () is migrated
                            InputComponent={TextInput}
                            inputID="merchant"
                            name="merchant"
                            defaultValue={isEmptyMerchant ? '' : defaultMerchant}
                            label={translate('common.merchant')}
                            accessibilityLabel={translate('common.merchant')}
                            role={CONST.ROLE.PRESENTATION}
                            ref={merchantInputRef}
                        />
                    </View>
                </FormProvider>
            </HeaderWithBackButton>
        </ScreenWrapper>
    );
}

EditRequestMerchantPage.displayName = 'EditRequestMerchantPage';

export default EditRequestMerchantPage;
