import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {View} from 'react-native';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';

const propTypes = {
    /** Styles to apply to the HeaderGap */
    // eslint-disable-next-line react/forbid-prop-types
    styles: PropTypes.arrayOf(PropTypes.object),
    ...withThemeStylesPropTypes,
};

class HeaderGap extends PureComponent {
    render() {
        return <View style={[this.props.themeStyles.headerGap, ...this.props.styles]} />;
    }
}

HeaderGap.propTypes = propTypes;
HeaderGap.defaultProps = {
    styles: [],
};

export default withThemeStyles(HeaderGap);
