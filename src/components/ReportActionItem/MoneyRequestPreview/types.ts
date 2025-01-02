import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import type * as OnyxTypes from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

type MoneyRequestPreviewProps = {
    /** The active IOUReport, used for Onyx subscription */
    // The iouReportID is used inside withOnyx HOC
    // eslint-disable-next-line react/no-unused-prop-types
    iouReportID: string;

    /** The associated chatReport */
    chatReportID: string;

    /** The ID of the current report */
    reportID: string;

    /** Callback for the preview pressed */
    onPreviewPressed: (event?: GestureResponderEvent | KeyboardEvent) => void;

    /** All the data of the action, used for showing context menu */
    action: OnyxTypes.ReportAction;

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor?: ContextMenuAnchor;

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive?: () => void;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

    /** True if this IOU has a type of split */
    isBillSplit: boolean;

    /** Whether this IOU is a track expense */
    isTrackExpense: boolean;

    /** True if the IOU Preview card is hovered */
    isHovered?: boolean;

    /** Whether or not an IOU report contains expenses in a different currency
     * that are either created or cancelled offline, and thus haven't been converted to the report's currency yet
     */
    shouldShowPendingConversionMessage?: boolean;

    /** Whether a message is a whisper */
    isWhisper?: boolean;

    /** Whether  context menu should be shown on press */
    shouldDisplayContextMenu?: boolean;
};

type NoPendingProps = {shouldShow: false};

type PendingProps = {
    /** Whether to show the pending message or not */
    shouldShow: true;

    /** The icon to be displayed if a request is pending */
    messageIcon: IconAsset;

    /** The description to be displayed if a request is pending */
    messageDescription: string;
};

type PendingMessageProps = PendingProps | NoPendingProps;

export type {MoneyRequestPreviewProps, PendingMessageProps};
