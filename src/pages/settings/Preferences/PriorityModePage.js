import _, {compose} from 'underscore';
import React from 'react';
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
import SelectionListRadio from '../../../components/SelectionListRadio';

const propTypes = {
    /** The chat priority mode */
    priorityMode: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
};

function PriorityModePage(props) {
    const priorityModes = _.map(props.translate('priorityModePage.priorityModes'), (mode, key) => ({
        value: key,
        text: mode.label,
        alternateText: mode.description,

        // Set max line to undefined to reset line restriction
        alternateTextMaxLines: undefined,
        keyForList: key,
        isSelected: props.priorityMode === key,
    }));

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={props.translate('priorityModePage.priorityMode')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PREFERENCES)}
            />
            <Text style={[styles.mh5, styles.mv4]}>{props.translate('priorityModePage.explainerText')}</Text>
            <SelectionListRadio
                sections={[{data: priorityModes}]}
                onSelectRow={(mode) => User.updateChatPriorityMode(mode.value)}
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
