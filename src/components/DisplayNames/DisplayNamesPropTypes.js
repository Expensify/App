import PropTypes from 'prop-types';

const propTypes = {
    // The full title of the DisplayNames component (not split up)
    fullTitle: PropTypes.string,

    // Array of objects that map display names to their corresponding tooltip
    displayNamesToTooltips: PropTypes.arrayOf(PropTypes.shape({
        displayName: PropTypes.string,
        tooltip: PropTypes.string,
    })),

    // Number of lines before wrapping
    numberOfLines: PropTypes.number,

    // Is tooltip needed?
    // When true, triggers complex title rendering
    tooltipEnabled: PropTypes.bool,

    // Arbitrary styles of the displayName text
    textStyles: PropTypes.arrayOf(PropTypes.any),
};

const defaultProps = {
    numberOfLines: 1,
    tooltipEnabled: false,
    titleStyles: [],
};

export {propTypes, defaultProps};
