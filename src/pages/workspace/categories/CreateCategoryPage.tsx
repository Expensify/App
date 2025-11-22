import React, {useCallback} from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';
import {createPolicyCategory} from '@libs/actions/Policy/Category';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import CategoryForm from './CategoryForm';

type CreateCategoryPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_CREATE>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_CREATE>;

function CreateCategoryPage({route}: CreateCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backTo = route.params?.backTo;
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_CREATE;
    const policyData = usePolicyData(route.params.policyID);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {
        taskReport: setupCategoryTaskReport,
        taskParentReport: setupCategoryTaskParentReport,
        isOnboardingTaskParentReportArchived: isSetupCategoryTaskParentReportArchived,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES);

    const createCategory = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            createPolicyCategory(
                policyData,
                values.categoryName.trim(),
                isSetupCategoryTaskParentReportArchived,
                setupCategoryTaskReport,
                setupCategoryTaskParentReport,
                currentUserPersonalDetails.accountID,
            );
            Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(policyData.policyID, backTo) : undefined);
        },
        [policyData, isSetupCategoryTaskParentReportArchived, setupCategoryTaskReport, setupCategoryTaskParentReport, currentUserPersonalDetails.accountID, isQuickSettingsFlow, backTo],
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
                testID={CreateCategoryPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.categories.addCategory')}
                    onBackButtonPress={() => Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(route.params.policyID, backTo) : undefined)}
                />
                <CategoryForm
                    onSubmit={createCategory}
                    policyCategories={policyData.categories}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CreateCategoryPage.displayName = 'CreateCategoryPage';

export default CreateCategoryPage;
