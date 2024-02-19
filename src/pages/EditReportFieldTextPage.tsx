import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ThreeDotsMenuItem} from '@components/HeaderWithBackButton/types';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type EditReportFieldTextPageProps = {
    /** Value of the policy report field */
    fieldValue: string;

    /** Name of the policy report field */
    fieldName: string;

    /** ID of the policy report field */
    fieldID: string;

    /** Flag to indicate if the field can be left blank */
    isRequired: boolean;

    /** Three dot menu item options */
    menuItems?: ThreeDotsMenuItem[];

    /** Callback to fire when the Save button is pressed  */
    onSubmit: (form: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_FIELD_EDIT_FORM>) => void;
};

function EditReportFieldTextPage({fieldName, onSubmit, fieldValue, isRequired, fieldID, menuItems}: EditReportFieldTextPageProps) {
    const {windowWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const inputRef = useRef<AnimatedTextInputRef>(null);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_FIELD_EDIT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REPORT_FIELD_EDIT_FORM> = {};
            if (isRequired && values[fieldID].trim() === '') {
                errors[fieldID] = 'common.error.fieldRequired';
            }
            return errors;
        },
        [fieldID, isRequired],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            onEntryTransitionEnd={() => {
                inputRef.current?.focus();
            }}
            testID={EditReportFieldTextPage.displayName}
        >
            <HeaderWithBackButton
                title={fieldName}
                threeDotsMenuItems={menuItems}
                shouldShowThreeDotsButton={!!menuItems?.length}
                threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
            />
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.REPORT_FIELD_EDIT_FORM}
                onSubmit={onSubmit}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={fieldID}
                        name={fieldID}
                        defaultValue={fieldValue}
                        label={fieldName}
                        accessibilityLabel={fieldName}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputRef}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

EditReportFieldTextPage.displayName = 'EditReportFieldTextPage';

export default EditReportFieldTextPage;
