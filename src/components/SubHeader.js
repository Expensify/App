import React from 'react';
import {View, Text} from 'react-native';
import styles from '../styles/styles';

const SubHeader = (props) => (
    <View>
        <Text style={styles.subHeader}>
            {props.text}
        </Text>
    </View>
);

export default SubHeader;
