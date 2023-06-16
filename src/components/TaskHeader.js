import React from 'react';
import {View} from 'react-native';
import reportPropTypes from '../pages/reportPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import TaskHeaderActionButton from './TaskHeaderActionButton';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

function TaskHeader(props) {
    return (
        <View style={styles.borderBottom}>
            <View style={[{backgroundColor: themeColors.highlightBG}, styles.pl0]}>
                <View style={[styles.ph5, styles.pb5]}>
                    <TaskHeaderActionButton report={props.report} />
                </View>
            </View>
        </View>
    );
}

TaskHeader.propTypes = propTypes;
TaskHeader.displayName = 'TaskHeader';

export default compose(withWindowDimensions, withLocalize)(TaskHeader);
