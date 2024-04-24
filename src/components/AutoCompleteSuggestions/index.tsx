import React from 'react';
import ReactDOM from 'react-dom';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import type {AutoCompleteSuggestionsProps} from './types';

function AutoCompleteSuggestions<TSuggestion>({measureParentContainer = () => {}, ...props}: AutoCompleteSuggestionsProps<TSuggestion>) {
    const StyleUtils = useStyleUtils();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const [{width, left, bottom}, setContainerState] = React.useState({
        width: 0,
        left: 0,
        bottom: 0,
    });

    React.useEffect(() => {
        if (!measureParentContainer) {
            return;
        }
        measureParentContainer((x, y, w) => setContainerState({left: x, bottom: windowHeight - y, width: w}));
    }, [measureParentContainer, windowHeight, windowWidth]);

    const componentToRender = (
        <BaseAutoCompleteSuggestions<TSuggestion>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );

    const bodyElement = document.querySelector('body');

    return (
        !!width && bodyElement && ReactDOM.createPortal(<View style={StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({left, width, bottom})}>{componentToRender}</View>, bodyElement)
    );
}

AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
