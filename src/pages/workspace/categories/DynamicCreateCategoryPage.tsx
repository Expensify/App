import React, {useCallback} from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {createPolicyCategory} from '@libs/actions/Policy/Category';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasTags} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import CategoryForm from './CategoryForm';

type DynamicCreateCategoryPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_CREATE>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_CATEGORIES.DYNAMIC_SETTINGS_CATEGORY_CREATE>;

function DynamicCreateCategoryPage({route}: DynamicCreateCategoryPageProps) {
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params.policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${route.params.policyID}`);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_CATEGORIES.DYNAMIC_SETTINGS_CATEGORY_CREATE;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.SETTINGS_CATEGORY_CREATE.path);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {
        taskReport: setupCategoryTaskReport,
        taskParentReport: setupCategoryTaskParentReport,
        isOnboardingTaskParentReportArchived: isSetupCategoryTaskParentReportArchived,
        hasOutstandingChildTask,
        parentReportAction,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES);

    const {
        taskReport: setupCategoriesAndTagsTaskReport,
        taskParentReport: setupCategoriesAndTagsTaskParentReport,
        isOnboardingTaskParentReportArchived: isSetupCategoriesAndTagsTaskParentReportArchived,
        hasOutstandingChildTask: setupCategoriesAndTagsHasOutstandingChildTask,
        parentReportAction: setupCategoriesAndTagsParentReportAction,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES_AND_TAGS);

    const policyHasTags = hasTags(policyTags);

    const createCategory = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            createPolicyCategory({
                policyID: route.params.policyID,
                categoryName: values.categoryName.trim(),
                isSetupCategoriesTaskParentReportArchived: isSetupCategoryTaskParentReportArchived,
                setupCategoryTaskReport,
                setupCategoryTaskParentReport,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                hasOutstandingChildTask,
                parentReportAction,
                setupCategoriesAndTagsTaskReport,
                setupCategoriesAndTagsTaskParentReport,
                isSetupCategoriesAndTagsTaskParentReportArchived,
                setupCategoriesAndTagsHasOutstandingChildTask,
                setupCategoriesAndTagsParentReportAction,
                policyHasTags,
            });
            Navigation.goBack(isQuickSettingsFlow ? backPath : undefined);
        },
        [
            route.params.policyID,
            isSetupCategoryTaskParentReportArchived,
            setupCategoryTaskReport,
            setupCategoryTaskParentReport,
            currentUserPersonalDetails.accountID,
            isQuickSettingsFlow,
            backPath,
            hasOutstandingChildTask,
            parentReportAction,
            setupCategoriesAndTagsTaskReport,
            setupCategoriesAndTagsTaskParentReport,
            isSetupCategoriesAndTagsTaskParentReportArchived,
            setupCategoriesAndTagsHasOutstandingChildTask,
            setupCategoriesAndTagsParentReportAction,
            policyHasTags,
        ],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="DynamicCreateCategoryPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.categories.addCategory')}
                    onBackButtonPress={() => Navigation.goBack(isQuickSettingsFlow ? backPath : undefined)}
                />
                <CategoryForm
                    onSubmit={createCategory}
                    policyCategories={policyCategories}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicCreateCategoryPage;
