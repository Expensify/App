import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {findPolicyTagEntryByParentFilter, getTagListByOrderWeight, hasAccountingConnections} from '@libs/PolicyUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {setPolicyTagGLCode} from '@userActions/Policy/Tag';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceTagForm';

import React, {useCallback} from 'react';

type DynamicEditTagGLCodePageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_TAG_GL_CODE>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_GL_CODE>;

function DynamicTagGLCodePage({route}: DynamicEditTagGLCodePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

    const tagName = route.params.tagName;
    const parentTagsFilter = route.params.parentTagsFilter;
    const orderWeight = Number(route.params.orderWeight);
    const {tags} = getTagListByOrderWeight(policyTags, orderWeight);
    const currentPolicyTagEntry = findPolicyTagEntryByParentFilter(tags, tagName, parentTagsFilter);
    const glCode = currentPolicyTagEntry?.tag?.['GL Code'];
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_TAGS.DYNAMIC_SETTINGS_TAG_GL_CODE;
    const backPath = useDynamicBackPath(isQuickSettingsFlow ? DYNAMIC_ROUTES.SETTINGS_TAG_GL_CODE.path : DYNAMIC_ROUTES.WORKSPACE_TAG_GL_CODE.path);

    const goBack = useCallback(() => {
        Navigation.goBack(isQuickSettingsFlow ? backPath : undefined);
    }, [backPath, isQuickSettingsFlow]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM> = {};
            const tagGLCode = values.glCode.trim();

            if (tagGLCode.length > CONST.MAX_LENGTH_256) {
                errors.glCode = translate('common.error.characterLimitExceedCounter', tagGLCode.length, CONST.MAX_LENGTH_256);
            }

            return errors;
        },
        [translate],
    );

    const editGLCode = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM>) => {
            const newGLCode = values.glCode.trim();
            if (newGLCode !== glCode) {
                setPolicyTagGLCode({
                    policyID,
                    tagName,
                    tagListIndex: orderWeight,
                    glCode: newGLCode,
                    policyTags,
                    parentTagsFilter,
                });
            }
            goBack();
        },
        [glCode, goBack, policyID, tagName, orderWeight, policyTags, parentTagsFilter],
    );

    if (!currentPolicyTagEntry) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
            shouldBeBlocked={hasAccountingConnections(policy)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="DynamicTagGLCodePage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.tags.glCode')}
                    onBackButtonPress={goBack}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_TAG_FORM}
                    validate={validate}
                    onSubmit={editGLCode}
                    submitButtonText={translate('common.save')}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <InputWrapper
                        ref={inputCallbackRef}
                        InputComponent={TextInput}
                        defaultValue={glCode}
                        label={translate('workspace.tags.glCode')}
                        accessibilityLabel={translate('workspace.tags.glCode')}
                        inputID={INPUT_IDS.TAG_GL_CODE}
                        role={CONST.ROLE.PRESENTATION}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicTagGLCodePage;
