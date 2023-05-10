import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import Text from '../Text';
import styles from '../../styles/styles';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    ...withLocalizePropTypes,
};

const RenameAction = (props) => {
    const displayName = lodashGet(props.action, ['message', 0, 'text']);
    const oldName = lodashGet(props.action, 'originalMessage.oldName', '');
    const newName = lodashGet(props.action, 'originalMessage.newName', '');

    return (
        <Text style={[styles.pv3, styles.ph5, styles.textAlignCenter, styles.textLabelSupporting]}>
            <Text style={[styles.textLabelSupporting, styles.textStrong, styles.textAlignCenter]}>
                {displayName}
            </Text>
            {props.translate('newRoomPage.renamedRoomAction', {oldName, newName})}
        </Text>
    );
};

RenameAction.propTypes = propTypes;
RenameAction.displayName = 'RenameAction';

export default withLocalize(RenameAction);
