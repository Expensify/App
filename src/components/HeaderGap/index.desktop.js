import PropTypes from 'prop-types';
import React, {memo} from 'react';
import {View} from 'react-native';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import compose from '@libs/compose';

const propTypes = {
    /** Styles to apply to the HeaderGap */
    // eslint-disable-next-line react/forbid-prop-types
    styles: PropTypes.arrayOf(PropTypes.object),
    ...withThemeStylesPropTypes,
};

const defaultProps = {
    styles: [],
};

function HeaderGap(props) {
    return <View style={[props.themeStyles.headerGap, ...props.styles]} />;
}

HeaderGap.displayName = 'HeaderGap';
HeaderGap.propTypes = propTypes;
HeaderGap.defaultProps = defaultProps;
export default compose(memo, withThemeStyles)(HeaderGap);
