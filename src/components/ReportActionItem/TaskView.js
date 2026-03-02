import React from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Text from '../Text';
    }

    return (
        <ScrollView style={[styles.p5, styles.borderRadiusNormal]} nestedScrollEnabled>
            <View style={[styles.overflowHidden]}>
                <Text style={[styles.textSupporting, styles.mb1]} selectable>
                    {props.taskReport.description}
                </Text>
            </View>
        </ScrollView>
    );
};