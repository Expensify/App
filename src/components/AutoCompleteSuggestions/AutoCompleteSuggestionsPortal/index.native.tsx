import {Portal} from '@gorhom/portal';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import BaseAutoCompleteSuggestions from '@components/AutoCompleteSuggestions/BaseAutoCompleteSuggestions';
import useStyleUtils from '@hooks/useStyleUtils';
import getBottomSuggestionPadding from './getBottomSuggestionPadding';
import TransparentOverlay from './TransparentOverlay/TransparentOverlay';
import type {AutoCompleteSuggestionsPortalProps} from './types';

function AutoCompleteSuggestionsPortal<TSuggestion>({left = 0, width = 0, bottom = 0, resetSuggestions = () => {}, ...props}: AutoCompleteSuggestionsPortalProps<TSuggestion>) {
    const StyleUtils = useStyleUtils();
    const bottomPadding = getBottomSuggestionPadding(bottom);
    const styles = useMemo(() => StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({left, width, bottom: bottom + bottomPadding}), [StyleUtils, left, width, bottom, bottomPadding]);

    if (!width) {
        return null;
    }

    return (
        <Portal hostName="suggestions">
            <TransparentOverlay onPress={resetSuggestions} />
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

export default AutoCompleteSuggestionsPortal;
