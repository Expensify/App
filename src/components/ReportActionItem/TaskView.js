import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../Text';
import styles from '../../styles/styles';
import * as ReportUtils from '../../libs/ReportUtils';
import * as TaskUtils from '../../libs/TaskUtils';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
        return null;
    }

    // Ensure we display the full task description
    const fullDescription = TaskUtils.getTaskDescription(props.taskReport);
    const descriptionLines = _.isString(fullDescription) ? fullDescription.split('\n') : [];

    return (
        <View style={[styles.p5, styles.borderRadiusNormal, styles.overflowHidden]}>
            {descriptionLines.map((line, index) => (
                <Text key={`taskDescription-${index}`} style={[styles.textSupporting, styles.mb1]}>
                    {line}
                </Text>
            ))}
        </View>