import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';

const propTypes = {
    // styles of the title
    style: PropTypes.arrayOf(PropTypes.any),

    // lines before wrapping
    numberOfLines: PropTypes.number,

    // Is tooltip needed?
    // When true, triggers complex title rendering
    tooltipEnabled: PropTypes.bool,

    // Styles for the tooltip
    tooltipContainerStyle: PropTypes.object,

    // Option to allow the user to choose from can be type 'report' or 'user'
    option: PropTypes.shape({
        // The full name of the user if available, otherwise the login (email/phone number) of the user
        text: PropTypes.string.isRequired,

        // list of particiapants of the report
        participantsList: PropTypes.arrayOf(
            PropTypes.shape({
            // primary login of participant
                login: PropTypes.string,

                // display Name of participant
                displayName: PropTypes.string,

                // avatar url of participant
                avatar: PropTypes.string,
            }),
        ).isRequired,

        // text to show for tooltip
        tooltipText: PropTypes.string,
    }).isRequired,

};

const defaultProps = {
    style: null,
    tooltipEnabled: false,
    tooltipContainerStyle: styles.dInline,
    numberOfLines: 1,
};
export {
    propTypes,
    defaultProps,
};
