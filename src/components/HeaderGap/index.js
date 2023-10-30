import React, {PureComponent} from 'react';
import {View} from 'react-native';
import stylePropTypes from '@styles/stylePropTypes';
import styles from '@styles/styles';

const propTypes = {
    /** Styles to apply to the HeaderGap */
    // eslint-disable-next-line react/forbid-prop-types
    styles: stylePropTypes,
};
class HeaderGap extends PureComponent {
    render() {
        return <View style={[styles.headerGap, ...this.props.styles]} />;
    }
}

HeaderGap.propTypes = propTypes;
HeaderGap.defaultProps = {
    styles: [],
};
export default HeaderGap;
