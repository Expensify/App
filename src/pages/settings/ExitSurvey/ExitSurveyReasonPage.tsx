import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {saveResponse} from '@libs/actions/ExitSurvey';
import StatusBar from '@libs/StatusBar';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ExitSurveyResponseForm} from '@src/types/form/ExitSurveyResponseForm';
import INPUT_IDS from '@src/types/form/ExitSurveyResponseForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import ExitSurveyOffline from './ExitSurveyOffline';

const draftResponseSelector = (value: OnyxEntry<ExitSurveyResponseForm>) => value?.[INPUT_IDS.RESPONSE];

function ExitSurveyReasonPage() {
    const {isOffline} = useNetwork();
    const [draftResponse = ''] = useOnyx(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT, {selector: draftResponseSelector, canBeMissing: true});
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {keyboardHeight} = useKeyboardState();
    const {windowHeight} = useWindowDimensions();
    const {inputCallbackRef} = useAutoFocusInput(true);

    // Device safe area top and bottom insets.
    // When the keyboard is shown, the bottom inset doesn't affect the height, so we take it out from the calculation.
    const {top: safeAreaInsetsTop} = useSafeAreaInsets();

    const submitForm = useCallback(() => {
        saveResponse(draftResponse);
        Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_CONFIRM.getRoute(ROUTES.SETTINGS_EXIT_SURVEY_REASON));
    }, [draftResponse]);
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER, submitForm);

    const formTopMarginsStyle = styles.mt3;
    const baseResponseInputContainerStyle = styles.mt3;
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
        <ScreenWrapper testID={ExitSurveyReasonPage.displayName}>
            <HeaderWithBackButton
                title={translate('exitSurvey.header')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM}
                style={[styles.flex1, styles.mh5, formTopMarginsStyle, StyleUtils.getMaximumHeight(formMaxHeight)]}
                onSubmit={submitForm}
                submitButtonText={translate('common.next')}
                shouldValidateOnBlur
                validate={(values: FormOnyxValues<typeof ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM>) => {
                    const errors: Errors = {};
                    const response = values[INPUT_IDS.RESPONSE] ?? '';
                    if (!response.trim()) {
                        errors[INPUT_IDS.RESPONSE] = translate('common.error.fieldRequired');
                    } else if (response.length > CONST.MAX_COMMENT_LENGTH) {
                        errors[INPUT_IDS.RESPONSE] = translate('common.error.characterLimitExceedCounter', {
                            length: response.length,
                            limit: CONST.MAX_COMMENT_LENGTH,
                        });
                    }
                    return errors;
                }}
                shouldHideFixErrorsAlert
                shouldValidateOnChange
            >
                {isOffline && <ExitSurveyOffline />}
                {!isOffline && (
                    <>
                        <Text style={styles.headerAnonymousFooter}>{translate('exitSurvey.reasonPage.title')}</Text>
                        <Text style={styles.mt2}>{translate('exitSurvey.reasonPage.subtitle')}</Text>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.RESPONSE}
                            label={translate(`exitSurvey.responsePlaceholder`)}
                            accessibilityLabel={translate(`exitSurvey.responsePlaceholder`)}
                            role={CONST.ROLE.PRESENTATION}
                            autoGrowHeight
                            maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                            ref={inputCallbackRef}
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

ExitSurveyReasonPage.displayName = 'ExitSurveyReasonPage';

export default ExitSurveyReasonPage;
