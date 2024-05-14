import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Policy from '@libs/actions/Policy';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PolicyTagNameForm';
import type * as OnyxTypes from '@src/types/onyx';

type WorkspaceEditTagsPageOnyxProps = {
    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagList>;
};

type WorkspaceEditTagsPageProps = WorkspaceEditTagsPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_EDIT>;

const validateTagName = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_TAG_NAME_FORM>) => {
    const errors: FormInputErrors<typeof ONYXKEYS.FORMS.POLICY_TAG_NAME_FORM> = {};
    if (!values[INPUT_IDS.POLICY_TAGS_NAME] && values[INPUT_IDS.POLICY_TAGS_NAME].trim() === '') {
        errors[INPUT_IDS.POLICY_TAGS_NAME] = 'common.error.fieldRequired';
    }
    return errors;
};

function WorkspaceEditTagsPage({route, policyTags}: WorkspaceEditTagsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const taglistName = useMemo(() => PolicyUtils.getTagListName(policyTags, route.params.orderWeight), [policyTags, route.params.orderWeight]);
    const {inputCallbackRef} = useAutoFocusInput();

    const updateTaglistName = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_TAG_NAME_FORM>) => {
            if (values[INPUT_IDS.POLICY_TAGS_NAME] !== taglistName) {
                Policy.renamePolicyTaglist(route.params.policyID, {oldName: taglistName, newName: values[INPUT_IDS.POLICY_TAGS_NAME]}, policyTags);
            }
            Navigation.goBack();
        },
        [policyTags, route.params.policyID, taglistName],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={WorkspaceEditTagsPage.displayName}
            >
                <HeaderWithBackButton title={translate(`workspace.tags.customTagName`)} />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.POLICY_TAG_NAME_FORM}
                    onSubmit={updateTaglistName}
                    validate={validateTagName}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.POLICY_TAGS_NAME}
                            label={translate(`workspace.tags.customTagName`)}
                            accessibilityLabel={translate(`workspace.tags.customTagName`)}
                            defaultValue={PolicyUtils.getCleanedTagName(taglistName)}
                            role={CONST.ROLE.PRESENTATION}
                            ref={inputCallbackRef}
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceEditTagsPage.displayName = 'WorkspaceEditTagsPage';

export default withOnyx<WorkspaceEditTagsPageProps, WorkspaceEditTagsPageOnyxProps>({
    policyTags: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${route.params.policyID}`,
    },
})(WorkspaceEditTagsPage);
