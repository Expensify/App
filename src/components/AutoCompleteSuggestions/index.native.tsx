import {Portal} from '@gorhom/portal';
import React, {useEffect, useState} from 'react';
import {measureSuggestionsContainerHeight} from '@libs/SuggestionUtils';
import {useSuggestionsContext} from '@pages/home/report/ReportActionCompose/ComposerWithSuggestionsEdit/SuggestionsContext';
import CONST from '@src/CONST';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import type {AutoCompleteSuggestionsProps} from './types';

function AutoCompleteSuggestions<TSuggestion>({measureParentContainer, ...props}: AutoCompleteSuggestionsProps<TSuggestion>) {
    const {activeID} = useSuggestionsContext();
    const [shouldShowBelowContainer, setShouldShowBelowContainer] = React.useState(false);
    const suggestionsContainerHeight = measureSuggestionsContainerHeight(props.suggestions.length, props.isSuggestionPickerLarge);
    const [shouldShow, setShouldShow] = useState(false);
    const [containerHeight, setContainerHeight] = useState(0);

    useEffect(() => {
        if (!measureParentContainer) {
            return;
        }
        measureParentContainer((_x, y, _w, h, _px, py) => {
            setShouldShowBelowContainer(y + (py ?? 0) < suggestionsContainerHeight);
            setShouldShow(true);
            setContainerHeight(h);
        });
    }, [measureParentContainer, suggestionsContainerHeight]);

    if (!shouldShow) {
        return null;
    }

    return (
        <Portal hostName={activeID ? `suggestions_${activeID}` : CONST.DEFAULT_COMPOSER_PORTAL_HOST_NAME}>
            <BaseAutoCompleteSuggestions<TSuggestion>
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                shouldBeDisplayedBelowParentContainer={shouldShowBelowContainer}
                containerHeight={containerHeight}
            />
        </Portal>
    );
}

AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
