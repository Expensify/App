import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Category from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyCategories} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import CategoryForm from './CategoryForm';

type WorkspaceCreateCategoryPageOnyxProps = {
    /** All policy categories */
    policyCategories: OnyxEntry<PolicyCategories>;
};

type CreateCategoryPageProps = WorkspaceCreateCategoryPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_CREATE>;

function CreateCategoryPage({route, policyCategories}: CreateCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backTo = route.params?.backTo;

    const createCategory = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
            Category.createPolicyCategory(route.params.policyID, values.categoryName.trim());
            if (backTo) {
                Navigation.goBack(ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(route.params.policyID, backTo));
                return;
            }
            Navigation.goBack();
        },
        [backTo, route.params.policyID],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={CreateCategoryPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.categories.addCategory')}
                    onBackButtonPress={() => (backTo ? Navigation.goBack(ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(route.params.policyID, backTo)) : Navigation.goBack())}
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

export default function ComponentWithOnyx(props: Omit<CreateCategoryPageProps, keyof WorkspaceCreateCategoryPageOnyxProps>) {
    const [policyCategories, policyCategoriesMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${props.route?.params?.policyID}`);

    if (isLoadingOnyxValue(policyCategoriesMetadata)) {
        return null;
    }

    return (
        <CreateCategoryPage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            policyCategories={policyCategories}
        />
    );
}
