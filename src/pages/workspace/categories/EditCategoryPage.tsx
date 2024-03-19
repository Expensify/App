import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyCategories} from '@src/types/onyx';
import CategoryForm from './CategoryForm';

type WorkspaceEditCategoryPageOnyxProps = {
    /** All policy categories */
    policyCategories: OnyxEntry<PolicyCategories>;
};

type EditCategoryPageProps = WorkspaceEditCategoryPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_EDIT>;

function EditCategoryPage({route, policyCategories}: EditCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentCategoryName = route.params.categoryName;

    const editCategory = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            Policy.renamePolicyCategory(route.params.policyID, {oldName: currentCategoryName, newName: values.categoryName});
        },
        [currentCategoryName, route.params.policyID],
    );

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={EditCategoryPage.displayName}
                    shouldEnableMaxHeight
                >
                    <HeaderWithBackButton
                        title={translate('workspace.categories.editCategory')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(route.params.policyID, route.params.categoryName))}
                    />
                    <CategoryForm
                        onSubmit={editCategory}
                        categoryName={currentCategoryName}
                        policyCategories={policyCategories}
                    />
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

EditCategoryPage.displayName = 'EditCategoryPage';

export default withOnyx<EditCategoryPageProps, WorkspaceEditCategoryPageOnyxProps>({
    policyCategories: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route?.params?.policyID}`,
    },
})(EditCategoryPage);
