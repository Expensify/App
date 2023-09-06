import React, {PureComponent} from 'react';
import {View} from 'react-native';
import styles from '../../styles/styles';

export default class HeaderGap extends PureComponent {
    render() {
        // eslint-disable-next-line react/prop-types
        return <View style={[styles.headerGap, ...this.props.styles]} />;
    }
}
