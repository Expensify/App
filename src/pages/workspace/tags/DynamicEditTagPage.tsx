import AutoGrowHeightInputContainer from '@components/AutoGrowHeightInputContainer';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getCleanedTagName, getTagListByOrderWeight} from '@libs/PolicyUtils';
import StringUtils from '@libs/StringUtils';
import {getTagNameError, getTagNameErrorMessage} from '@libs/TagUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {renamePolicyTag} from '@userActions/Policy/Tag';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceTagForm';

import React from 'react';
import {Keyboard} from 'react-native';

type DynamicEditTagPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_TAG_EDIT>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_EDIT>;

function DynamicEditTagPage({route}: DynamicEditTagPageProps) {
    const {policyID} = route.params;
    const orderWeight = Number(route.params.orderWeight);
    const policyData = usePolicyData(policyID);
    const {tags: policyTags} = policyData;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);
    const {inputCallbackRef} = useAutoFocusInput(true);
    const currentTagName = getCleanedTagName(route.params.tagName);
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_EDIT;
    const backPath = useDynamicBackPath(isQuickSettingsFlow ? DYNAMIC_ROUTES.SETTINGS_TAG_EDIT.path : DYNAMIC_ROUTES.WORKSPACE_TAG_EDIT.path);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM> = {};
        const {tags} = getTagListByOrderWeight(policyTags, orderWeight);
        const error = getTagNameError(tags, values.tagName, currentTagName);

        if (error) {
            errors.tagName = getTagNameErrorMessage(translate, error, values.tagName);
        }

        return errors;
    };

    const editTag = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM>) => {
        const tagName = StringUtils.sanitizeName(values.tagName);
        // Do not call the API if the edited tag name is the same as the current tag name
        if (currentTagName !== tagName) {
            renamePolicyTag(policyData, {oldName: route.params.tagName, newName: tagName}, orderWeight, isVendorMatchingBetaEnabled);
        }
        Keyboard.dismiss();
        Navigation.goBack(backPath);
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="DynamicEditTagPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.tags.editTag')}
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                <FormProvider
                    shouldConstrainWebContentHeight
                    submitFlexEnabled={false}
                    formID={ONYXKEYS.FORMS.WORKSPACE_TAG_FORM}
                    onSubmit={(values) => editTag({...values, [INPUT_IDS.TAG_NAME]: StringUtils.lineBreaksToSpaces(values[INPUT_IDS.TAG_NAME])})}
                    submitButtonText={translate('common.save')}
                    validate={(values) => validate({...values, [INPUT_IDS.TAG_NAME]: StringUtils.lineBreaksToSpaces(values[INPUT_IDS.TAG_NAME])})}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                    shouldUseStrictHtmlTagValidation
                >
                    <AutoGrowHeightInputContainer shouldKeepMinimumHeight>
                        {(maxAutoGrowHeight) => (
                            <InputWrapper
                                InputComponent={TextInput}
                                defaultValue={currentTagName}
                                label={translate('common.name')}
                                accessibilityLabel={translate('common.name')}
                                inputID={INPUT_IDS.TAG_NAME}
                                role={CONST.ROLE.PRESENTATION}
                                ref={inputCallbackRef}
                                maxAutoGrowHeight={maxAutoGrowHeight}
                                autoGrowSingleLine
                            />
                        )}
                    </AutoGrowHeightInputContainer>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicEditTagPage;
