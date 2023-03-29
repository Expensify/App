import PropTypes from 'prop-types';
import fontFamily from '../../styles/fontFamily';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';
import CONST from '../../CONST';

const propTypes = {
    /** The color of the text */
    color: PropTypes.string,

    /** The size of the text */
    fontSize: PropTypes.number,

    /** The alignment of the text */
    textAlign: PropTypes.string,

    /** Any children to display */
    children: PropTypes.node,

    /** The family of the font to use */
    family: PropTypes.string,

    /** The maximum number of lines to be displayed (longer text will be truncated) */
    numberOfLines: PropTypes.number,

    /** Any additional styles to apply */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object, PropTypes.string]),

    /** A ref to forward to the Text */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};
const defaultProps = {
    color: themeColors.text,
    fontSize: variables.fontSizeNormal,
    family: fontFamily.EXP_NEUE,
    textAlign: CONST.DIRECTION.LEFT,
    numberOfLines: null,
    children: null,
    style: {},
    innerRef: () => {},
};

export {propTypes, defaultProps};
