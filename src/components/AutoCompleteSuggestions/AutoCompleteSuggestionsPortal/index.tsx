import React from 'react';
import type {ReactElement} from 'react';
import ReactDOM from 'react-dom';
import {View} from 'react-native';
// import BaseAutoCompleteSuggestions from '../BaseAutoCompleteSuggestions';
import BaseAutoCompleteSuggestions from '@components/AutoCompleteSuggestions/BaseAutoCompleteSuggestions';
// import type {AutoCompleteSuggestionsProps} from '../types';
import type {AutoCompleteSuggestionsProps} from '@components/AutoCompleteSuggestions/types';
import useStyleUtils from '@hooks/useStyleUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';

/**
 * On the mobile-web platform, when long-pressing on auto-complete suggestions,
 * we need to prevent focus shifting to avoid blurring the main input (which makes the suggestions picker close and fires the onSelect callback).
 * The desired pattern for all platforms is to do nothing on long-press.
 * On the native platform, tapping on auto-complete suggestions will not blur the main input.
 */

type ExternalProps<TSuggestion> = Omit<AutoCompleteSuggestionsProps<TSuggestion>, 'measureParentContainerAndReportCursor'>;

type AutoCompleteSuggestionsPortalProps<TSuggestion> = ExternalProps<TSuggestion> & {
    left: number;
    width: number;
    bottom: number;
    measuredHeightOfSuggestionRows: number;
};

function AutoCompleteSuggestionsPortal<TSuggestion>({left = 0, width = 0, bottom = 0, ...props}: AutoCompleteSuggestionsPortalProps<TSuggestion>): ReactElement | null | false {
    const StyleUtils = useStyleUtils();
    const containerRef = React.useRef<HTMLDivElement>(null);

    const bodyElement = document.querySelector('body');

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return () => {};
        }
        container.onpointerdown = (e) => {
            if (DeviceCapabilities.hasHoverSupport()) {
                return;
            }
            e.preventDefault();
        };
        return () => (container.onpointerdown = null);
    }, []);

    const componentToRender = (
        <BaseAutoCompleteSuggestions<TSuggestion>
            width={width}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={containerRef}
        />
    );

    return (
        !!width &&
        bodyElement &&
        ReactDOM.createPortal(<View style={StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({left, width, bottom: bottom - 8})}>{componentToRender}</View>, bodyElement)
    );
}

AutoCompleteSuggestionsPortal.displayName = 'AutoCompleteSuggestionsPortal';

export default AutoCompleteSuggestionsPortal;
export type {AutoCompleteSuggestionsPortalProps};
