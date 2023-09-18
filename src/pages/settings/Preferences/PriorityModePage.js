import _, {compose} from 'underscore';
import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import ONYXKEYS from '../../../ONYXKEYS';
import * as User from '../../../libs/actions/User';
import CONST from '../../../CONST';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import SelectionList from '../../../components/SelectionList';

const propTypes = {
    /** The chat priority mode */
    priorityMode: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
};

function PriorityModePage(props) {
    const priorityModes = _.map(_.values(CONST.PRIORITY_MODE), (mode) => ({
        value: mode,
        text: props.translate(`priorityModePage.priorityModes.${mode}.label`),
        alternateText: props.translate(`priorityModePage.priorityModes.${mode}.description`),
        keyForList: mode,
        isSelected: props.priorityMode === mode,
    }));

    const updateMode = useCallback(
        (mode) => {
            if (mode.value === props.priorityMode) {
                Navigation.navigate(ROUTES.SETTINGS_PREFERENCES);
                return;
            }
            User.updateChatPriorityMode(mode.value);
        },
        [props.priorityMode],
    );

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={props.translate('priorityModePage.priorityMode')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PREFERENCES)}
            />
            <Text style={[styles.mh5, styles.mv4]}>{props.translate('priorityModePage.explainerText')}</Text>
            <SelectionList
                sections={[{data: priorityModes}]}
                onSelectRow={updateMode}
                initiallyFocusedOptionKey={_.find(priorityModes, (mode) => mode.isSelected).keyForList}
            />
        </ScreenWrapper>
    );
}

PriorityModePage.displayName = 'PriorityModePage';
PriorityModePage.propTypes = propTypes;
PriorityModePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
        },
    }),
)(PriorityModePage);
