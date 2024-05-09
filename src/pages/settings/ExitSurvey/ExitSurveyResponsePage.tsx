import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
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
import * as NumberUtils from '@libs/NumberUtils';
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

type ExitSurveyResponsePageOnyxProps = {
    draftResponse: string;
};

type ExitSurveyResponsePageProps = ExitSurveyResponsePageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.EXIT_SURVEY.RESPONSE>;

function ExitSurveyResponsePage({draftResponse, route, navigation}: ExitSurveyResponsePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {keyboardHeight} = useKeyboardState();
    const {windowHeight} = useWindowDimensions();
    const {top: safeAreaInsetsTop} = useSafeAreaInsets();
    const {inputCallbackRef} = useAutoFocusInput();

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
        windowHeight -
            keyboardHeight -
            safeAreaInsetsTop -
            // Minus the height of HeaderWithBackButton
            variables.contentHeaderHeight -
            // Minus the top margins on the form
            formTopMarginsStyle.marginTop,
    );
    const responseInputMaxHeight = NumberUtils.roundDownToLargestMultiple(
        formMaxHeight -
            // Minus the height of the text component
            textStyle.lineHeight -
            // Minus the response input margins (multiplied by 2 to create the effect of margins on top and bottom).
            // marginBottom does not work in this case because the TextInput is in a ScrollView and will push the button beneath it out of view,
            // so it's maxHeight is what dictates space between it and the button.
            baseResponseInputContainerStyle.marginTop * 2 -
            // Minus the approximate size of a default button
            variables.componentSizeLarge -
            // Minus the vertical margins around the form button
            40,

        // Round down to the largest number of full lines
        styles.baseTextInput.lineHeight,
    );

    return (
        <ScreenWrapper testID={ExitSurveyResponsePage.displayName}>
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
                        errors[INPUT_IDS.RESPONSE] = 'common.error.fieldRequired';
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
                            maxAutoGrowHeight={responseInputMaxHeight}
                            maxLength={CONST.MAX_COMMENT_LENGTH}
                            ref={(el: AnimatedTextInputRef) => {
                                if (!el) {
                                    return;
                                }
                                updateMultilineInputRange(el);
                                inputCallbackRef(el);
                            }}
                            containerStyles={[baseResponseInputContainerStyle]}
                            shouldSaveDraft
                        />
                    </>
                )}
            </FormProvider>
        </ScreenWrapper>
    );
}

ExitSurveyResponsePage.displayName = 'ExitSurveyResponsePage';

export default withOnyx<ExitSurveyResponsePageProps, ExitSurveyResponsePageOnyxProps>({
    draftResponse: {
        key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT,
        selector: (value) => value?.[INPUT_IDS.RESPONSE] ?? '',
    },
})(ExitSurveyResponsePage);
