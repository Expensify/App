import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import Text from '@components/Text';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

function RenameAction(props) {
    const styles = useThemeStyles();
    const currentUserAccountID = lodashGet(props.currentUserPersonalDetails, 'accountID', '');
    const userDisplayName = lodashGet(props.action, ['person', 0, 'text']);
    const actorAccountID = lodashGet(props.action, 'actorAccountID', '');
    const displayName = actorAccountID === currentUserAccountID ? `${props.translate('common.you')}` : `${userDisplayName}`;
    const oldName = lodashGet(props.action, 'originalMessage.oldName', '');
    const newName = lodashGet(props.action, 'originalMessage.newName', '');

    return (
        <Text style={[styles.pv3, styles.ph5, styles.textAlignCenter, styles.textLabelSupporting]}>
            <Text style={[styles.textLabelSupporting, styles.textStrong, styles.textAlignCenter]}>{displayName}</Text>
            {props.translate('newRoomPage.renamedRoomAction', {oldName, newName})}
        </Text>
    );
}

RenameAction.propTypes = propTypes;
RenameAction.displayName = 'RenameAction';

export default compose(withLocalize, withCurrentUserPersonalDetails)(RenameAction);
