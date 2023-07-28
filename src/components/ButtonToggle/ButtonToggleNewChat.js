import React from 'react';
import PropTypes from 'prop-types';
import * as Expensicons from '../Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ButtonToggle from './index';

const propTypes = {
    /** Key of the currently active toggle */
    activeToggle: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
}

function ButtonToggleNewChat({ activeToggle, translate }) {
    return (
        <ButtonToggle
            activeToggle={activeToggle}
            toggleItems={[
            {
                key: 'chat',
                text: translate('sidebarScreen.chat'),
                icon: Expensicons.User,
                action: () => Navigation.navigate(ROUTES.NEW_CHAT),
            },
            {
                key: 'room',
                text: translate('sidebarScreen.room'),
                icon: Expensicons.Hashtag,
                action: () => Navigation.navigate(ROUTES.WORKSPACE_NEW_ROOM),
            },
            ]}
            style={[styles.mh5]}
        />
    )
}

ButtonToggleNewChat.propTypes = propTypes;

export default withLocalize(ButtonToggleNewChat);
