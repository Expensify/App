import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateMergeATSFilters} from '@libs/actions/connections/merge/ATS';
import {isMergeConnected} from '@libs/merge/MergeUtils';
import {getConnectedATSProvider, getMergeATSFilterLabel} from '@libs/merge/RecruitingUtils';
import type {MergeATSFilterType} from '@libs/merge/RecruitingUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RecruitingMergeImportSettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useState} from 'react';

import {useMergeATSFilters} from './MergeATSFiltersDraftContext';

type MergeATSFiltersPageProps = PlatformStackScreenProps<RecruitingMergeImportSettingsNavigatorParamList, typeof SCREENS.RECRUITING_MERGE_IMPORT_SETTINGS.ROOT>;

function MergeATSFiltersPage({
    route: {
        params: {policyID},
    },
}: MergeATSFiltersPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policy = usePolicy(policyID);
    const mergeATS = policy?.connections?.merge_ats;
    const savedFilters = mergeATS?.config?.filters;
    const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

    const filters = useMergeATSFilters();

    const providerName = getConnectedATSProvider(policy)?.displayName ?? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.merge_ats;

    const filterRows: Array<{filterType: MergeATSFilterType; title: string}> = [
        {filterType: CONST.MERGE.ATS_FILTER_TYPE.STAGES, title: translate('workspace.recruiting.filters.stages.title')},
        {filterType: CONST.MERGE.ATS_FILTER_TYPE.TAGS, title: translate('workspace.recruiting.filters.tags.title')},
        {filterType: CONST.MERGE.ATS_FILTER_TYPE.OFFICES, title: translate('workspace.recruiting.filters.offices.optionalTitle')},
    ];

    const hasRequiredFilter = !!filters.tags?.length || !!filters.stages?.length;

    const handleSave = () => {
        if (!hasRequiredFilter) {
            setHasAttemptedSave(true);
            return;
        }

        updateMergeATSFilters(policyID, filters, savedFilters);
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_RECRUITING_ENABLED}
            shouldBeBlocked={!!policy && !isMergeConnected(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="MergeATSFiltersPage"
            >
                <HeaderWithBackButton title={translate('workspace.recruiting.importSettings')} />
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <Text style={[styles.ph5, styles.mb5, styles.textSupporting]}>{translate('workspace.recruiting.filters.description', providerName)}</Text>
                    <OfflineWithFeedback pendingAction={mergeATS?.config.pendingFields?.filters}>
                        {filterRows.map(({filterType, title}) => (
                            <MenuItemWithTopDescription
                                key={filterType}
                                description={title}
                                title={getMergeATSFilterLabel(filterType, filters, mergeATS?.data) ?? translate('workspace.recruiting.filters.skipImport')}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_RECRUITING_MERGE_IMPORT_SETTINGS_FILTER.getRoute(policyID, filterType))}
                            />
                        ))}
                    </OfflineWithFeedback>
                </ScrollView>
                <FixedFooter addBottomSafeAreaPadding>
                    {!hasRequiredFilter && hasAttemptedSave && (
                        <FormHelpMessage
                            isError
                            message={translate('workspace.recruiting.filters.chooseAtLeastOneItem')}
                            style={styles.mb3}
                        />
                    )}
                    <Button
                        size={CONST.BUTTON_SIZE.LARGE}
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={handleSave}
                    >
                        <Button.Text>{translate('common.save')}</Button.Text>
                    </Button>
                </FixedFooter>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default MergeATSFiltersPage;
