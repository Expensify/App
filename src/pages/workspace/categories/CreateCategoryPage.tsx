import React, {useCallback} from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
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
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params.policyID}`, {canBeMissing: true});
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backTo = route.params?.backTo;
    const isQuickSettingsFlow = route.name === SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_CREATE;
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const taskReportID = introSelected?.[CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES];
    const [taskReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`, {canBeMissing: true}, [taskReportID]);
    const [taskParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${taskReport?.parentReportID}`, {canBeMissing: true});
    const isSetupCategoryTaskParentReportArchived = useReportIsArchived(taskParentReport?.reportID);

    const createCategory = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            createPolicyCategory(route.params.policyID, values.categoryName.trim(), isSetupCategoryTaskParentReportArchived, taskReport, taskParentReport);
            Navigation.goBack(isQuickSettingsFlow ? ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(route.params.policyID, backTo) : undefined);
        },
        [route.params.policyID, isSetupCategoryTaskParentReportArchived, taskReport, taskParentReport, isQuickSettingsFlow, backTo],
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
                    policyCategories={policyCategories}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CreateCategoryPage.displayName = 'CreateCategoryPage';

export default CreateCategoryPage;
