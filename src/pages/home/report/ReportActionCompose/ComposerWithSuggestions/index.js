import {useIsFocused} from '@react-navigation/native';
import {withOnyx} from 'react-native-onyx';
import React, {useEffect, useCallback, useRef, useMemo} from 'react';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import usePrevious from '@hooks/usePrevious';
import * as InputFocus from '@userActions/InputFocus';
import ONYXKEYS from '@src/ONYXKEYS';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import willBlurTextInputOnTapOutsideFunc from '@libs/willBlurTextInputOnTapOutside';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import {defaultProps, propTypes} from './composerWithSuggestionsProps';

const willBlurTextInputOnTapOutside = willBlurTextInputOnTapOutsideFunc();

// We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
// prevent auto focus on existing chat for mobile device
const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

const ComposerWithSuggestionsWithFocus = React.forwardRef(({
    isNextModalWillOpenRef,
    editFocused,
    shouldShowComposeInput,
    reportActions,
    parentReportActions,
    report,
    ...props
}, ref) => {
    const modal = props.modal;

    const textInputRef = useRef(null);
    const isEmptyChat = useMemo(() => _.size(reportActions) === 1, [reportActions]);
    const parentReportAction = lodashGet(parentReportActions, [report.parentReportActionID]);

    /**
     * Focus the composer text input
     * @param {Boolean} [shouldDelay=false] Impose delay before focusing the composer
     * @memberof ReportActionCompose
     */
    const focus = useCallback((shouldDelay = false) => {
        focusComposerWithDelay(textInputRef.current)(shouldDelay);
    }, []);

    const shouldAutoFocus = !modal.isVisible && (shouldFocusInputOnScreenFocus || (isEmptyChat && !ReportActionsUtils.isTransactionThread(parentReportAction))) && shouldShowComposeInput;
    const isFocused = useIsFocused();
    const prevIsModalVisible = usePrevious(modal.isVisible);
    const prevIsFocused = usePrevious(isFocused);
    useEffect(() => {
        if (modal.isVisible && !prevIsModalVisible) {
            // eslint-disable-next-line no-param-reassign
            isNextModalWillOpenRef.current = false;
        }
        // We want to focus or refocus the input when a modal has been closed or the underlying screen is refocused.
        // We avoid doing this on native platforms since the software keyboard popping
        // open creates a jarring and broken UX.
        if (!((willBlurTextInputOnTapOutside || shouldAutoFocus) && !isNextModalWillOpenRef.current && !modal.isVisible && isFocused && (prevIsModalVisible || !prevIsFocused))) {
            return;
        }

        if (editFocused) {
            InputFocus.inputFocusChange(false);
            return;
        }
        focus(true);
    }, [focus, prevIsFocused, editFocused, prevIsModalVisible, isFocused, modal.isVisible, isNextModalWillOpenRef, shouldAutoFocus]);

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ComposerWithSuggestions ref={ref} {...props} textInputRef={textInputRef} reportActions={reportActions} report={report} shouldAutoFocus={shouldAutoFocus}/>;
})

ComposerWithSuggestionsWithFocus.displayName = 'ComposerWithSuggestionsWithRefAndFocus';
ComposerWithSuggestionsWithFocus.propTypes = propTypes;
ComposerWithSuggestionsWithFocus.defaultProps = defaultProps;

export default withOnyx({
    editFocused: {
        key: ONYXKEYS.INPUT_FOCUSED,
    }
})(ComposerWithSuggestionsWithFocus);
