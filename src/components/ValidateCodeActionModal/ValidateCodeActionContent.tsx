import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
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
    sendValidateCode,
    isLoading,
    threeDotsMenuItems = [],
    onThreeDotsButtonPress = () => {},
    isPageModal = true,
}: ValidateCodeActionContentProps) {
    const themeStyles = useThemeStyles();
    const validateCodeFormRef = useRef<ValidateCodeFormHandle>(null);
    const [validateCodeAction, validateCodeActionMetadata] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const firstRenderRef = useRef(true);

    useEffect(() => {
        // Wait for Onyx to hydrate before deciding, otherwise on reload we read undefined and wrongly re-send
        if (isLoadingOnyxValue(validateCodeActionMetadata) || !firstRenderRef.current) {
            return;
        }
        firstRenderRef.current = false;

        // The magic code is account-level, so skip sending if one was already requested within the resend window (e.g. a page reload)
        const requestedAt = validateCodeAction?.lastValidateCodeRequestedAt;
        const sentRecently = !!requestedAt && Date.now() - requestedAt < CONST.REQUEST_CODE_DELAY * CONST.MILLISECONDS_PER_SECOND;
        if (sentRecently) {
            return;
        }

        sendValidateCode();
        // We only want to decide whether to send once Onyx has hydrated, so we depend on the hydration metadata rather than the value
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sendValidateCode, validateCodeActionMetadata]);

    const hide = useCallback(() => {
        clearError();
        onClose?.();
    }, [onClose, clearError]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            includePaddingTop
            shouldEnableMaxHeight
            testID="ValidateCodeActionContent"
            offlineIndicatorStyle={themeStyles.mtAuto}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={title}
                onBackButtonPress={hide}
                threeDotsMenuItems={threeDotsMenuItems}
                shouldShowThreeDotsButton={threeDotsMenuItems.length > 0}
                shouldOverlayDots
                onThreeDotsButtonPress={onThreeDotsButtonPress}
            />

            <ScrollView
                style={[themeStyles.w100, themeStyles.h100, themeStyles.flex1]}
                contentContainerStyle={themeStyles.flexGrow1}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[themeStyles.ph5, themeStyles.mt3, themeStyles.mb5, themeStyles.flex1]}>
                    <Text style={themeStyles.mb3}>{descriptionPrimary}</Text>
                    {!!descriptionSecondary && <Text style={themeStyles.mb3}>{descriptionSecondary}</Text>}
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
                        isInPageModal={isPageModal}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default ValidateCodeActionContent;
