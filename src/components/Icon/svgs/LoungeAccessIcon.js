import * as React from 'react';
import Svg, {G, Path, Polygon} from 'react-native-svg';
import PropTypes from 'prop-types';
import themeColors from '../../../styles/themes/default';

const propTypes = {
    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    fill: PropTypes.string,

    /** Is icon hovered */
    hovered: PropTypes.string,

    /** Is icon pressed */
    pressed: PropTypes.string,
};

const defaultProps = {
    fill: themeColors.icon,
    hovered: 'false',
    pressed: 'false',
};

function LoungeAccessIcon(props) {
    return (
        <Svg
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 40 40"
            style={{
                enableBackground: 'new 0 0 40 40',
            }}
            xmlSpace="preserve"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            <G>
                <Path
                    className="st0"
                    d="M11,24v-2c0-1.1,0.9-2,2-2s2,0.9,2,2c0,0.6,0.4,1,1,1h8c0.6,0,1-0.4,1-1c0-1.1,0.9-2,2-2s2,0.9,2,2v2 c0,0.4-0.1,0.8-0.3,1.1C28.1,26,27,26.9,27,28h-2v-2H15v2h-2c0-1.1-1.1-2-1.7-2.9C11.1,24.8,11,24.4,11,24z"
                />
            </G>
            <G>
                <Path
                    fill={props.hovered === 'true' || props.pressed === 'true' ? props.fill : themeColors.starDefaultBG}
                    className="st1"
                    d="M31,9.8c-0.1-0.2-0.2-0.4-0.5-0.4h-2.1l-0.8-2C27.4,7,27.1,7,27,7c-0.1,0-0.4,0-0.6,0.4l-0.8,1.9h-2.1 c-0.4,0-0.5,0.4-0.5,0.4c0,0.1-0.1,0.4,0.1,0.6l1.6,1.8l-0.6,1.9c-0.1,0.3,0.1,0.5,0.2,0.7c0.1,0,0.3,0.2,0.7,0.1l2-1.1l2,1.2 c0.3,0.2,0.6,0,0.7-0.1c0.1-0.1,0.3-0.3,0.2-0.7l-0.6-2l1.5-1.7C31,10.3,31,10,31,9.8z"
                />
                <Polygon
                    className="st1"
                    points="28.5,7 28.5,7 28.5,7  "
                />
            </G>
            <G>
                <Path
                    className="st0"
                    d="M23.1,16.3c-0.8-0.6-1.2-1.7-1-2.7l0-0.1l0.2-0.5H16c-1.1,0-2,0.9-2,2v3h0.6c1.3,0,2.4,1.1,2.4,2.4 c0,0.3,0.3,0.6,0.6,0.6h4.8c0.3,0,0.6-0.3,0.6-0.6c0-1.3,1.1-2.4,2.4-2.4H26v-1.4C25.1,17.1,24,17,23.1,16.3z"
                />
            </G>
        </Svg>
    );
}

LoungeAccessIcon.displayName = 'LoungeAccessIcon';
LoungeAccessIcon.propTypes = propTypes;
LoungeAccessIcon.defaultProps = defaultProps;

export default LoungeAccessIcon;
