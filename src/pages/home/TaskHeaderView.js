import _ from 'underscore';
import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import Icon from '../../components/Icon';
import * as Expensicons from '../../components/Icon/Expensicons';
import compose from '../../libs/compose';
import * as Report from '../../libs/actions/Report';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import participantPropTypes from '../../components/participantPropTypes';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import reportPropTypes from '../reportPropTypes';
import ONYXKEYS from '../../ONYXKEYS';
import MenuItemWithTopDescription from '../../components/MenuItemWithTopDescription';
import OptionsSelector from '../../components/OptionsSelector';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,
};

const defaultProps = {

};

const TaskHeaderView = props => (
    <>
        <MenuItemWithTopDescription
            shouldShowHeaderTitle
            title={props.report.reportName}
            description="Task"
            onPress={() => console.log('ho')}
        />
        <MenuItemWithTopDescription
            title={lodashGet(props.report, 'description', 'Please add a PDF file of your articles of incorporation.')}
            description="Description"
            onPress={() => console.log('ho')}
        />
    </>
);

TaskHeaderView.propTypes = propTypes;
TaskHeaderView.defaultProps = defaultProps;
TaskHeaderView.displayName = 'TaskHeaderView';

export default TaskHeaderView;
