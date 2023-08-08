import PropTypes from 'prop-types';
import {ThreeDotsMenuItemPropTypes} from '../ThreeDotsMenu';
import iouReportPropTypes from '../../pages/iouReportPropTypes';
import participantPropTypes from '../participantPropTypes';

const propTypes = {
    /** Title of the Header */
    title: PropTypes.string,

    /** Subtitle of the header */
    subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

    /** Method to trigger when pressing download button of the header */
    onDownloadButtonPress: PropTypes.func,

    /** Method to trigger when pressing close button of the header */
    onCloseButtonPress: PropTypes.func,

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func,

    /** Method to trigger when pressing more options button of the header */
    onThreeDotsButtonPress: PropTypes.func,

    /** Whether we should show a border on the bottom of the Header */
    shouldShowBorderBottom: PropTypes.bool,

    /** Whether we should show a download button */
    shouldShowDownloadButton: PropTypes.bool,

    /** Whether we should show a get assistance (question mark) button */
    shouldShowGetAssistanceButton: PropTypes.bool,

    /** Whether we should show a pin button */
    shouldShowPinButton: PropTypes.bool,

    /** Whether we should show a more options (threedots) button */
    shouldShowThreeDotsButton: PropTypes.bool,

    /** List of menu items for more(three dots) menu */
    threeDotsMenuItems: ThreeDotsMenuItemPropTypes,

    /** The anchor position of the menu */
    threeDotsAnchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),

    /** Whether we should show a close button */
    shouldShowCloseButton: PropTypes.bool,

    /** Whether we should show a back button */
    shouldShowBackButton: PropTypes.bool,

    /** The guides call taskID to associate with the get assistance button, if we show it */
    guidesCallTaskID: PropTypes.string,

    /** Data to display a step counter in the header */
    stepCounter: PropTypes.shape({
        step: PropTypes.number,
        total: PropTypes.number,
        text: PropTypes.string,
    }),

    /** Whether we should show an avatar */
    shouldShowAvatarWithDisplay: PropTypes.bool,

    /** Parent report, if provided it will override props.report for AvatarWithDisplay */
    parentReport: iouReportPropTypes,

    /** Report, if we're showing the details for one and using AvatarWithDisplay */
    report: iouReportPropTypes,

    /** Policies, if we're showing the details for a report and need info about it for AvatarWithDisplay */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }),

    /** Policies, if we're showing the details for a report and need participant details for AvatarWithDisplay */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** Children to wrap in Header */
    children: PropTypes.node,
};

export default propTypes;
