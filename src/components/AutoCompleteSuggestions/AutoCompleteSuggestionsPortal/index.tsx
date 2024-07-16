import React from 'react';
import type {ReactElement} from 'react';
import ReactDOM from 'react-dom';
import {View} from 'react-native';
import BaseAutoCompleteSuggestions from '@components/AutoCompleteSuggestions/BaseAutoCompleteSuggestions';
import useStyleUtils from '@hooks/useStyleUtils';
import getBottomSuggestionPadding from './getBottomSuggestionPadding';
import TransparentOverlay from './TransparentOverlay/TransparentOverlay';
import type {AutoCompleteSuggestionsPortalProps} from './types';

/**
 * On the mobile-web platform, when long-pressing on auto-complete suggestions,
 * we need to prevent focus shifting to avoid blurring the main input (which makes the suggestions picker close and fires the onSelect callback).
 * The desired pattern for all platforms is to do nothing on long-press.
 * On the native platform, tapping on auto-complete suggestions will not blur the main input.
 */

function AutoCompleteSuggestionsPortal<TSuggestion>({
    left = 0,
    width = 0,
    bottom = 0,
    resetSuggestions = () => {},
    ...props
}: AutoCompleteSuggestionsPortalProps<TSuggestion>): ReactElement | null | false {
    const StyleUtils = useStyleUtils();

    const bodyElement = document.querySelector('body');

    const componentToRender = (
        <BaseAutoCompleteSuggestions<TSuggestion>
            width={width}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );

    return (
        !!width &&
        bodyElement &&
        ReactDOM.createPortal(
            <>
                <TransparentOverlay resetSuggestions={resetSuggestions} />
                <View style={StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({left, width, bottom: bottom - getBottomSuggestionPadding()})}>{componentToRender}</View>
            </>,
            bodyElement,
        )
    );
}

AutoCompleteSuggestionsPortal.displayName = 'AutoCompleteSuggestionsPortal';

export default AutoCompleteSuggestionsPortal;
export type {AutoCompleteSuggestionsPortalProps};
