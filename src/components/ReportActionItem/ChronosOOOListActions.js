import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import ChronosOOOListAction from './ChronosOOOListAction';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,
};

const ChronosOOOListActions = (props) => {
    const events = lodashGet(props.action, 'originalMessage.events', []);

    return (
        <View>
            {_.map(events, event => <ChronosOOOListAction event={event} action={props.action} events={events} />)}
        </View>
    );
};

ChronosOOOListActions.propTypes = propTypes;
ChronosOOOListActions.displayName = 'ChronosOOOListActions';

export default ChronosOOOListActions;
