import React from 'react';
import {View, Text} from 'react-native';
import styles from '../../style/StyleSheet';

function MainView() {
    return (
        <View style={[styles.flexGrow4, styles.p1]}>
            <Text>Main View</Text>
        </View>
    );
}

export default MainView;
