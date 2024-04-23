import {Portal} from '@gorhom/portal';
import React from 'react';
import {useSuggestionsContext} from '@pages/home/report/ReportActionCompose/ComposerWithSuggestionsEdit/SuggestionsContext';
import CONST from '@src/CONST';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import type {AutoCompleteSuggestionsProps} from './types';

function AutoCompleteSuggestions<TSuggestion>({measureParentContainer, ...props}: AutoCompleteSuggestionsProps<TSuggestion>) {
    const {activeID} = useSuggestionsContext();
    return (
        <Portal hostName={activeID ? `suggestions_${activeID}` : CONST.DEFAULT_COMPOSER_PORTAL_HOST_NAME}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <BaseAutoCompleteSuggestions<TSuggestion> {...props} />
        </Portal>
    );
}

AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
