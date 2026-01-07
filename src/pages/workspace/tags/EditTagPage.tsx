import React, {useCallback} from 'react';
import {Keyboard} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {escapeTagName, getCleanedTagName, getTagListByOrderWeight} from '@libs/PolicyUtils';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {renamePolicyTag} from '@userActions/Policy/Tag';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceTagForm';

type EditTagPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_EDIT>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_TAGS.SETTINGS_TAG_EDIT>;

function EditTagPage({route}: EditTagPageProps) {
    const {backTo, policyID} = route.params;
    const policyData = usePolicyData(policyID);
    const {tags: policyTags} = policyData;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const currentTagName = getCleanedTagName(route.params.tagName);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_TAGS.SETTINGS_TAG_EDIT;

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM> = {};
            const tagName = values.tagName.trim();
            const escapedTagName = escapeTagName(values.tagName.trim());
            const {tags} = getTagListByOrderWeight(policyTags, route.params.orderWeight);
            if (!isRequiredFulfilled(tagName)) {
                errors.tagName = translate('workspace.tags.tagRequiredError');
            } else if (escapedTagName === '0') {
                errors.tagName = translate('workspace.tags.invalidTagNameError');
            } else if (tags?.[escapedTagName] && currentTagName !== tagName) {
                errors.tagName = translate('workspace.tags.existingTagError');
            } else if ([...tagName].length > CONST.API_TRANSACTION_TAG_MAX_LENGTH) {
                // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
                errors.tagName = translate('common.error.characterLimitExceedCounter', [...tagName].length, CONST.API_TRANSACTION_TAG_MAX_LENGTH);
            }

            return errors;
        },
        [policyTags, route.params.orderWeight, currentTagName, translate],
    );

    const editTag = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM>) => {
            const tagName = values.tagName.trim();
            // Do not call the API if the edited tag name is the same as the current tag name
            if (currentTagName !== tagName) {
                renamePolicyTag(policyData, {oldName: route.params.tagName, newName: values.tagName.trim()}, route.params.orderWeight);
            }
            Keyboard.dismiss();
            Navigation.goBack(
                isQuickSettingsFlow
                    ? ROUTES.SETTINGS_TAG_SETTINGS.getRoute(policyID, route.params.orderWeight, route.params.tagName, backTo)
                    : ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(policyID, route.params.orderWeight, route.params.tagName),
            );
        },
        [policyData, currentTagName, policyID, route.params.tagName, route.params.orderWeight, isQuickSettingsFlow, backTo],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="EditTagPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.tags.editTag')}
                    onBackButtonPress={() =>
                        Navigation.goBack(
                            isQuickSettingsFlow
                                ? ROUTES.SETTINGS_TAG_SETTINGS.getRoute(route?.params?.policyID, route.params.orderWeight, route.params.tagName, backTo)
                                : ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(route?.params?.policyID, route.params.orderWeight, route.params.tagName),
                        )
                    }
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_TAG_FORM}
                    onSubmit={editTag}
                    submitButtonText={translate('common.save')}
                    validate={validate}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        defaultValue={currentTagName}
                        label={translate('common.name')}
                        accessibilityLabel={translate('common.name')}
                        inputID={INPUT_IDS.TAG_NAME}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default EditTagPage;
