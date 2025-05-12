import React, {useCallback, useState} from 'react';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import CalendarView from './CalendarView';
import RootView from './RootView';

type DateSelectPopupValue = Record<ValueOf<typeof CONST.SEARCH.DATE_FILTERS>, string | null>;

type DateSelectPopupProps = {
    /** The current value of the date */
    value: DateSelectPopupValue;

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to call when changes are applied */
    onChange: (value: DateSelectPopupValue) => void;
};

function DateSelectPopup({value, closeOverlay, onChange}: DateSelectPopupProps) {
    const [localDateValues, setLocalDateValues] = useState(value);
    const [view, setView] = useState<ValueOf<typeof CONST.SEARCH.DATE_FILTERS> | null>(null);

    const setDateValue = (key: ValueOf<typeof CONST.SEARCH.DATE_FILTERS>, dateValue: string | null) => {
        setLocalDateValues((currentValue) => {
            return {
                ...currentValue,
                [key]: dateValue,
            };
        });
    };

    const navigateToRootView = useCallback(() => {
        setView(null);
    }, []);

    const resetChanges = useCallback(() => {
        // Reset each field back to null
        setLocalDateValues((prev) => {
            return Object.fromEntries(Object.entries(prev).map(([key]) => [key, null])) as DateSelectPopupValue;
        });
    }, []);

    const applyChanges = useCallback(() => {
        closeOverlay();
        onChange(localDateValues);
    }, [closeOverlay, localDateValues, onChange]);

    if (!view) {
        return (
            <RootView
                value={localDateValues}
                applyChanges={applyChanges}
                resetChanges={resetChanges}
                setView={setView}
            />
        );
    }

    return (
        <CalendarView
            view={view}
            value={localDateValues[view]}
            navigateBack={navigateToRootView}
            setValue={setDateValue}
        />
    );
}

DateSelectPopup.displayName = 'DateSelectPopup';
export type {DateSelectPopupValue};
export default DateSelectPopup;
