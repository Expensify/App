import lodashIsEmpty from 'lodash/isEmpty';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import MoneyRequestPreviewContent from './MoneyRequestPreviewContent';
import type {MoneyRequestPreviewProps} from './types';

function MoneyRequestPreview(props: MoneyRequestPreviewProps) {
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${props.iouReportID}`);
    // We should not render the component if there is no iouReport and it's not a split or track expense.
    // Moved outside of the component scope to allow for easier use of hooks in the main component.
    // eslint-disable-next-line react/jsx-props-no-spreading
    return lodashIsEmpty(iouReport) && !(props.isBillSplit || props.isTrackExpense) ? null : <MoneyRequestPreviewContent {...props} />;
}

MoneyRequestPreview.displayName = 'MoneyRequestPreview';

export default MoneyRequestPreview;
