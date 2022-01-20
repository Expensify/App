import PropTypes from 'prop-types';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';

const propTypes = {
    /** The color of the text */
    color: PropTypes.string,

    /** The size of the text */
    fontSize: PropTypes.number,

    /** The alignment of the text */
    // eslint-disable-next-line react/forbid-prop-types
    textAlign: PropTypes.any,

    /** Any children to display */
    children: PropTypes.node,

    /** The family of the font to use */
    family: PropTypes.string,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};
const defaultProps = {
    color: themeColors.text,
    fontSize: variables.fontSizeNormal,
    family: 'GTA',
    textAlign: null,
    children: null,
    style: {},
};

export {
    propTypes,
    defaultProps,
};
