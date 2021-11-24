import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import Tooltip from './Tooltip';
import Button from './Button';
import * as Expensicons from './Icon/Expensicons';

const propTypes = {
    ...withLocalizePropTypes,

    /** The task ID to queue a call for */
    taskID: PropTypes.string,
};

const defaultProps = {
    taskID: '',
};

const InboxCallButton = props => (
    <Tooltip
        text={props.translate('requestCallPage.callButtonTooltip')}
        containerStyles={[styles.justifyContentCenter, styles.alignItemsCenter]}
    >
        <Button
            onPress={() => {
                Navigation.navigate(ROUTES.getRequestCallRoute(props.taskID));
            }}
            text={props.translate('requestCallPage.callButton')}
            small
            icon={Expensicons.Phone}
        />
    </Tooltip>
);

InboxCallButton.propTypes = propTypes;
InboxCallButton.defaultProps = defaultProps;
InboxCallButton.displayName = 'InboxCallButton';
export default withLocalize(InboxCallButton);
