import PropTypes from 'prop-types';
import refPropTypes from '@components/refPropTypes';
import transactionPropTypes from '@components/transactionPropTypes';
import {transactionViolationsPropType} from '@libs/Violations/propTypes';
import walletTermsPropTypes from '@pages/EnablePayments/walletTermsPropTypes';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import iouReportPropTypes from '@pages/iouReportPropTypes';
import reportPropTypes from '@pages/reportPropTypes';

const propTypes = {
    /** The active IOUReport, used for Onyx subscription */
    // eslint-disable-next-line react/no-unused-prop-types
    iouReportID: PropTypes.string.isRequired,

    /** The associated chatReport */
    chatReportID: PropTypes.string.isRequired,

    /** Callback for the preview pressed */
    onPreviewPressed: PropTypes.func,

    /** All the data of the action, used for showing context menu */
    action: PropTypes.shape(reportActionPropTypes),

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor: refPropTypes,

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive: PropTypes.func,

    /** Extra styles to pass to View wrapper */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /* Onyx Props */

    /** chatReport associated with iouReport */
    chatReport: reportPropTypes,

    /** IOU report data object */
    iouReport: iouReportPropTypes,

    /** True if this is this IOU is a split instead of a 1:1 request */
    isBillSplit: PropTypes.bool.isRequired,

    /** True if the IOU Preview card is hovered */
    isHovered: PropTypes.bool,

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(
        PropTypes.shape({
            /** This is either the user's full name, or their login if full name is an empty string */
            displayName: PropTypes.string,
        }),
    ),

    /** The transaction attached to the action.message.iouTransactionID */
    transaction: transactionPropTypes,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    /** Information about the user accepting the terms for payments */
    walletTerms: walletTermsPropTypes,

    /** Whether or not an IOU report contains money requests in a different currency
     * that are either created or cancelled offline, and thus haven't been converted to the report's currency yet
     */
    shouldShowPendingConversionMessage: PropTypes.bool,

    /** Whether a message is a whisper */
    isWhisper: PropTypes.bool,

    /** All transactionViolations */
    transactionViolations: transactionViolationsPropType,
};

const defaultProps = {
    iouReport: {},
    onPreviewPressed: null,
    action: undefined,
    contextMenuAnchor: undefined,
    checkIfContextMenuActive: () => {},
    containerStyles: [],
    walletTerms: {},
    chatReport: {},
    isHovered: false,
    personalDetails: {},
    session: {
        email: null,
    },
    transaction: {},
    shouldShowPendingConversionMessage: false,
    isWhisper: false,
    transactionViolations: {},
};

export default {
    propTypes,
    defaultProps,
};
