import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateMergeHRGroups} from '@libs/actions/connections/MergeHR';
import {getAvailableMergeHRGroups, isMergeHRConnected} from '@libs/HRUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import tokenizedSearch from '@libs/tokenizedSearch';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

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
    const {isBetaEnabled} = usePermissions();

    const policy = usePolicy(policyID);
    const groups = getAvailableMergeHRGroups(policy);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(policy?.connections?.merge_hris?.config?.groups ?? []));
    const [searchText, setSearchText] = useState('');

    const filteredGroups = tokenizedSearch(groups, searchText, (group) => [group.name, group.type]);

    const listData: GroupListItem[] = filteredGroups.map((group) => ({
        text: group.name,
        alternateText: group.type.toLowerCase().replaceAll(/\b\w/g, (c) => c.toUpperCase()),
        keyForList: group.id,
        value: group.id,
        isSelected: selectedIds.has(group.id),
    }));

    const toggleItem = (item: GroupListItem) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(item.value)) {
                next.delete(item.value);
            } else {
                next.add(item.value);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            const allVisibleSelected = filteredGroups.length > 0 && filteredGroups.every((group) => next.has(group.id));
            for (const group of filteredGroups) {
                if (allVisibleSelected) {
                    next.delete(group.id);
                } else {
                    next.add(group.id);
                }
            }
            return next;
        });
    };

    const handleSave = () => {
        updateMergeHRGroups(policyID, [...selectedIds]);
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.MERGE_HR) || (!!policy && !isMergeHRConnected(policy))}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="MergeHRGroupsPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.hr.mergeHR.groups.title')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={styles.flex1}>
                    <Text style={[styles.ph5, styles.mb5]}>{translate('workspace.hr.mergeHR.groups.description')}</Text>
                    <SelectionList
                        data={listData}
                        ListItem={MultiSelectListItem}
                        canSelectMultiple
                        onSelectRow={toggleItem}
                        onSelectAll={toggleSelectAll}
                        textInputOptions={{
                            label: translate('common.search'),
                            value: searchText,
                            onChangeText: setSearchText,
                            style: {containerStyle: styles.pb5},
                        }}
                        style={{listHeaderSelectAllTextStyle: styles.textLabelSupporting, listItemWrapperStyle: styles.pv4}}
                    />
                    <FixedFooter style={styles.mtAuto}>
                        <Button
                            large
                            success
                            text={translate('common.save')}
                            onPress={handleSave}
                        />
                    </FixedFooter>
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default MergeHRGroupsPage;
