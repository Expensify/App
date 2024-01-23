import React, {useRef, useMemo} from 'react';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import {defaultProps, propTypes} from './composerWithSuggestionsProps';

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
    ...props}, ref) => {

    const textInputRef = useRef(null);
    const modal = props.modal;

    const isEmptyChat = useMemo(() => _.size(reportActions) === 1, [reportActions]);
    const parentReportAction = lodashGet(parentReportActions, [report.parentReportActionID]);
    const shouldAutoFocus = !modal.isVisible && (shouldFocusInputOnScreenFocus || (isEmptyChat && !ReportActionsUtils.isTransactionThread(parentReportAction))) && shouldShowComposeInput;

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ComposerWithSuggestions ref={ref} {...props} textInputRef={textInputRef} reportActions={reportActions} report={report} shouldAutoFocus={shouldAutoFocus} />;
});

ComposerWithSuggestionsWithFocus.displayName = 'ComposerWithSuggestionsWithRefAndFocus';
ComposerWithSuggestionsWithFocus.propTypes = propTypes;
ComposerWithSuggestionsWithFocus.defaultProps = defaultProps;

export default ComposerWithSuggestionsWithFocus;
