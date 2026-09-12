import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

import type {ListItem} from './SelectionList/ListItem/types';

import SingleSelectListItem from './SelectionList/ListItem/SingleSelectListItem';

type WorkArrangementOption = ListItem<ValueOf<typeof CONST.POLICY.WORK_ARRANGEMENT>>;

type WorkArrangementSelectorProps = {
    /** Whether the office-based arrangement is selected, or undefined when nothing has been chosen yet */
    isOffice: boolean | undefined;

    /** Called with the newly selected arrangement */
    onSelect: (isOffice: boolean) => void;

    /**
     * Whether the option descriptions should describe the workspace-wide default ("most members work
     * remotely...") rather than a single member ("member works remotely...").
     */
    shouldDescribeMostMembers?: boolean;
};

/**
 * The two work arrangement options, shared by the workspace work arrangement page and the prompt shown when
 * an admin first enables the home-and-office commuter exclusion method.
 */
function WorkArrangementSelector({isOffice, onSelect, shouldDescribeMostMembers = false}: WorkArrangementSelectorProps) {
    const {translate} = useLocalize();

    const options: WorkArrangementOption[] = [
        {
            text: translate('workspace.distanceRates.commuterExclusions.workArrangement.officeBasedTitle'),
            alternateText: translate(
                shouldDescribeMostMembers
                    ? 'workspace.distanceRates.commuterExclusions.workArrangement.startingPrompt.officeBasedHelp'
                    : 'workspace.distanceRates.commuterExclusions.workArrangement.officeBasedHelp',
            ),
            keyForList: CONST.POLICY.WORK_ARRANGEMENT.OFFICE_BASED,
            isSelected: isOffice === true,
        },
        {
            text: translate('workspace.distanceRates.commuterExclusions.workArrangement.noRegularWorkplaceTitle'),
            alternateText: translate(
                shouldDescribeMostMembers
                    ? 'workspace.distanceRates.commuterExclusions.workArrangement.startingPrompt.noRegularWorkplaceHelp'
                    : 'workspace.distanceRates.commuterExclusions.workArrangement.noRegularWorkplaceHelp',
            ),
            keyForList: CONST.POLICY.WORK_ARRANGEMENT.NO_REGULAR_WORKPLACE,
            isSelected: isOffice === false,
        },
    ];

    // The rows are rendered directly instead of through SelectionList so the same component can sit inside a
    // modal, where a virtualized list has no height to measure against.
    return (
        <View>
            {options.map((option) => (
                <SingleSelectListItem
                    key={option.keyForList}
                    item={option}
                    showTooltip={false}
                    onSelectRow={() => onSelect(option.keyForList === CONST.POLICY.WORK_ARRANGEMENT.OFFICE_BASED)}
                    isAlternateTextMultilineSupported
                    alternateTextNumberOfLines={3}
                />
            ))}
        </View>
    );
}

export default WorkArrangementSelector;
