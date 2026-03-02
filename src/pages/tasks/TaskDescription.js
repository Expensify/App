import React from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../components/Text';
import styles from '../../styles/styles';
    }

    return (
        <ScrollView style={[styles.p5, styles.borderRadiusNormal]} nestedScrollEnabled>
            <View style={[styles.overflowHidden]}>
                <Text style={[styles.textSupporting]} selectable>{description}</Text>
            </View>
        </ScrollView>
    );
};