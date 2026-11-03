import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useLocalize from '@hooks/useLocalize';

import {setDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {canEditWorkspaceSettings, goBackFromInvalidPolicy, isGroupPolicy, isPendingDeletePolicy} from '@libs/PolicyUtils';
import {WEEKDAY_KEYS} from '@libs/SubmissionScheduleUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceSubmissionFrequencyForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useState} from 'react';

import useSubmissionFrequencyDraft from './useSubmissionFrequencyDraft';

type WorkspaceAutoReportingWeeklyOffsetPageProps = WithPolicyOnyxProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_WEEKLY_OFFSET>;

function WorkspaceAutoReportingWeeklyOffsetPage({policy, route}: WorkspaceAutoReportingWeeklyOffsetPageProps) {
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const {offset} = useSubmissionFrequencyDraft(policy);
    const [userSelectedWeekday, setUserSelectedWeekday] = useState<number | undefined>();
    const selectedWeekday = userSelectedWeekday ?? offset;

    const items = WEEKDAY_KEYS.map((weekdayKey, index) => ({
        text: translate(`workflowsPage.daysOfWeek.${weekdayKey}`),
        keyForList: String(index + 1),
        isSelected: index + 1 === selectedWeekday,
    }));

    const goBack = () => Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(policyID));

    const save = () => {
        if (selectedWeekday !== undefined) {
            setDraftValues(ONYXKEYS.FORMS.WORKSPACE_SUBMISSION_FREQUENCY_FORM, {[INPUT_IDS.OFFSET]: String(selectedWeekday)});
        }
        goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="WorkspaceAutoReportingWeeklyOffsetPage"
            >
                <FullPageNotFoundView
                    onBackButtonPress={goBackFromInvalidPolicy}
                    onLinkPress={goBackFromInvalidPolicy}
                    shouldShow={isEmptyObject(policy) || !canEditWorkspaceSettings(policy) || isPendingDeletePolicy(policy) || !isGroupPolicy(policy)}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    addBottomSafeAreaPadding
                >
                    <HeaderWithBackButtonAndTitle
                        title={translate('workflowsPage.dayOfTheWeek')}
                        onBackButtonPress={goBack}
                    />
                    <SelectionList
                        data={items}
                        ListItem={SingleSelectListItem}
                        onSelectRow={(item) => setUserSelectedWeekday(Number(item.keyForList))}
                        confirmButtonOptions={{
                            showButton: true,
                            text: translate('common.save'),
                            onConfirm: save,
                            isDisabled: selectedWeekday === offset,
                        }}
                        initiallyFocusedItemKey={String(offset)}
                        shouldSingleExecuteRowSelect
                        addBottomSafeAreaPadding
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicy(WorkspaceAutoReportingWeeklyOffsetPage);
