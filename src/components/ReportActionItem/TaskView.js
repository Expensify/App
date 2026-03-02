import React from 'react';
import {View} from 'react-native';
import {Text as RNText} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Text from '../Text';
    }

    return (
        <View style={[styles.p5, styles.borderRadiusNormal]}>
            <RNText style={[styles.textSupporting, styles.mb1]} numberOfLines={0}>
                {props.taskReport.description}
            </RNText>
        </View>
    );
};