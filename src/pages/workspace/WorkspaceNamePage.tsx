import React, {useCallback} from 'react';
import {Keyboard, View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {OnyxFormValuesFields} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

type Props = WithPolicyProps;

function WorkspaceNamePage({policy}: Props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const submit = useCallback(
        (values: OnyxFormValuesFields<typeof ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM>) => {
            if (!policy || policy.isPolicyUpdating) {
                return;
            }

            Policy.updateGeneralSettings(policy.id, values.name.trim(), policy.outputCurrency);
            Keyboard.dismiss();
            Navigation.goBack();
        },
        [policy],
    );

    const validate = useCallback((values: OnyxFormValuesFields<typeof ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM>) => {
        const errors: Record<string, string> = {};
        const name = values.name.trim();

        if (!ValidationUtils.isRequiredFulfilled(name)) {
            errors.name = 'workspace.editor.nameIsRequiredError';
        } else if ([...name].length > CONST.WORKSPACE_NAME_CHARACTER_LIMIT) {
            // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
            // code units.
            errors.name = 'workspace.editor.nameIsTooLongError';
        }

        return errors;
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={WorkspaceNamePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.editor.nameInputLabel')}
                onBackButtonPress={() => Navigation.goBack()}
            />

            <FormProvider
                formID={ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM}
                submitButtonText={translate('workspace.editor.save')}
                style={[styles.flexGrow1, styles.ph5]}
                scrollContextEnabled
                validate={validate}
                onSubmit={submit}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        role={CONST.ROLE.PRESENTATION}
                        inputID="name"
                        label={translate('workspace.editor.nameInputLabel')}
                        accessibilityLabel={translate('workspace.editor.nameInputLabel')}
                        defaultValue={policy?.name}
                        maxLength={CONST.WORKSPACE_NAME_CHARACTER_LIMIT}
                        spellCheck={false}
                        autoFocus
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

WorkspaceNamePage.displayName = 'WorkspaceNamePage';

export default withPolicy(WorkspaceNamePage);
