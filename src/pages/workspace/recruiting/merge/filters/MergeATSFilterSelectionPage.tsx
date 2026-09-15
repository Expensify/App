import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {isMergeConnected} from '@libs/merge/MergeUtils';
import {getMergeATSFilterOptions} from '@libs/merge/RecruitingUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RecruitingMergeImportSettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useState} from 'react';
import {View} from 'react-native';

import {useMergeATSFilters, useMergeATSFiltersActions} from './MergeATSFiltersDraftContext';

type MergeATSFilterSelectionPageProps = PlatformStackScreenProps<RecruitingMergeImportSettingsNavigatorParamList, typeof SCREENS.RECRUITING_MERGE_IMPORT_SETTINGS.FILTER>;

const SKIP_IMPORT_KEY = 'skipImport';

const TITLES = {
    [CONST.MERGE.ATS_FILTER_TYPE.TAGS]: 'workspace.recruiting.filters.tags.title',
    [CONST.MERGE.ATS_FILTER_TYPE.OFFICES]: 'workspace.recruiting.filters.offices.title',
    [CONST.MERGE.ATS_FILTER_TYPE.STAGES]: 'workspace.recruiting.filters.stages.title',
} as const;

const DESCRIPTIONS = {
    [CONST.MERGE.ATS_FILTER_TYPE.TAGS]: 'workspace.recruiting.filters.tags.description',
    [CONST.MERGE.ATS_FILTER_TYPE.OFFICES]: 'workspace.recruiting.filters.offices.description',
    [CONST.MERGE.ATS_FILTER_TYPE.STAGES]: 'workspace.recruiting.filters.stages.description',
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

    const filters = useMergeATSFilters();
    const {setFilter} = useMergeATSFiltersActions();
    const [selectedValues, setSelectedValues] = useState<Set<string>>(() => new Set(filters[filterType]));

    const options = getMergeATSFilterOptions(filterType, mergeATS?.data);

    const optionItems: ListItem[] = options.map((option) => ({
        text: option.name,
        keyForList: option.value,
        value: option.value,
        isSelected: selectedValues.has(option.value),
    }));

    const skipImportItem: ListItem = {
        text: translate('workspace.recruiting.filters.skipImport'),
        keyForList: SKIP_IMPORT_KEY,
        isSelected: selectedValues.size === 0,
    };

    const toggleItem = (item: ListItem) => {
        if (item.keyForList === SKIP_IMPORT_KEY) {
            setSelectedValues(new Set());
            return;
        }

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

    const handleSave = () => {
        setFilter(filterType, [...selectedValues]);
        Navigation.goBack(ROUTES.WORKSPACE_RECRUITING_MERGE_IMPORT_SETTINGS.getRoute(policyID));
    };

    const titleKey = TITLES[filterType];
    const descriptionKey = DESCRIPTIONS[filterType];

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_RECRUITING_ENABLED}
            shouldBeBlocked={!titleKey || (!!policy && !isMergeConnected(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS))}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="MergeATSFilterSelectionPage"
            >
                <HeaderWithBackButton title={titleKey ? translate(titleKey) : ''} />
                <View style={styles.flex1}>
                    <Text style={[styles.ph5, styles.mb5, styles.textSupporting]}>{descriptionKey ? translate(descriptionKey) : ''}</Text>
                    <SelectionListWithSections
                        sections={[
                            {data: [skipImportItem], sectionIndex: 0},
                            {data: optionItems, sectionIndex: 1, customHeader: <View style={[styles.sectionDividerLine, styles.mh5, styles.mv3]} />},
                        ]}
                        ListItem={MultiSelectListItem}
                        canSelectMultiple
                        onSelectRow={toggleItem}
                        style={{listItemWrapperStyle: styles.pv4}}
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
