import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getTagList, hasAccountingConnections} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setPolicyTagGLCode} from '@userActions/Policy/Tag';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceTagForm';

type EditTagGLCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_GL_CODE>;

function TagGLCodePage({route}: EditTagGLCodePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const backTo = route.params.backTo;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

    const tagName = route.params.tagName;
    const orderWeight = route.params.orderWeight;
    const {tags} = getTagList(policyTags, orderWeight);
    const glCode = tags?.[route.params.tagName]?.['GL Code'];
    const isQuickSettingsFlow = !!backTo;

    const goBack = useCallback(() => {
        Navigation.goBack(
            isQuickSettingsFlow ? ROUTES.SETTINGS_TAG_SETTINGS.getRoute(policyID, orderWeight, tagName, backTo) : ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(policyID, orderWeight, tagName),
        );
    }, [orderWeight, policyID, tagName, isQuickSettingsFlow, backTo]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM> = {};
            const tagGLCode = values.glCode.trim();

            if (tagGLCode.length > CONST.MAX_LENGTH_256) {
                errors.glCode = translate('common.error.characterLimitExceedCounter', {length: tagGLCode.length, limit: CONST.MAX_LENGTH_256});
            }

            return errors;
        },
        [translate],
    );

    const editGLCode = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM>) => {
            const newGLCode = values.glCode.trim();
            if (newGLCode !== glCode) {
                setPolicyTagGLCode(policyID, tagName, orderWeight, newGLCode);
            }
            goBack();
        },
        [glCode, policyID, tagName, orderWeight, goBack],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
            shouldBeBlocked={hasAccountingConnections(policy)}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                style={[styles.defaultModalContainer]}
                testID={TagGLCodePage.displayName}
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

TagGLCodePage.displayName = 'TagGLCodePage';

export default TagGLCodePage;
