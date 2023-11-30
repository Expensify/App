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
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Transaction default merchant value */
    defaultMerchant: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,
};

function EditRequestMerchantPage({defaultMerchant, onSubmit}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const merchantInputRef = useRef(null);

    const validate = useCallback((value) => {
        const errors = {};

        if (_.isEmpty(value.merchant)) {
            errors.merchant = 'common.error.fieldRequired';
        }

        return errors;
    }, []);

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
                        inputID="merchant"
                        name="merchant"
                        defaultValue={defaultMerchant}
                        label={translate('common.merchant')}
                        accessibilityLabel={translate('common.merchant')}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        ref={(e) => (merchantInputRef.current = e)}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

EditRequestMerchantPage.propTypes = propTypes;
EditRequestMerchantPage.displayName = 'EditRequestMerchantPage';

export default EditRequestMerchantPage;
