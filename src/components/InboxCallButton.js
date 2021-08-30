import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import Tooltip from './Tooltip';
import Button from './Button';
import {Phone} from './Icon/Expensicons';

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
        text={props.translate('requestCallPage.needHelpTooltip')}
        containerStyles={[styles.justifyContentCenter, styles.alignItemsCenter]}
    >
        <Button
            onPress={() => {
                Navigation.navigate(ROUTES.getRequestCallRoute(props.taskID));
            }}
            text={props.translate('requestCallPage.needHelp')}
            small
            icon={Phone}
        />
    </Tooltip>
);

InboxCallButton.propTypes = propTypes;
InboxCallButton.defaultProps = defaultProps;
InboxCallButton.displayName = 'InboxCallButton';
export default compose(withLocalize)(InboxCallButton);

// <View style={[styles.flexRow, styles.alignItemsCenter]}>
//                 <View style={styles.mr1}>
//                     <Icon
//                         src={Phone}
//                         fill={themeColors.heading}
//                         width={12}
//                         height={12}
//                     />
//                 </View>
//                 <View>
//                     <Text style={styles.buttonSmallText}>
//                         {props.translate('requestCallPage.needHelp')}
//                     </Text>
//                 </View>
//             </View>
