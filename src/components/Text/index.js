import React from 'react';
import {Text as RNText} from 'react-native';
import PropTypes from 'prop-types';
import fontFamily from '../../styles/fontFamily';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';
    return (
        <RNText
            {...props}
            numberOfLines={props.numberOfLines || 0}
            style={[
                {
                    color: themeColors.text,
    );
};

Text.propTypes = {
    numberOfLines: PropTypes.number,
};

export default Text;