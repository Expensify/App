import type {StackScreenProps} from '@react-navigation/stack';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback} from 'react';
import {Keyboard} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Tag from '@userActions/Policy/Tag';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceTagForm';

type EditTagPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_EDIT>;

function EditTagPage({route}: EditTagPageProps) {
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${route?.params?.policyID}`);
    const backTo = route.params.backTo;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const currentTagName = PolicyUtils.getCleanedTagName(route.params.tagName);
    const isQuickSettingsFlow = !isEmpty(backTo);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM> = {};
            const tagName = values.tagName.trim();
            const escapedTagName = PolicyUtils.escapeTagName(values.tagName.trim());
            const {tags} = PolicyUtils.getTagList(policyTags, route.params.orderWeight);
            if (!ValidationUtils.isRequiredFulfilled(tagName)) {
                errors.tagName = translate('workspace.tags.tagRequiredError');
            } else if (escapedTagName === '0') {
                errors.tagName = translate('workspace.tags.invalidTagNameError');
            } else if (tags?.[escapedTagName] && currentTagName !== tagName) {
                errors.tagName = translate('workspace.tags.existingTagError');
            }

            return errors;
        },
        [policyTags, route.params.orderWeight, currentTagName, translate, backTo],
    );

    const editTag = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM>) => {
            const tagName = values.tagName.trim();
            // Do not call the API if the edited tag name is the same as the current tag name
            if (currentTagName !== tagName) {
                Tag.renamePolicyTag(route.params.policyID, {oldName: route.params.tagName, newName: values.tagName.trim()}, route.params.orderWeight);
            }
            Keyboard.dismiss();
            Navigation.goBack(
                isQuickSettingsFlow
                    ? ROUTES.SETTINGS_TAG_SETTINGS.getRoute(route?.params?.policyID, route.params.orderWeight, route.params.tagName, backTo)
                    : ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(route?.params?.policyID, route.params.orderWeight, route.params.tagName),
            );
        },
        [currentTagName, route.params.policyID, route.params.tagName, route.params.orderWeight, isQuickSettingsFlow],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={EditTagPage.displayName}
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
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        maxLength={CONST.TAG_NAME_LIMIT}
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

EditTagPage.displayName = 'EditTagPage';

export default EditTagPage;
