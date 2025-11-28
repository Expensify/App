import React, {useMemo, useState} from 'react';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy, isPaidGroupPolicy, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import {setWorkspaceAutoReportingMonthlyOffset} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const DAYS_OF_MONTH = 28;

type WorkspaceAutoReportingMonthlyOffsetProps = WithPolicyOnyxProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET>;

type AutoReportingOffsetKeys = ValueOf<typeof CONST.POLICY.AUTO_REPORTING_OFFSET>;

type WorkspaceAutoReportingMonthlyOffsetPageItem = {
    text: string;
    keyForList: string;
    isSelected: boolean;
    isNumber?: boolean;
};

function WorkspaceAutoReportingMonthlyOffsetPage({policy, route}: WorkspaceAutoReportingMonthlyOffsetProps) {
    const {translate, toLocaleOrdinal} = useLocalize();
    const offset = policy?.autoReportingOffset ?? 0;
    const [searchText, setSearchText] = useState('');
    const trimmedText = searchText.trim().toLowerCase();

    const daysOfMonth: WorkspaceAutoReportingMonthlyOffsetPageItem[] = Array.from({length: DAYS_OF_MONTH}, (value, index) => {
        const day = index + 1;

        return {
            text: toLocaleOrdinal(day),
            keyForList: day.toString(), // we have to cast it as string for <ListItem> to work
            isSelected: day === offset,
            isNumber: true,
        };
    }).concat([
        {
            keyForList: 'lastDayOfMonth',
            text: translate('workflowsPage.frequencies.lastDayOfMonth'),
            isSelected: offset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH,
            isNumber: false,
        },
        {
            keyForList: 'lastBusinessDayOfMonth',
            text: translate('workflowsPage.frequencies.lastBusinessDayOfMonth'),
            isSelected: offset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH,
            isNumber: false,
        },
    ]);

    const filteredDaysOfMonth = daysOfMonth.filter((dayItem) => dayItem.text.toLowerCase().includes(trimmedText));

    const onSelectDayOfMonth = (item: WorkspaceAutoReportingMonthlyOffsetPageItem) => {
        setWorkspaceAutoReportingMonthlyOffset(policy?.id, item.isNumber ? parseInt(item.keyForList, 10) : (item.keyForList as AutoReportingOffsetKeys));
        Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(policy?.id));
    };
    const textInputOptions = useMemo(
        () => ({
            label: translate('workflowsPage.submissionFrequencyDateOfMonth'),
            value: searchText,
            onChangeText: setSearchText,
            headerMessage: searchText.trim() && !filteredDaysOfMonth.length ? translate('common.noResultsFound') : '',
        }),
        [searchText, filteredDaysOfMonth.length, setSearchText, translate],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={WorkspaceAutoReportingMonthlyOffsetPage.displayName}
            >
                <FullPageNotFoundView
                    onBackButtonPress={goBackFromInvalidPolicy}
                    onLinkPress={goBackFromInvalidPolicy}
                    shouldShow={isEmptyObject(policy) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy) || !isPaidGroupPolicy(policy)}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    addBottomSafeAreaPadding
                >
                    <HeaderWithBackButton
                        title={translate('workflowsPage.submissionFrequency')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(policy?.id))}
                    />

                    <SelectionList
                        data={filteredDaysOfMonth}
                        ListItem={RadioListItem}
                        onSelectRow={onSelectDayOfMonth}
                        textInputOptions={textInputOptions}
                        initiallyFocusedItemKey={offset.toString()}
                        shouldSingleExecuteRowSelect
                        addBottomSafeAreaPadding
                        showScrollIndicator
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceAutoReportingMonthlyOffsetPage.displayName = 'WorkspaceAutoReportingMonthlyOffsetPage';
export default withPolicy(WorkspaceAutoReportingMonthlyOffsetPage);
