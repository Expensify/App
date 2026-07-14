import BlockingView from '@components/BlockingViews/BlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getMatchingVendors, hasVendorFeature} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import React, {useState} from 'react';

type VendorListItem = ListItem & {
    value: string;
};

type WorkspaceVendorsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.VENDORS>;

function WorkspaceVendorsPage({
    route: {
        params: {policyID},
    },
}: WorkspaceVendorsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const [searchValue, setSearchValue] = useState('');

    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.vendors');

    const isFeatureAvailable = hasVendorFeature(policy, isBetaEnabled(CONST.BETAS.VENDOR_MATCHING));
    const vendors = getMatchingVendors(policy);

    const trimmedSearch = searchValue.trim().toLowerCase();
    const vendorRows: VendorListItem[] = vendors
        .filter((vendor) => !trimmedSearch || vendor.name.toLowerCase().includes(trimmedSearch))
        .map((vendor) => ({
            value: vendor.id,
            text: vendor.name,
            keyForList: vendor.id,
            isSelected: false,
            searchText: vendor.name,
            shouldHideSelectionButton: true,
        }));

    const headerMessage = searchValue && vendorRows.length === 0 ? translate('common.noResultsFound') : '';

    const listEmptyContent =
        vendors.length === 0 ? (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.vendors.emptyTitle')}
                subtitle={translate('workspace.vendors.emptySubtitle')}
                containerStyle={styles.pb10}
            />
        ) : null;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            shouldBeBlocked={!isFeatureAvailable}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                style={[styles.defaultModalContainer]}
                testID="WorkspaceVendorsPage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    shouldShowBackButton={shouldUseNarrowLayout}
                    title={translate('workspace.common.vendors')}
                    shouldUseHeadlineHeader
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <SelectionList
                    data={vendorRows}
                    onSelectRow={() => {}}
                    textInputOptions={{
                        label: translate('common.search'),
                        value: searchValue,
                        onChangeText: setSearchValue,
                        headerMessage,
                    }}
                    ListItem={SingleSelectListItem}
                    shouldShowLoadingPlaceholder={!policy}
                    listEmptyContent={listEmptyContent}
                    canSelectMultiple={false}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceVendorsPage.displayName = 'WorkspaceVendorsPage';

export default WorkspaceVendorsPage;
