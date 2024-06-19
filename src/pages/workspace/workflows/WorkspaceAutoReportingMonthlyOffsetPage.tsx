import type {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {WorkspaceNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const DAYS_OF_MONTH = 28;

type WorkspaceAutoReportingMonthlyOffsetProps = WithPolicyOnyxProps & StackScreenProps<WorkspaceNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET>;

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

    const headerMessage = searchText.trim() && !filteredDaysOfMonth.length ? translate('common.noResultsFound') : '';

    const onSelectDayOfMonth = (item: WorkspaceAutoReportingMonthlyOffsetPageItem) => {
        Policy.setWorkspaceAutoReportingMonthlyOffset(policy?.id ?? '-1', item.isNumber ? parseInt(item.keyForList, 10) : (item.keyForList as AutoReportingOffsetKeys));
        Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(policy?.id ?? ''));
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceAutoReportingMonthlyOffsetPage.displayName}
            >
                <FullPageNotFoundView
                    onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy}
                    onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
                    shouldShow={isEmptyObject(policy) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy) || !PolicyUtils.isPaidGroupPolicy(policy)}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                >
                    <HeaderWithBackButton
                        title={translate('workflowsPage.submissionFrequency')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(policy?.id ?? ''))}
                    />

                    <SelectionList
                        sections={[{data: filteredDaysOfMonth}]}
                        textInputLabel={translate('workflowsPage.submissionFrequencyDateOfMonth')}
                        textInputValue={searchText}
                        onChangeText={setSearchText}
                        headerMessage={headerMessage}
                        ListItem={RadioListItem}
                        onSelectRow={onSelectDayOfMonth}
                        shouldSingleExecuteRowSelect
                        initiallyFocusedOptionKey={offset.toString()}
                        showScrollIndicator
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceAutoReportingMonthlyOffsetPage.displayName = 'WorkspaceAutoReportingMonthlyOffsetPage';
export default withPolicy(WorkspaceAutoReportingMonthlyOffsetPage);
