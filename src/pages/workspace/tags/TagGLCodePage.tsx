import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Tag from '@userActions/Policy/Tag';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceTagForm';

type EditTagGLCodePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_GL_CODE>;

function TagGLCodePage({route}: EditTagGLCodePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const policy = usePolicy(route.params.policyID);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${route?.params?.policyID}`);

    const tagName = route.params.tagName;
    const orderWeight = route.params.orderWeight;
    const {tags} = PolicyUtils.getTagList(policyTags, orderWeight);
    const glCode = tags?.[route.params.tagName]?.['GL Code'];

    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(route.params.policyID, orderWeight, tagName));
    }, [orderWeight, route.params.policyID, tagName]);

    const editGLCode = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAG_FORM>) => {
            const newGLCode = values.glCode.trim();
            if (newGLCode !== glCode) {
                Tag.setPolicyTagGLCode(route.params.policyID, tagName, orderWeight, newGLCode);
            }
            goBack();
        },
        [glCode, route.params.policyID, tagName, orderWeight, goBack],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
            shouldBeBlocked={PolicyUtils.hasAccountingConnections(policy)}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
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
                        maxLength={CONST.MAX_LENGTH_256}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

TagGLCodePage.displayName = 'TagGLCodePage';

export default TagGLCodePage;
