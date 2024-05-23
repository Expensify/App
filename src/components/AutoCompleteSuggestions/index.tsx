import React from 'react';
import ReactDOM from 'react-dom';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {measureSuggestionsContainerHeight} from '@libs/SuggestionUtils';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import type {AutoCompleteSuggestionsProps} from './types';

function AutoCompleteSuggestions<TSuggestion>({measureParentContainer = () => {}, ...props}: AutoCompleteSuggestionsProps<TSuggestion>) {
    const StyleUtils = useStyleUtils();
    const [shouldShowBelowContainer, setShouldShowBelowContainer] = React.useState(false);
    const suggestionsContainerHeight = measureSuggestionsContainerHeight(props.suggestions.length, props.isSuggestionPickerLarge);
    const {windowHeight, windowWidth} = useWindowDimensions();
    const [{width, left, bottom}, setContainerState] = React.useState({
        width: 0,
        left: 0,
        bottom: 0,
    });

    React.useEffect(() => {
        measureParentContainer((x, y, w, h) => {
            const currentBottom = y < suggestionsContainerHeight ? windowHeight - y - suggestionsContainerHeight - h : windowHeight - y;
            setShouldShowBelowContainer(y < suggestionsContainerHeight);
            setContainerState({left: x, bottom: currentBottom, width: w});
        });
    }, [measureParentContainer, windowHeight, windowWidth, suggestionsContainerHeight]);

    const componentToRender = (
        <BaseAutoCompleteSuggestions<TSuggestion>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            shouldBeDisplayedBelowParentContainer={shouldShowBelowContainer}
        />
    );

    const bodyElement = document.querySelector('body');

    return (
        !!width && bodyElement && ReactDOM.createPortal(<View style={StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({left, width, bottom})}>{componentToRender}</View>, bodyElement)
    );
}

AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
