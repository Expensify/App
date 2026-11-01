/**
 * Creates a category on the workspace while an admin is categorizing an expense, and puts it on the expense. Used by the
 * add-category page and by the create row a category picker shows when a search has no results. A disabled category
 * with the same name is turned back on instead of created, because creating it again would fail as a duplicate. The
 * write onto the expense goes through `updateCategory` from `useUpdateTransactionCategory`, so it lands in the same
 * store a normal pick does.
 */
import {createPolicyCategory, setWorkspaceCategoryEnabled} from '@libs/actions/Policy/Category';
import {getDisabledCategoryKey} from '@libs/CategoryUtils';
import {hasTags} from '@libs/PolicyUtils';
import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnboardingTaskInformation from './useOnboardingTaskInformation';
import usePermissions from './usePermissions';
import usePolicyData from './usePolicyData';
import useReviewWorkspaceSettingsTaskCompletion from './useReviewWorkspaceSettingsTaskCompletion';

type UseCreateAndApplyCategoryParams = {
    /** Workspace the category is created on or re-enabled in */
    policyID: string | undefined;

    /** Writes the category onto the expense. The second argument is the workspace's categories including the new one. */
    updateCategory: (category: string, updatedPolicyCategories?: OnyxTypes.PolicyCategories) => void;
};

function useCreateAndApplyCategory({policyID, updateCategory}: UseCreateAndApplyCategoryParams) {
    const policyData = usePolicyData(policyID);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const getReviewWorkspaceSettingsTaskCompletion = useReviewWorkspaceSettingsTaskCompletion();

    const {
        taskReport: setupCategoryTaskReport,
        taskParentReport: setupCategoryTaskParentReport,
        isOnboardingTaskParentReportArchived: isSetupCategoriesTaskParentReportArchived,
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

    const createAndApplyCategory = (name: string) => {
        if (!policyID) {
            return;
        }

        const categoryName = StringUtils.sanitizeName(name);
        const disabledCategoryKey = getDisabledCategoryKey(policyData.categories, categoryName);
        const onboardingTaskData = {
            isSetupCategoriesTaskParentReportArchived,
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
            policyHasTags: hasTags(policyData.tags),
            reviewWorkspaceSettingsTaskData: getReviewWorkspaceSettingsTaskCompletion(),
        };

        if (disabledCategoryKey) {
            setWorkspaceCategoryEnabled({
                ...onboardingTaskData,
                policyData,
                categoriesToUpdate: {[disabledCategoryKey]: {name: disabledCategoryKey, enabled: true}},
                isVendorMatchingBetaEnabled: isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING),
            });
        } else {
            createPolicyCategory({...onboardingTaskData, policyID, categoryName});
        }

        // A re-enabled category keeps its stored (possibly HTML-encoded) key, which is what a normal pick writes too.
        const categoryKey = disabledCategoryKey ?? categoryName;
        updateCategory(categoryKey, {
            ...policyData.categories,
            [categoryKey]: {
                ...policyData.categories[categoryKey],
                name: categoryKey,
                enabled: true,
                errors: null,
                pendingAction: disabledCategoryKey ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        });
    };

    return createAndApplyCategory;
}

export default useCreateAndApplyCategory;
