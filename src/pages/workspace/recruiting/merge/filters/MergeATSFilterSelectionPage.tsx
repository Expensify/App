import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {isMergeConnected} from '@libs/merge/MergeUtils';
import {getMergeATSFilterOptions} from '@libs/merge/RecruitingUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeATSFiltersNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useState} from 'react';
import {View} from 'react-native';

import {useMergeATSFiltersDraftActions, useMergeATSFiltersDraftState} from './MergeATSFiltersDraftContext';

type MergeATSFilterSelectionPageProps = PlatformStackScreenProps<MergeATSFiltersNavigatorParamList, typeof SCREENS.WORKSPACE.RECRUITING_MERGE_IMPORT_SETTINGS_FILTER>;

const TITLES = {
    [CONST.MERGE.ATS_FILTER_TYPE.STAGES]: 'workspace.recruiting.filters.stages.title',
    [CONST.MERGE.ATS_FILTER_TYPE.TAGS]: 'workspace.recruiting.filters.tags.title',
    [CONST.MERGE.ATS_FILTER_TYPE.OFFICES]: 'workspace.recruiting.filters.offices.title',
} as const;

const DESCRIPTIONS = {
    [CONST.MERGE.ATS_FILTER_TYPE.STAGES]: 'workspace.recruiting.filters.stages.description',
    [CONST.MERGE.ATS_FILTER_TYPE.TAGS]: 'workspace.recruiting.filters.tags.description',
    [CONST.MERGE.ATS_FILTER_TYPE.OFFICES]: 'workspace.recruiting.filters.offices.description',
} as const;

function MergeATSFilterSelectionPage({
    route: {
        params: {policyID, filterType},
    },
}: MergeATSFilterSelectionPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policy = usePolicy(policyID);
    const mergeATS = policy?.connections?.merge_ats;

    const filters = useMergeATSFiltersDraftState(policyID);
    const {setFilter} = useMergeATSFiltersDraftActions();
    const [selectedValues, setSelectedValues] = useState<Set<string>>(() => new Set(filters[filterType]));

    const optionItems = getMergeATSFilterOptions(filterType, mergeATS?.data).map((option) => ({
        text: option.name,
        keyForList: option.value,
        value: option.value,
        isSelected: selectedValues.has(option.value),
    }));
    const {filteredData, textInputOptions} = useSelectionListSearch(optionItems);

    const toggleItem = (item: ListItem) => {
        setSelectedValues((previousValues) => {
            const nextValues = new Set(previousValues);
            if (nextValues.has(item.keyForList)) {
                nextValues.delete(item.keyForList);
            } else {
                nextValues.add(item.keyForList);
            }
            return nextValues;
        });
    };

    const toggleSelectAll = () => {
        setSelectedValues((previousValues) => {
            const nextValues = new Set(previousValues);
            const areAllVisibleSelected = filteredData.length > 0 && filteredData.every((option) => nextValues.has(option.value));
            for (const option of filteredData) {
                if (areAllVisibleSelected) {
                    nextValues.delete(option.value);
                } else {
                    nextValues.add(option.value);
                }
            }
            return nextValues;
        });
    };

    const titleKey = TITLES[filterType];
    const descriptionKey = DESCRIPTIONS[filterType];

    const handleSave = () => {
        setFilter(filterType, [...selectedValues]);
        Navigation.goBack(ROUTES.WORKSPACE_RECRUITING_MERGE_IMPORT_SETTINGS.getRoute(policyID));
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_RECRUITING_ENABLED}
            shouldBeBlocked={!titleKey || (!!policy && !isMergeConnected(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS))}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="MergeATSFilterSelectionPage"
            >
                <HeaderWithBackButton title={titleKey ? translate(titleKey) : ''} />
                <View style={styles.flex1}>
                    <Text style={[styles.ph5, styles.mb5, styles.textSupporting]}>{descriptionKey ? translate(descriptionKey) : ''}</Text>
                    <SelectionList
                        data={filteredData}
                        ListItem={MultiSelectListItem}
                        canSelectMultiple
                        selectionButtonPosition={CONST.SELECTION_BUTTON_POSITION.RIGHT}
                        onSelectRow={toggleItem}
                        onSelectAll={toggleSelectAll}
                        textInputOptions={{
                            ...textInputOptions,
                            headerMessage: textInputOptions.value.trim() && filteredData.length === 0 ? translate('common.noResultsFound') : '',
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

export default MergeATSFilterSelectionPage;
