import {Portal} from '@gorhom/portal';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import BaseAutoCompleteSuggestions from '@components/AutoCompleteSuggestions/BaseAutoCompleteSuggestions';
import useStyleUtils from '@hooks/useStyleUtils';
import getBottomSuggestionPadding from './getBottomSuggestionPadding';
import type {AutoCompleteSuggestionsPortalProps} from './types';

function AutoCompleteSuggestionsPortal<TSuggestion>({left = 0, width = 0, bottom = 0, ...props}: AutoCompleteSuggestionsPortalProps<TSuggestion>) {
    const StyleUtils = useStyleUtils();
    const styles = useMemo(() => StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({left, width, bottom: bottom + getBottomSuggestionPadding()}), [StyleUtils, left, width, bottom]);

    if (!width) {
        return null;
    }

    return (
        <Portal hostName="suggestions">
            <View style={styles}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <BaseAutoCompleteSuggestions<TSuggestion>
                    width={width}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                />
            </View>
        </Portal>
    );
}

AutoCompleteSuggestionsPortal.displayName = 'AutoCompleteSuggestionsPortal';

export default AutoCompleteSuggestionsPortal;
