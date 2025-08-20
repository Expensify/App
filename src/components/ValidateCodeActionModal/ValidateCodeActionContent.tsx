import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useOnyx from '@hooks/useOnyx';
import useRunOnFirstRender from '@hooks/useRunOnFirstRender';
import useThemeStyles from '@hooks/useThemeStyles';
import useThreeDotsAnchorPosition from '@hooks/useThreeDotsAnchorPosition';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ValidateCodeActionContentProps} from './type';
import ValidateCodeForm from './ValidateCodeForm';
import type {ValidateCodeFormHandle} from './ValidateCodeForm/BaseValidateCodeForm';

function ValidateCodeActionContent({
    title,
    descriptionPrimary,
    descriptionSecondary,
    onClose,
    validateError,
    validatePendingAction,
    validateCodeActionErrorField,
    handleSubmitForm,
    clearError,
    footer,
    sendValidateCode,
    isLoading,
    threeDotsMenuItems = [],
    onThreeDotsButtonPress = () => {},
}: ValidateCodeActionContentProps) {
    const themeStyles = useThemeStyles();
    const validateCodeFormRef = useRef<ValidateCodeFormHandle>(null);
    const styles = useThemeStyles();
    const threeDotsAnchorPosition = useThreeDotsAnchorPosition(styles.threeDotsPopoverOffset);
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});

    useRunOnFirstRender(sendValidateCode, validateCodeAction?.validateCodeSent);

    const hide = useCallback(() => {
        clearError();
        onClose?.();
    }, [onClose, clearError]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            includePaddingTop
            shouldEnableMaxHeight
            testID={ValidateCodeActionContent.displayName}
            offlineIndicatorStyle={themeStyles.mtAuto}
        >
            <HeaderWithBackButton
                title={title}
                onBackButtonPress={hide}
                threeDotsMenuItems={threeDotsMenuItems}
                shouldShowThreeDotsButton={threeDotsMenuItems.length > 0}
                shouldOverlayDots
                threeDotsAnchorPosition={threeDotsAnchorPosition}
                onThreeDotsButtonPress={onThreeDotsButtonPress}
            />

            <ScrollView
                style={[styles.w100, styles.h100, styles.flex1]}
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[themeStyles.ph5, themeStyles.mt3, themeStyles.mb5, themeStyles.flex1]}>
                    <Text style={[themeStyles.mb3]}>{descriptionPrimary}</Text>
                    {!!descriptionSecondary && <Text style={[themeStyles.mb3]}>{descriptionSecondary}</Text>}
                    <ValidateCodeForm
                        isLoading={isLoading}
                        validatePendingAction={validatePendingAction}
                        validateCodeActionErrorField={validateCodeActionErrorField}
                        validateError={validateError}
                        handleSubmitForm={handleSubmitForm}
                        sendValidateCode={sendValidateCode}
                        clearError={clearError}
                        buttonStyles={[themeStyles.justifyContentEnd, themeStyles.flex1]}
                        ref={validateCodeFormRef}
                    />
                </View>
            </ScrollView>
            {footer?.()}
        </ScreenWrapper>
    );
}

ValidateCodeActionContent.displayName = 'ValidateCodeActionContent';

export default ValidateCodeActionContent;
