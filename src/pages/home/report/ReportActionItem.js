import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import {Text as RNText} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../components/Text';
import styles from '../../styles/styles';
            return (
                <View style={[styles.p5, styles.borderRadiusNormal, styles.overflowHidden]}>
                    <Text style={[styles.textSupporting, styles.mb1]}>Task: {taskReportName}</Text>
                    <RNText style={[styles.textSupporting]} numberOfLines={0}>{taskDescription}</RNText>
                </View>
            );
        }