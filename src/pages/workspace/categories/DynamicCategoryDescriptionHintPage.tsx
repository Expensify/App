import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Parser from '@libs/Parser';
import {getParsedComment} from '@libs/ReportUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {setWorkspaceCategoryDescriptionHint} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceCategoryDescriptionHintForm';

type DynamicCategoryDescriptionHintPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_DESCRIPTION_HINT>;

function DynamicCategoryDescriptionHintPage({
    route: {
        params: {policyID, categoryName},
    },
}: DynamicCategoryDescriptionHintPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const categorySettingsBackPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_DESCRIPTION_HINT.path);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const decodedCategoryName = getDecodedCategoryName(categoryName);

    const {inputCallbackRef} = useAutoFocusInput();

    const commentHintDefaultValue = Parser.htmlToMarkdown(policyCategories?.[categoryName]?.commentHint ?? '');

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="DynamicCategoryDescriptionHintPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.categoryRules.descriptionHint')}
                    onBackButtonPress={() => Navigation.goBack(categorySettingsBackPath)}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.mh5]}
                    formID={ONYXKEYS.FORMS.WORKSPACE_CATEGORY_DESCRIPTION_HINT_FORM}
                    onSubmit={({commentHint}) => {
                        setWorkspaceCategoryDescriptionHint(policyID, categoryName, getParsedComment(commentHint), policyCategories);
                        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(categorySettingsBackPath));
                    }}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <View style={styles.mb4}>
                        <Text style={styles.pb5}>{translate('workspace.rules.categoryRules.descriptionHintDescription', decodedCategoryName)}</Text>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.COMMENT_HINT}
                            defaultValue={commentHintDefaultValue}
                            label={translate('workspace.rules.categoryRules.descriptionHintLabel')}
                            aria-label={translate('workspace.rules.categoryRules.descriptionHintLabel')}
                            ref={inputCallbackRef}
                            type="markdown"
                            autoGrowHeight
                            maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                            excludedMarkdownStyles={['mentionReport']}
                        />
                        <Text style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.rules.categoryRules.descriptionHintSubtitle')}</Text>
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicCategoryDescriptionHintPage;
