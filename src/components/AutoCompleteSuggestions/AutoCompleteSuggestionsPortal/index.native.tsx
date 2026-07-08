import BaseAutoCompleteSuggestions from '@components/AutoCompleteSuggestions/BaseAutoCompleteSuggestions';

import useStyleUtils from '@hooks/useStyleUtils';

import {Portal} from '@gorhom/portal';
import React, {useMemo} from 'react';
import {View} from 'react-native';

import type {AutoCompleteSuggestionsPortalProps} from './types';

import getBottomSuggestionPadding from './getBottomSuggestionPadding';
import TransparentOverlay from './TransparentOverlay/TransparentOverlay';

function AutoCompleteSuggestionsPortal<TSuggestion>({
    left = 0,
    width = 0,
    bottom = 0,
    resetSuggestions = () => {},
    isInLandscapeMode = false,
    ...props
}: AutoCompleteSuggestionsPortalProps<TSuggestion>) {
    const StyleUtils = useStyleUtils();
    const bottomPadding = getBottomSuggestionPadding(bottom, isInLandscapeMode);
    const styles = useMemo(() => StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({left, width, bottom: bottom + bottomPadding}), [StyleUtils, left, width, bottom, bottomPadding]);

    if (!width) {
        return null;
    }

    return (
        <Portal hostName="suggestions">
            <TransparentOverlay onPress={resetSuggestions} />
            <View style={styles}>
                <BaseAutoCompleteSuggestions<TSuggestion>
                    width={width}
                    {...props}
                />
            </View>
        </Portal>
    );
}

export default AutoCompleteSuggestionsPortal;
