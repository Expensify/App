import _ from 'underscore';
import React from 'react';
import { ScrollView } from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import * as Expensicons from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, { withLocalizePropTypes } from '../../components/withLocalize';
import compose from '../../libs/compose';
import MenuItem from '../../components/MenuItem';
import styles from '../../styles/styles';
import * as Link from '../../libs/actions/Link';
import withWindowDimensions, { windowDimensionsPropTypes } from '../../components/withWindowDimensions';
import * as ReportActionContextMenu from '../home/report/ContextMenu/ReportActionContextMenu';
import { CONTEXT_MENU_TYPES } from '../home/report/ContextMenu/ContextMenuActions';
import { Text } from 'react-native';

const propTypes = {
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const BugReport = (props) => {
    return (
        <ScreenWrapper>
            <Text>Hello</Text>
        </ScreenWrapper>
    );
};

BugReport.propTypes = propTypes;
BugReport.displayName = 'BugReport';

export default compose(withWindowDimensions, withLocalize)(BugReport);
