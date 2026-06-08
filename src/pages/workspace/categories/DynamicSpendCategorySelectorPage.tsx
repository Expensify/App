import React from 'react';
import CategoryPicker from '@components/CategoryPicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {ListItem} from '@components/SelectionList/types';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setWorkspaceDefaultSpendCategory} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DynamicSpendCategorySelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_SPEND_CATEGORY_SELECTOR>;

function DynamicSpendCategorySelectorPage({route}: DynamicSpendCategorySelectorPageProps) {
    const {policyID, groupID} = route.params;
    const styles = useThemeStyles();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.SPEND_CATEGORY_SELECTOR.path);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(policyID)}`);
    const label = groupID.charAt(0).toUpperCase() + groupID.slice(1);
    const currentCategory = policy?.mccGroup?.[groupID]?.category ?? '';

    const onCategorySelected = (selectedCategory: ListItem) => {
        if (!selectedCategory.keyForList) {
            return;
        }
        if (currentCategory === selectedCategory.keyForList) {
            Navigation.goBack(backPath);
            return;
        }
        setWorkspaceDefaultSpendCategory(policyID, groupID, selectedCategory.keyForList, policy?.mccGroup);
        Navigation.goBack(backPath);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                style={styles.pb0}
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableKeyboardAvoidingView={false}
                testID="DynamicSpendCategorySelectorPage"
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                <CategoryPicker
                    policyID={policyID}
                    selectedCategory={currentCategory}
                    onSubmit={onCategorySelected}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicSpendCategorySelectorPage;
