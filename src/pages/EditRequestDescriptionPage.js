import {useFocusEffect} from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import * as Browser from '@libs/Browser';
import updateMultilineInputRange from '@libs/UpdateMultilineInputRange';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Transaction default description value */
    defaultDescription: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,
};

function EditRequestDescriptionPage({defaultDescription, onSubmit}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const descriptionInputRef = useRef(null);
    const focusTimeoutRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                if (descriptionInputRef.current) {
                    descriptionInputRef.current.focus();
                }
                return () => {
                    if (!focusTimeoutRef.current) {
                        return;
                    }
                    clearTimeout(focusTimeoutRef.current);
                };
            }, CONST.ANIMATED_TRANSITION);
        }, []),
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EditRequestDescriptionPage.displayName}
        >
            <HeaderWithBackButton title={translate('common.description')} />
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM}
                onSubmit={onSubmit}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapperWithRef
                        // Comment field does not have its modified counterpart
                        InputComponent={TextInput}
                        inputID="comment"
                        name="comment"
                        defaultValue={defaultDescription}
                        label={translate('moneyRequestConfirmationList.whatsItFor')}
                        accessibilityLabel={translate('moneyRequestConfirmationList.whatsItFor')}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        ref={(el) => {
                            if (!el) {
                                return;
                            }
                            descriptionInputRef.current = el;
                            updateMultilineInputRange(descriptionInputRef.current);
                        }}
                        autoGrowHeight
                        containerStyles={[styles.autoGrowHeightMultilineInput]}
                        inputStyle={[styles.verticalAlignTop]}
                        submitOnEnter={!Browser.isMobile()}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

EditRequestDescriptionPage.propTypes = propTypes;
EditRequestDescriptionPage.displayName = 'EditRequestDescriptionPage';

export default EditRequestDescriptionPage;
