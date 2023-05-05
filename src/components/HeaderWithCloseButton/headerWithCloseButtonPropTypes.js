import PropTypes from 'prop-types';
import {ThreeDotsMenuItemPropTypes} from '../ThreeDotsMenu';
import {withLocalizePropTypes} from '../withLocalize';
import {withDelayToggleButtonStatePropTypes} from '../withDelayToggleButtonState';
import {keyboardStatePropTypes} from '../withKeyboardState';
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

    /** Whether we should show a back icon */
    shouldShowBackButton: PropTypes.bool,

    /** Whether we should show a border on the bottom of the Header */
    shouldShowBorderBottom: PropTypes.bool,

    /** Whether we should show a download button */
    shouldShowDownloadButton: PropTypes.bool,

    /** Whether we should show a get assistance (question mark) button */
    shouldShowGetAssistanceButton: PropTypes.bool,

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

    /** Whether we should show the step counter */
    shouldShowStepCounter: PropTypes.bool,

    /** The guides call taskID to associate with the get assistance button, if we show it */
    guidesCallTaskID: PropTypes.string,

    /** Data to display a step counter in the header */
    stepCounter: PropTypes.shape({
        step: PropTypes.number,
        total: PropTypes.number,
    }),

    /** The background color to apply in the header */
    backgroundColor: PropTypes.string,

    /** Whether we should show an avatar */
    shouldShowAvatarWithDisplay: PropTypes.bool,

    /** Report, if we're showing the details for one and using AvatarWithDisplay */
    report: iouReportPropTypes,

    /** Policies, if we're showing the details for a report and need info about it for AvatarWithDisplay */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }),

    /** Policies, if we're showing the details for a report and need participant details for AvatarWithDisplay */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** Additional styles to render on the container of this component */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,
    ...withDelayToggleButtonStatePropTypes,
    ...keyboardStatePropTypes,
};

const defaultProps = {
    title: '',
    subtitle: '',
    onDownloadButtonPress: () => {},
    onCloseButtonPress: () => {},
    onBackButtonPress: () => {},
    onThreeDotsButtonPress: () => {},
    shouldShowBackButton: false,
    shouldShowBorderBottom: false,
    shouldShowDownloadButton: false,
    shouldShowGetAssistanceButton: false,
    shouldShowThreeDotsButton: false,
    shouldShowCloseButton: true,
    shouldShowStepCounter: true,
    guidesCallTaskID: '',
    stepCounter: null,
    threeDotsMenuItems: [],
    threeDotsAnchorPosition: {
        top: 0,
        left: 0,
    },
    backgroundColor: undefined,
};

export {
    propTypes,
    defaultProps,
};
