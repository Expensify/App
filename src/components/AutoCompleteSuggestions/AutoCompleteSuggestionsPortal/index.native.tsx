import {Portal} from '@gorhom/portal';
import React, { useMemo } from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import BaseAutoCompleteSuggestions from '../BaseAutoCompleteSuggestions';
import type {AutoCompleteSuggestionsProps} from './types';

function AutoCompleteSuggestionsPortal<TSuggestion>({left, width, bottom, ...props}: AutoCompleteSuggestionsProps<TSuggestion>) {
    const StyleUtils = useStyleUtils();
    const styles = useMemo(() => StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({left, width, bottom: bottom + 8}), [StyleUtils, left, width, bottom]);

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
