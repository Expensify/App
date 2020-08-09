import React from 'react';
import {View, Text} from 'react-native';
import styles from '../../style/StyleSheet';

function SidebarView() {
    return (
        <View style={[styles.flexGrow1, styles.p1]}>
            <Text>Sidebar View</Text>
        </View>
    );
}

export default SidebarView;
