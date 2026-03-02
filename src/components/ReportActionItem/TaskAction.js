import React from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../Text';
import styles from '../../styles/styles';
    }

    return (
        <ScrollView style={[styles.p5, styles.borderRadiusNormal]} nestedScrollEnabled>
            <View style={[styles.overflowHidden]}>
                <Text style={[styles.textSupporting, styles.mb1]} selectable>{taskDescription}</Text>
            </View>
        </ScrollView>
    );
};