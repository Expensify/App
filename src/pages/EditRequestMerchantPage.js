import PropTypes from 'prop-types';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/MoneyRequestMerchantForm';

const propTypes = {
    /** Transaction default merchant value */
    defaultMerchant: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,

    /** Boolean to enable validation */
    isPolicyExpenseChat: PropTypes.bool,
};

const defaultProps = {
    isPolicyExpenseChat: false,
};

function EditRequestMerchantPage({defaultMerchant, onSubmit, isPolicyExpenseChat}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const merchantInputRef = useRef(null);
    const isEmptyMerchant = defaultMerchant === '' || defaultMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;

    const validate = useCallback(
        (value) => {
            const errors = {};
            if (_.isEmpty(value.merchant) && value.merchant.trim() === '' && isPolicyExpenseChat) {
                errors.merchant = 'common.error.fieldRequired';
            }
            return errors;
        },
        [isPolicyExpenseChat],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            onEntryTransitionEnd={() => merchantInputRef.current && merchantInputRef.current.focus()}
            testID={EditRequestMerchantPage.displayName}
        >
            <HeaderWithBackButton title={translate('common.merchant')} />
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
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.MERCHANT}
                        name={INPUT_IDS.MERCHANT}
                        defaultValue={isEmptyMerchant ? '' : defaultMerchant}
                        label={translate('common.merchant')}
                        accessibilityLabel={translate('common.merchant')}
                        role={CONST.ROLE.PRESENTATION}
                        ref={(e) => (merchantInputRef.current = e)}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

EditRequestMerchantPage.propTypes = propTypes;
EditRequestMerchantPage.defaultProps = defaultProps;
EditRequestMerchantPage.displayName = 'EditRequestMerchantPage';

export default EditRequestMerchantPage;
