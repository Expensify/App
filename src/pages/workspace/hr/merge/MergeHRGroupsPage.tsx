import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateMergeHRGroups} from '@libs/actions/connections/merge/HR';
import {getNonRenderableMergeHRGroupIDs, getValidMergeHRGroupIDs} from '@libs/merge/HRUtils';
import {isMergeConnected} from '@libs/merge/MergeUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import tokenizedSearch from '@libs/tokenizedSearch';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import React, {useMemo, useState} from 'react';
import {View} from 'react-native';

type MergeHRGroupsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_MERGE_GROUPS>;

type GroupListItem = ListItem & {
    /** Group id */
    value: string;
};

function MergeHRGroupsPage({
    route: {
        params: {policyID},
    },
}: MergeHRGroupsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const policy = usePolicy(policyID);
    const availableGroups = policy?.connections?.merge_hris?.data?.groups ?? [];
    const currentGroups = policy?.connections?.merge_hris?.config?.groups;
    const nonRenderableGroupIDs = getNonRenderableMergeHRGroupIDs(policy);
    const hasAnyGroups = availableGroups.length > 0 || nonRenderableGroupIDs.length > 0;

    // null until the admin touches a checkbox, so the selection keeps tracking policy data (which may still be
    // loading on a cold open) instead of freezing on whatever was available at mount.
    const [manualSelection, setManualSelection] = useState<Set<string> | null>(null);
    const selectedIds = manualSelection ?? new Set(getValidMergeHRGroupIDs(policy));
    const [searchText, setSearchText] = useState('');

    const filteredGroups = tokenizedSearch(availableGroups, searchText, (group) => [group.name, group.type]);

    // Groups the HR system still has but that Merge sent back without a name or type are labelled with their ID,
    // so that ID is the only thing there is to search them by.
    const filteredNonRenderableGroupIDs = tokenizedSearch(nonRenderableGroupIDs, searchText, (groupID) => [groupID]);

    const listData: GroupListItem[] = [
        ...filteredGroups.map((group) => ({
            text: group.name,
            alternateText: group.type.charAt(0).toUpperCase() + group.type.slice(1).toLowerCase(),
            keyForList: group.id,
            value: group.id,
            isSelected: selectedIds.has(group.id),
            itemStyle: styles.pv4,
        })),
        ...filteredNonRenderableGroupIDs.map((groupID) => ({
            text: translate('workspace.hr.mergeHR.groups.unnamedGroup', groupID),
            keyForList: groupID,
            value: groupID,
            isSelected: selectedIds.has(groupID),
            itemStyle: styles.pv4,
        })),
    ];
    const visibleGroupIDs = [...filteredGroups.map((group) => group.id), ...filteredNonRenderableGroupIDs];

    const toggleItem = (item: GroupListItem) => {
        const next = new Set(selectedIds);
        if (next.has(item.value)) {
            next.delete(item.value);
        } else {
            next.add(item.value);
        }
        setManualSelection(next);
    };

    const toggleSelectAll = () => {
        const next = new Set(selectedIds);
        const allVisibleSelected = visibleGroupIDs.length > 0 && visibleGroupIDs.every((groupID) => next.has(groupID));
        for (const groupID of visibleGroupIDs) {
            if (allVisibleSelected) {
                next.delete(groupID);
            } else {
                next.add(groupID);
            }
        }
        setManualSelection(next);
    };

    const handleSave = () => {
        updateMergeHRGroups(policyID, [...selectedIds], currentGroups);
        Navigation.goBack();
    };

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.hr.mergeHR.groups.noGroupsFound')}
                subtitle={translate('workspace.hr.mergeHR.groups.noGroupsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [illustrations.Telescope, translate, styles.pb10],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
            shouldBeBlocked={!!policy && !isMergeConnected(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_HR)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="MergeHRGroupsPage"
            >
                <HeaderWithBackButton title={translate('workspace.hr.mergeHR.groups.title')} />
                <View style={styles.flex1}>
                    <Text style={[styles.ph5, styles.mb5]}>{translate('workspace.hr.mergeHR.groups.description')}</Text>
                    <SelectionList
                        data={listData}
                        ListItem={MultiSelectListItem}
                        canSelectMultiple
                        onSelectRow={toggleItem}
                        onSelectAll={listData.length > 0 ? toggleSelectAll : undefined}
                        listEmptyContent={listEmptyContent}
                        shouldShowListEmptyContent={!hasAnyGroups}
                        textInputOptions={{
                            label: translate('common.search'),
                            value: searchText,
                            onChangeText: setSearchText,
                            headerMessage: listData.length === 0 && hasAnyGroups ? translate('common.noResultsFound') : undefined,
                            style: {containerStyle: styles.pb5},
                        }}
                        style={{listHeaderSelectAllTextStyle: styles.textLabelSupporting}}
                    />
                    <FixedFooter
                        style={styles.mtAuto}
                        addBottomSafeAreaPadding
                    >
                        <Button
                            size={CONST.BUTTON_SIZE.LARGE}
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            onPress={handleSave}
                        >
                            <Button.Text>{translate('common.save')}</Button.Text>
                        </Button>
                    </FixedFooter>
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default MergeHRGroupsPage;
