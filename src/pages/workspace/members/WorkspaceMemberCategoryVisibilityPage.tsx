/**
 * Lets a workspace admin choose which of the workspace's enabled categories a member can use, from that member's
 * details page. Saving replaces the member's allowed categories with the checked ones.
 */
import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useInitialSelection from '@hooks/useInitialSelection';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLoadPolicyCategories from '@hooks/useLoadPolicyCategories';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePolicyCategoryPickerCategories from '@hooks/usePolicyCategoryPickerCategories';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {setPolicyMemberCategoryVisibility} from '@libs/actions/Policy/Category';
import {getDecodedCategoryName, getMemberVisibleCategoryNames} from '@libs/CategoryUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canMemberWrite, getMemberAccountIDsForWorkspace, isControlPolicy} from '@libs/PolicyUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import {cancelSpan, endSpan} from '@libs/telemetry/activeSpans';
import tokenizedSearch from '@libs/tokenizedSearch';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type WorkspaceMemberCategoryVisibilityPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS_CATEGORY_VISIBILITY>;

type CategoryListItem = ListItem & {
    value: string;
};

function WorkspaceMemberCategoryVisibilityPage({policy, route}: WorkspaceMemberCategoryVisibilityPageProps) {
    const accountID = Number(route.params.accountID);
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const {isBetaEnabled} = usePermissions();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const canWriteCategories = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.CATEGORIES);
    const {showConfirmModal} = useConfirmModal();
    const employeePersonalDetails = usePersonalDetailsByLogins(Object.keys(policy?.employeeList ?? {}));

    const memberLogin = Object.keys(policy?.employeeList ?? {}).find((login) => employeePersonalDetails[login]?.accountID === accountID);

    const {categories, policyCategories, areCategoriesEnabled, isLoading: isLoadingPickerCategories} = usePolicyCategoryPickerCategories({policyID});
    const {isLoadingCompletePolicyCategories} = useLoadPolicyCategories(policyID);
    const isLoading = isLoadingPickerCategories || isLoadingCompletePolicyCategories;

    // An unrestricted member sees every enabled category, so every row starts checked.
    const memberVisibleCategories = getMemberVisibleCategoryNames(policyCategories, accountID);
    // Undefined until the admin changes something, so the selection follows the member's categories once they load.
    const [selectionOverride, setSelectionOverride] = useState<string[]>();
    const selectedCategories = selectionOverride ?? memberVisibleCategories;
    const initialSelectedCategories = useInitialSelection(memberVisibleCategories, {resetOnFocus: true});

    const backToRoute = ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID);

    useEffect(() => {
        if (isLoading) {
            return;
        }
        endSpan(CONST.TELEMETRY.SPAN_OPEN_MEMBER_CATEGORY_VISIBILITY);
    }, [isLoading]);

    // A no-op once the span has ended, so this only cancels it when the admin leaves before the list renders.
    useEffect(() => () => cancelSpan(CONST.TELEMETRY.SPAN_OPEN_MEMBER_CATEGORY_VISIBILITY), []);

    const categoryItems: CategoryListItem[] = categories.map((category) => ({
        keyForList: category.name,
        text: getDecodedCategoryName(category.name),
        value: category.name,
        isSelected: selectedCategories.includes(category.name),
    }));

    const filterCategory = (item: CategoryListItem, searchInput: string) => tokenizedSearch([item], searchInput, (category) => [category.text ?? '']).length > 0;

    const sortedCategoryItems = moveInitialSelectionToTop(
        [...categoryItems].sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')),
        initialSelectedCategories,
    );

    const [inputValue, setInputValue, filteredCategoryItems] = useSearchResults(sortedCategoryItems, filterCategory);

    const toggleCategory = (item: CategoryListItem) => {
        setSelectionOverride(selectedCategories.includes(item.value) ? selectedCategories.filter((categoryName) => categoryName !== item.value) : [...selectedCategories, item.value]);
    };

    const toggleSelectAll = () => {
        const visibleValues = filteredCategoryItems.map((item) => item.value);
        const allVisibleSelected = visibleValues.length > 0 && visibleValues.every((value) => selectedCategories.includes(value));

        if (allVisibleSelected) {
            const visibleSet = new Set(visibleValues);
            setSelectionOverride(selectedCategories.filter((value) => !visibleSet.has(value)));
            return;
        }

        setSelectionOverride(Array.from(new Set([...selectedCategories, ...visibleValues])));
    };

    const handleSave = () => {
        // Only categories still on the list count, so one deleted or disabled since the page opened isn't saved.
        const categoriesToSave = categories.filter((category) => selectedCategories.includes(category.name)).map((category) => category.name);
        if (categoriesToSave.length === 0) {
            showConfirmModal({
                title: translate('workspace.people.categoryVisibilityRequiredModal.title'),
                prompt: translate('workspace.people.categoryVisibilityRequiredModal.description'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
            return;
        }

        const hasChanges = categoriesToSave.length !== memberVisibleCategories.length || categoriesToSave.some((categoryName) => !memberVisibleCategories.includes(categoryName));
        if (hasChanges) {
            const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList, employeePersonalDetails, true, false));
            if (!memberLogin) {
                return;
            }
            setPolicyMemberCategoryVisibility(policyID, [accountID], categoriesToSave, policyCategories ?? {}, policyMemberAccountIDs, [memberLogin]);
        }
        Navigation.goBack(backToRoute, {shouldSkipFocusRestore: true});
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.CATEGORY_VISIBILITY) || !isControlPolicy(policy) || !areCategoriesEnabled || !canWriteCategories || !memberLogin}
        >
            <ScreenWrapper
                testID="WorkspaceMemberCategoryVisibilityPage"
                shouldEnableMaxHeight
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('workspace.people.categoryVisibility')}
                    onBackButtonPress={() => Navigation.goBack(backToRoute)}
                />
                {isLoading ? (
                    <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                    </View>
                ) : (
                    <SelectionList
                        canSelectMultiple
                        shouldUpdateFocusedIndex
                        ListItem={MultiSelectListItem}
                        data={filteredCategoryItems}
                        selectedItems={selectedCategories}
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                        onSelectRow={toggleCategory}
                        onSelectionButtonPress={toggleCategory}
                        onSelectAll={filteredCategoryItems.length > 0 ? toggleSelectAll : undefined}
                        textInputOptions={{
                            value: inputValue,
                            label: translate('common.search'),
                            onChangeText: setInputValue,
                        }}
                        style={{
                            listHeaderWrapperStyle: [styles.pt5, styles.pb2],
                            listHeaderSelectAllTextStyle: [styles.textLabelSupporting],
                        }}
                        listEmptyContent={
                            <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                                <BlockingView
                                    icon={illustrations.Telescope}
                                    iconWidth={variables.emptyListIconWidth}
                                    iconHeight={variables.emptyListIconHeight}
                                    title={translate('common.noResultsFound')}
                                />
                            </ScrollView>
                        }
                        footerContent={
                            <FormAlertWithSubmitButton
                                buttonText={translate('common.save')}
                                isAlertVisible={false}
                                onSubmit={handleSave}
                                enabledWhenOffline
                                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                            />
                        }
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberCategoryVisibilityPage);
