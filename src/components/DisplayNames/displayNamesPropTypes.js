import PropTypes from 'prop-types';

const propTypes = {
    /** The full title of the DisplayNames component (not split up) */
    fullTitle: PropTypes.string,

    /** Array of objects that map display names to their corresponding tooltip */
    displayNamesWithTooltips: PropTypes.arrayOf(
        PropTypes.shape({
            /** The name to display in bold */
            displayName: PropTypes.string,

            /** The Account ID for the tooltip */
            accountID: PropTypes.number,

            /** The login for the tooltip fallback */
            login: PropTypes.string,

            /** The avatar for the tooltip fallback */
            avatar: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        }),
    ),

    /** Number of lines before wrapping */
    numberOfLines: PropTypes.number,

    /** Is tooltip needed? When true, triggers complex title rendering */
    tooltipEnabled: PropTypes.bool,

    /** Arbitrary styles of the displayName text */
    textStyles: PropTypes.arrayOf(PropTypes.any),
};

const defaultProps = {
    numberOfLines: 1,
    tooltipEnabled: false,
    textStyles: [],
};

export {propTypes, defaultProps};
