import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getCleanedTagName, getTagListName, isMultiLevelTags} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {renamePolicyTagList} from '@userActions/Policy/Tag';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PolicyTagNameForm';

type WorkspaceEditTagsPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_EDIT>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_EDIT>;

function WorkspaceEditTagsPage({route}: WorkspaceEditTagsPageProps) {
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${route?.params?.policyID}`, {canBeMissing: true});
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const tagListName = useMemo(() => getTagListName(policyTags, route.params.orderWeight), [policyTags, route.params.orderWeight]);
    const {inputCallbackRef} = useAutoFocusInput();
    const backTo = route.params.backTo;
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_EDIT;
    const isMultiLevelTagsEnabled = isMultiLevelTags(policyTags);

    const validateTagName = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_TAG_NAME_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.POLICY_TAG_NAME_FORM> = {};
            if (!values[INPUT_IDS.POLICY_TAGS_NAME] && values[INPUT_IDS.POLICY_TAGS_NAME].trim() === '') {
                errors[INPUT_IDS.POLICY_TAGS_NAME] = translate('common.error.fieldRequired');
            }
            if (values[INPUT_IDS.POLICY_TAGS_NAME]?.trim() === '0') {
                errors[INPUT_IDS.POLICY_TAGS_NAME] = translate('workspace.tags.invalidTagNameError');
            }
            if (policyTags && Object.values(policyTags).find((tag) => tag.orderWeight !== route.params.orderWeight && tag.name === values[INPUT_IDS.POLICY_TAGS_NAME])) {
                errors[INPUT_IDS.POLICY_TAGS_NAME] = translate('workspace.tags.existingTagError');
            }
            return errors;
        },
        [translate, policyTags, route.params.orderWeight],
    );

    const goBackToTagsSettings = useCallback(() => {
        if (isQuickSettingsFlow) {
            Navigation.goBack(backTo);
            return;
        }
        Navigation.goBack(
            isMultiLevelTagsEnabled
                ? ROUTES.WORKSPACE_TAG_LIST_VIEW.getRoute(route?.params?.policyID, route.params.orderWeight)
                : ROUTES.WORKSPACE_TAGS_SETTINGS.getRoute(route?.params?.policyID),
        );
    }, [isQuickSettingsFlow, isMultiLevelTagsEnabled, route.params?.policyID, route.params.orderWeight, backTo]);

    const updateTagListName = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_TAG_NAME_FORM>) => {
            if (values[INPUT_IDS.POLICY_TAGS_NAME] !== tagListName) {
                renamePolicyTagList(route.params.policyID, {oldName: tagListName, newName: values[INPUT_IDS.POLICY_TAGS_NAME]}, policyTags, route.params.orderWeight);
            }
            goBackToTagsSettings();
        },
        [tagListName, goBackToTagsSettings, route.params.policyID, route.params.orderWeight, policyTags],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="WorkspaceEditTagsPage"
            >
                <HeaderWithBackButton
                    title={translate(`workspace.tags.customTagName`)}
                    onBackButtonPress={goBackToTagsSettings}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.POLICY_TAG_NAME_FORM}
                    onSubmit={updateTagListName}
                    validate={validateTagName}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.POLICY_TAGS_NAME}
                            label={translate(`workspace.tags.customTagName`)}
                            accessibilityLabel={translate(`workspace.tags.customTagName`)}
                            defaultValue={getCleanedTagName(tagListName)}
                            role={CONST.ROLE.PRESENTATION}
                            ref={inputCallbackRef}
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceEditTagsPage;
