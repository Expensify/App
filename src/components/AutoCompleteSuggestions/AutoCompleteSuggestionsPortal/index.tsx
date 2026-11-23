import BaseAutoCompleteSuggestions from '@components/AutoCompleteSuggestions/BaseAutoCompleteSuggestions';
import FSClassView from '@components/FSClassView';
import FSClassContext from '@components/FSClassView/FSClassContext';

import useStyleUtils from '@hooks/useStyleUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ReactElement} from 'react';

import React, {useContext} from 'react';
import ReactDOM from 'react-dom';

import type {AutoCompleteSuggestionsPortalProps} from './types';

import getBottomSuggestionPadding from './getBottomSuggestionPadding';
import TransparentOverlay from './TransparentOverlay/TransparentOverlay';

const zIndexStyle = {zIndex: variables.autoCompleteSuggestionsZIndex};

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
    isMenuAbove = false,
    ...props
}: AutoCompleteSuggestionsPortalProps<TSuggestion>): ReactElement | null | false {
    const StyleUtils = useStyleUtils();
    // The portal renders on <body>, outside the masked views of the chat that opened it, so it applies the chat's class itself
    const fsClass = useContext(FSClassContext);

    const bodyElement = document.querySelector('body');

    const componentToRender = (
        <BaseAutoCompleteSuggestions<TSuggestion>
            width={width}
            {...props}
        />
    );

    return (
        !!width &&
        bodyElement &&
        ReactDOM.createPortal(
            <>
                <TransparentOverlay
                    onPress={resetSuggestions}
                    sentryLabel={CONST.SENTRY_LABEL.BASE_AUTO_COMPLETE_SUGGESTIONS.OVERLAY}
                    style={zIndexStyle}
                />
                <FSClassView
                    style={[StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({left, width, bottom: bottom - getBottomSuggestionPadding(isMenuAbove)}), zIndexStyle]}
                    forwardedFSClass={fsClass}
                >
                    {componentToRender}
                </FSClassView>
            </>,
            bodyElement,
        )
    );
}

export default AutoCompleteSuggestionsPortal;
export type {AutoCompleteSuggestionsPortalProps};
