import PropTypes from 'prop-types';

const propTypes = {
    /** The full title of the DisplayNames component (not split up) */
    fullTitle: PropTypes.string,

    /** Array of objects that map display names to their corresponding tooltip */
    displayNamesWithTooltips: PropTypes.arrayOf(PropTypes.shape({
        /** The name to display in bold */
        displayName: PropTypes.string,

        /** The tooltip to show when the associated name is hovered */
        tooltip: PropTypes.string,
    })),

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
    titleStyles: [],
};

export {propTypes, defaultProps};
