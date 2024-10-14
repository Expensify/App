import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import StatusBar from '@libs/StatusBar';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import * as ExitSurvey from '@userActions/ExitSurvey';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/ExitSurveyResponseForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import ExitSurveyOffline from './ExitSurveyOffline';

type ExitSurveyResponsePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.EXIT_SURVEY.RESPONSE>;

function ExitSurveyResponsePage({route, navigation}: ExitSurveyResponsePageProps) {
    const [draftResponse = ''] = useOnyx(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT, {selector: (value) => value?.[INPUT_IDS.RESPONSE]});
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {keyboardHeight} = useKeyboardState();
    const {windowHeight} = useWindowDimensions();
    const {inputCallbackRef, inputRef} = useAutoFocusInput();

    // Device safe area top and bottom insets.
    // When the keyboard is shown, the bottom inset doesn't affect the height, so we take it out from the calculation.
    const {top: safeAreaInsetsTop} = useSafeAreaInsets();

    const {reason, backTo} = route.params;
    const {isOffline} = useNetwork({
        onReconnect: () => {
            navigation.setParams({
                backTo: ROUTES.SETTINGS_EXIT_SURVEY_REASON,
            });
        },
    });
    useEffect(() => {
        if (!isOffline || backTo === ROUTES.SETTINGS) {
            return;
        }
        navigation.setParams({backTo: ROUTES.SETTINGS});
    }, [backTo, isOffline, navigation]);

    const submitForm = useCallback(() => {
        ExitSurvey.saveResponse(draftResponse);
        Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_CONFIRM.getRoute(ROUTES.SETTINGS_EXIT_SURVEY_RESPONSE.route));
    }, [draftResponse]);
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER, submitForm);

    const formTopMarginsStyle = styles.mt3;
    const textStyle = styles.headerAnonymousFooter;
    const baseResponseInputContainerStyle = styles.mt7;
    const formMaxHeight = Math.floor(
        // windowHeight doesn't include status bar height in Android, so we need to add it here.
        // StatusBar.currentHeight is only available on Android.
        windowHeight +
            (StatusBar.currentHeight ?? 0) -
            keyboardHeight -
            safeAreaInsetsTop -
            // Minus the height of HeaderWithBackButton
            variables.contentHeaderHeight -
            // Minus the top margins on the form
            formTopMarginsStyle.marginTop,
    );

    return (
        <ScreenWrapper
            testID={ExitSurveyResponsePage.displayName}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('exitSurvey.header')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM}
                style={[styles.flex1, styles.mh5, formTopMarginsStyle, StyleUtils.getMaximumHeight(formMaxHeight)]}
                onSubmit={submitForm}
                submitButtonText={translate('common.next')}
                validate={() => {
                    const errors: Errors = {};
                    if (!draftResponse?.trim()) {
                        errors[INPUT_IDS.RESPONSE] = translate('common.error.fieldRequired');
                    }
                    return errors;
                }}
                shouldValidateOnBlur
                shouldValidateOnChange
            >
                {isOffline && <ExitSurveyOffline />}
                {!isOffline && (
                    <>
                        <Text style={textStyle}>{translate(`exitSurvey.prompts.${reason}`)}</Text>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.RESPONSE}
                            label={translate(`exitSurvey.responsePlaceholder`)}
                            accessibilityLabel={translate(`exitSurvey.responsePlaceholder`)}
                            role={CONST.ROLE.PRESENTATION}
                            autoGrowHeight
                            maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                            maxLength={CONST.MAX_COMMENT_LENGTH}
                            ref={(el: AnimatedTextInputRef) => {
                                if (!el) {
                                    return;
                                }
                                if (!inputRef.current) {
                                    updateMultilineInputRange(el);
                                }
                                inputCallbackRef(el);
                            }}
                            containerStyles={[baseResponseInputContainerStyle]}
                            shouldSaveDraft
                            shouldSubmitForm
                        />
                    </>
                )}
            </FormProvider>
        </ScreenWrapper>
    );
}

ExitSurveyResponsePage.displayName = 'ExitSurveyResponsePage';

export default ExitSurveyResponsePage;
