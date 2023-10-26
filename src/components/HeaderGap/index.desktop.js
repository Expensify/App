import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import stylePropTypes from '../../styles/stylePropTypes';

const propTypes = {
    /** Styles to apply to the HeaderGap */
    styles: stylePropTypes,

    /** If the HeaderGap is placed in the LHN */
    isSidebar: PropTypes.bool,
};

class HeaderGap extends PureComponent {
    render() {
        if (!this.props.isSidebar) {
            return <View style={[styles.headerGap, ...this.props.styles]} />;
        }
        return (
            <View style={[styles.headerGap, styles.globalAndSubNavigationContainer, styles.flexRow]}>
                <View style={styles.globalNavigation} />
                <View style={styles.headerGapLhpRight} />
            </View>
        );
    }
}

HeaderGap.propTypes = propTypes;
HeaderGap.defaultProps = {
    styles: [],
    isSidebar: false,
};
export default HeaderGap;
