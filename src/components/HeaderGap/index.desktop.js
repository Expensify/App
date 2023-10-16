import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';

const propTypes = {
    /** Styles to apply to the HeaderGap */
    // eslint-disable-next-line react/forbid-prop-types
    styles: PropTypes.arrayOf(PropTypes.object),

    /** If the HeaderGap is placed in the LHP */
    isSidebar: PropTypes.bool,
};

class HeaderGap extends PureComponent {
    render() {
        if (!this.props.isSidebar) {
            return <View style={[styles.headerGap, ...this.props.styles]} />;
        }
        return (
            <View style={[styles.headerGap, styles.globalAndSubNavigationContainer, styles.flexRow, ...this.props.styles]}>
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
