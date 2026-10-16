import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';
import {canEditWorkspaceSettings, goBackFromInvalidPolicy, isGroupPolicy, isPendingDeletePolicy} from '@libs/PolicyUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import {areSemiMonthlyOffsetsEqual, getAutoReportingOffsetDisplayName, LAST_WEEKDAY_OFFSETS, parseAutoReportingOffset} from '@libs/SubmissionScheduleUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {AutoReportingOffset} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useState} from 'react';

type AutoReportingDayOfMonthPickerProps = {
    /** The policy whose schedule is being edited */
    policy: OnyxEntry<Policy>;

    /** The policyID from the route, used for access checks before the policy loads */
    routePolicyID: string;

    /** Page test ID */
    testID: string;

    /** The day currently chosen in the Frequency RHP */
    selectedOffset: AutoReportingOffset | undefined;

    /** Whether to offer the last business day and last weekday entries. Twice a month leaves them out to keep its two dates in a fixed order */
    shouldShowMonthlyOnlyEntries: boolean;

    /** A day that can't be picked because the other twice a month date already uses it */
    unavailableOffset?: AutoReportingOffset;

    /** Called with the picked day when the admin saves */
    onSave: (offset: AutoReportingOffset) => void;
};

function AutoReportingDayOfMonthPicker({policy, routePolicyID, testID, selectedOffset, shouldShowMonthlyOnlyEntries, unavailableOffset, onSave}: AutoReportingDayOfMonthPickerProps) {
    const {translate, toLocaleOrdinal} = useLocalize();
    const [userSelectedOffset, setUserSelectedOffset] = useState<AutoReportingOffset | undefined>();
    const currentOffset = userSelectedOffset ?? selectedOffset;
    // Freeze the day selected when the page opened so it stays pinned to the top for the whole open/focus cycle, even as the live selection changes.
    const initialOffset = useInitialSelection(currentOffset, {resetOnFocus: true});
    const [searchText, setSearchText] = useState('');
    const trimmedText = searchText.trim().toLowerCase();

    const namedOffsets: AutoReportingOffset[] = [
        CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH,
        ...(shouldShowMonthlyOnlyEntries ? [CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH, ...LAST_WEEKDAY_OFFSETS] : []),
    ];
    const offsets: AutoReportingOffset[] = [...Array.from({length: CONST.POLICY.AUTO_REPORTING_MAX_DAY_OF_MONTH}, (value, index) => index + 1), ...namedOffsets];

    const items = offsets.map((offset) => ({
        text: getAutoReportingOffsetDisplayName(offset, translate, toLocaleOrdinal),
        keyForList: String(offset),
        value: String(offset),
        isSelected: offset === currentOffset,
        isDisabled: unavailableOffset !== undefined && areSemiMonthlyOffsetsEqual(offset, unavailableOffset),
    }));

    // Pin the frozen initial day to the top of the full list before search filtering, so it stays pinned while searching.
    const orderedItems = moveInitialSelectionToTop(items, [String(initialOffset)]);
    const filteredItems = orderedItems.filter((item) => item.text.toLowerCase().includes(trimmedText));

    const goBack = () => Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(routePolicyID));

    const save = () => {
        if (currentOffset !== undefined) {
            onSave(currentOffset);
        }
        goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={routePolicyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={testID}
            >
                <FullPageNotFoundView
                    onBackButtonPress={goBackFromInvalidPolicy}
                    onLinkPress={goBackFromInvalidPolicy}
                    shouldShow={isEmptyObject(policy) || !canEditWorkspaceSettings(policy) || isPendingDeletePolicy(policy) || !isGroupPolicy(policy)}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    addBottomSafeAreaPadding
                >
                    <HeaderWithBackButtonAndTitle
                        title={translate('workflowsPage.dayOfTheMonth')}
                        onBackButtonPress={goBack}
                    />
                    <SelectionList
                        data={filteredItems}
                        ListItem={SingleSelectListItem}
                        onSelectRow={(item) => setUserSelectedOffset(parseAutoReportingOffset(item.keyForList))}
                        textInputOptions={{
                            label: translate('common.search'),
                            value: searchText,
                            onChangeText: setSearchText,
                            headerMessage: trimmedText && !filteredItems.length ? translate('common.noResultsFound') : '',
                        }}
                        confirmButtonOptions={{
                            showButton: true,
                            text: translate('common.save'),
                            onConfirm: save,
                            isDisabled: currentOffset === selectedOffset,
                        }}
                        initiallyFocusedItemKey={String(initialOffset)}
                        shouldSingleExecuteRowSelect
                        shouldScrollToFocusedIndexOnMount={false}
                        shouldUpdateFocusedIndex
                        disableMaintainingScrollPosition
                        addBottomSafeAreaPadding
                        showScrollIndicator
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default AutoReportingDayOfMonthPicker;
