import PropTypes from 'prop-types';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import Form from '@components/Form';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Transaction default merchant value */
    defaultMerchant: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,
};

function EditRequestMerchantPage({defaultMerchant, onSubmit}) {
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
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM}
                onSubmit={onSubmit}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <TextInput
                        inputID="merchant"
                        name="merchant"
                        defaultValue={defaultMerchant}
                        label={translate('common.merchant')}
                        accessibilityLabel={translate('common.merchant')}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        ref={(e) => (merchantInputRef.current = e)}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

EditRequestMerchantPage.propTypes = propTypes;
EditRequestMerchantPage.displayName = 'EditRequestMerchantPage';

export default EditRequestMerchantPage;
