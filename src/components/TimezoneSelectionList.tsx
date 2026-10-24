import useInitialValue from '@hooks/useInitialValue';
import useLocalize from '@hooks/useLocalize';

import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';

import TIMEZONES from '@src/TIMEZONES';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

import React, {useState} from 'react';

import SelectionList from './SelectionList';
import SingleSelectListItem from './SelectionList/ListItem/SingleSelectListItem';

type TimezoneSelectionListProps = {
    /** The saved timezone, pinned to the top and preselected */
    savedTimezone: string | undefined;

    /** Called with the picked timezone when Save is pressed */
    onSave: (timezone: SelectedTimezone | undefined) => void;

    /** Whether the list can't be changed */
    isDisabled?: boolean;
};

/**
 * We add the current time to the key to fix a bug where the list options don't update unless the key is updated.
 */
const getKey = (text: string): string => `${text}-${new Date().getTime()}`;

const isSelectedTimezone = (value: string | undefined): value is SelectedTimezone => TIMEZONES.some((timezone) => timezone === value);

function TimezoneSelectionList({savedTimezone, onSave, isDisabled = false}: TimezoneSelectionListProps) {
    const {translate} = useLocalize();
    const allTimezones = useInitialValue(() => {
        const options = TIMEZONES.filter((tz: string) => !tz.startsWith('Etc/GMT')).map((text: string) => ({
            text,
            value: text,
            keyForList: getKey(text),
            isSelected: text === savedTimezone,
        }));
        // Move the currently-selected timezone to the top so it's visible without scrolling when the page opens.
        return moveInitialSelectionToTop(options, savedTimezone ? [savedTimezone] : []);
    });
    const [timezoneInputText, setTimezoneInputText] = useState('');
    const [timezoneOptions, setTimezoneOptions] = useState(allTimezones);

    const [selectedTimezone, setSelectedTimezone] = useState<SelectedTimezone>();
    const currentSelectedTimezone = selectedTimezone ?? (isSelectedTimezone(savedTimezone) ? savedTimezone : undefined);

    const timezoneData = timezoneOptions.map((tz) => ({...tz, isSelected: tz.text === currentSelectedTimezone}));

    const filterShownTimezones = (searchText: string) => {
        setTimezoneInputText(searchText);
        const searchWords = searchText.toLowerCase().match(/[a-z0-9]+/g) ?? [];
        setTimezoneOptions(
            allTimezones.filter((tz) =>
                searchWords.every((word) =>
                    tz.text
                        .toLowerCase()
                        .replaceAll(/[^a-z0-9]/g, ' ')
                        .includes(word),
                ),
            ),
        );
    };

    return (
        <SelectionList
            data={timezoneData}
            ListItem={SingleSelectListItem}
            onSelectRow={({text}) => {
                if (!isSelectedTimezone(text)) {
                    return;
                }
                setSelectedTimezone(text);
            }}
            textInputOptions={{
                headerMessage: timezoneInputText.trim() && !timezoneOptions.length ? translate('common.noResultsFound') : '',
                label: translate('timezonePage.timezone'),
                value: timezoneInputText,
                onChangeText: filterShownTimezones,
            }}
            confirmButtonOptions={{
                showButton: true,
                text: translate('common.save'),
                onConfirm: () => onSave(currentSelectedTimezone),
                isDisabled: isDisabled || currentSelectedTimezone === savedTimezone,
            }}
            initiallyFocusedItemKey={timezoneOptions.find((tz) => tz.text === savedTimezone)?.keyForList}
            isDisabled={isDisabled}
            shouldShowTooltips={false}
            shouldSingleExecuteRowSelect
            showScrollIndicator
            addBottomSafeAreaPadding
        />
    );
}

export default TimezoneSelectionList;
