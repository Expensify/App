import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TableListItem from '@components/SelectionList/TableListItem';
import Text from '@components/Text';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type PolicyForList = {
    value: string;
    text: string;
    keyForList: string;
    isSelected: boolean;
    rightElement: React.ReactNode;
};

type WorkspaceCategoriesOnyxProps = {
    /** The policy the user is accessing. */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
};

type WorkspaceCategoriesPageProps = WorkspaceCategoriesOnyxProps & StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORIES>;

function WorkspaceCategoriesPage({policy, policyCategories, route}: WorkspaceCategoriesPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({});

    function fetchCategories() {
        Policy.openPolicyCategoriesPage(route.params.policyID);
    }

    const {isOffline} = useNetwork({onReconnect: fetchCategories});

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const categoryList = useMemo<PolicyForList[]>(
        () =>
            Object.values(policyCategories ?? {})
                .sort((a, b) => localeCompare(a.name, b.name))
                .map((value) => ({
                    value: value.name,
                    text: value.name,
                    keyForList: value.name,
                    isSelected: !!selectedCategories[value.name],
                    pendingAction: value.pendingAction,
                    rightElement: (
                        <View style={styles.flexRow}>
                            <Text style={[styles.textSupporting, styles.alignSelfCenter, styles.pl2, styles.label]}>
                                {value.enabled ? translate('workspace.common.enabled') : translate('workspace.common.disabled')}
                            </Text>
                            <View style={[styles.p1, styles.pl2]}>
                                <Icon
                                    src={Expensicons.ArrowRight}
                                    fill={theme.icon}
                                />
                            </View>
                        </View>
                    ),
                })),
        [policyCategories, selectedCategories, styles.alignSelfCenter, styles.flexRow, styles.label, styles.p1, styles.pl2, styles.textSupporting, theme.icon, translate],
    );

    const toggleCategory = (category: PolicyForList) => {
        setSelectedCategories((prev) => ({
            ...prev,
            [category.value]: !prev[category.value],
        }));
    };

    const toggleAllCategories = () => {
        const isAllSelected = categoryList.every((category) => !!selectedCategories[category.value]);
        setSelectedCategories(isAllSelected ? {} : Object.fromEntries(categoryList.map((item) => [item.value, true])));
    };

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr9]}>
            <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
        </View>
    );

    const navigateToCategoriesSettings = () => {
        Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES_SETTINGS.getRoute(route.params.policyID));
    };

    const navigateToCategorySettings = (category: PolicyForList) => {
        Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(route.params.policyID, category.text));
    };

    const navigateToCreateCategoryPage = () => {
        Navigation.navigate(ROUTES.WORKSPACE_CATEGORY_CREATE.getRoute(route.params.policyID));
    };

    const isLoading = !isOffline && policyCategories === undefined;

    const headerButtons = (
        <View style={[styles.w100, styles.flexRow, isSmallScreenWidth && styles.mb3]}>
            {!PolicyUtils.hasAccountingConnections(policy) && (
                <Button
                    medium
                    success
                    onPress={navigateToCreateCategoryPage}
                    icon={Expensicons.Plus}
                    text={translate('workspace.categories.addCategory')}
                    style={[styles.pr2, isSmallScreenWidth && styles.w50]}
                />
            )}
            <Button
                medium
                onPress={navigateToCategoriesSettings}
                icon={Expensicons.Gear}
                text={translate('common.settings')}
                style={[isSmallScreenWidth && styles.w50]}
            />
        </View>
    );

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={WorkspaceCategoriesPage.displayName}
                    shouldShowOfflineIndicatorInWideScreen
                >
                    <HeaderWithBackButton
                        icon={Illustrations.FolderOpen}
                        title={translate('workspace.common.categories')}
                        shouldShowBackButton={isSmallScreenWidth}
                    >
                        {!isSmallScreenWidth && headerButtons}
                    </HeaderWithBackButton>
                    {isSmallScreenWidth && <View style={[styles.pl5, styles.pr5]}>{headerButtons}</View>}
                    <View style={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.categories.subtitle')}</Text>
                    </View>
                    {isLoading && (
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={[styles.flex1]}
                            color={theme.spinner}
                        />
                    )}
                    {categoryList.length === 0 && !isLoading && (
                        <WorkspaceEmptyStateSection
                            title={translate('workspace.categories.emptyCategories.title')}
                            icon={Illustrations.EmptyStateExpenses}
                            subtitle={translate('workspace.categories.emptyCategories.subtitle')}
                        />
                    )}
                    {categoryList.length > 0 && (
                        <SelectionList
                            canSelectMultiple
                            sections={[{data: categoryList, indexOffset: 0, isDisabled: false}]}
                            onCheckboxPress={toggleCategory}
                            onSelectRow={navigateToCategorySettings}
                            onSelectAll={toggleAllCategories}
                            showScrollIndicator
                            ListItem={TableListItem}
                            customListHeader={getCustomListHeader()}
                            listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        />
                    )}
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceCategoriesPage.displayName = 'WorkspaceCategoriesPage';

export default withOnyx<WorkspaceCategoriesPageProps, WorkspaceCategoriesOnyxProps>({
    policy: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
    },
    policyCategories: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params.policyID}`,
    },
})(WorkspaceCategoriesPage);
