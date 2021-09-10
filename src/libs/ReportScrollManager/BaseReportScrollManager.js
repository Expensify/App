import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';

// This ref is created using React.createRef here because this function is used by a component that doesn't have access
// to the original ref.
const flatListRef = React.createRef();

/**
 * Scroll to the bottom of the FlatList.
 *
 */
function scrollToBottom() {
    if (flatListRef.current) {
        flatListRef.current.scrollToOffset({animated: false, offset: 0});
    }
}

/**
 * Scroll to a given index in the FlatList.
 *
 * @param {Object} params – Mirrors the params taken by RN's FlatList.scrollToIndex
 */
function baseScrollToIndex(params) {
    if (!_.isFinite(lodashGet(params, 'index')) || lodashGet(params, 'index') < 0) {
        console.debug('[ReportScrollManager] Attempting to scroll to invalid index in FlatList', params.index);
        return;
    }

    flatListRef.current.scrollToIndex(params);
}

export {
    flatListRef,
    scrollToBottom,
    baseScrollToIndex,
};
