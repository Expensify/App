import _, {compose} from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';
import OptionsList from '../../../components/OptionsList';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import themeColors from '../../../styles/themes/default';
import * as Expensicons from '../../../components/Icon/Expensicons';
import ONYXKEYS from '../../../ONYXKEYS';
import * as User from '../../../libs/actions/User';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

const propTypes = {
    ...withLocalizePropTypes,
};

const PriorityModePage = (props) => {
    const priorityModes = _.map(props.translate('priorityModePage.priorityModes'), (mode, key) => (
        {
            value: key,
            text: mode.label,
            alternateText: mode.description,
            keyForList: key,

            // Include the green checkmark icon to indicate the currently selected value
            customIcon: props.priorityMode === key ? greenCheckmark : undefined,

            // This property will make the currently selected value have bold text
            boldStyle: props.priorityMode === key,
        }
    ),
    );

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('priorityModePage.priorityMode')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <Text style={[styles.ml5, styles.mt4, styles.mr5, styles.mb4]}>
                {props.translate('priorityModePage.explainerText')}
            </Text>
            <OptionsList
                sections={[{data: priorityModes}]}
                onSelectRow={(mode) => User.updateChatPriorityMode(mode.value)}
                hideSectionHeaders
                optionHoveredStyle={
                    {
                        ...styles.hoveredComponentBG,
                        ...styles.mln5,
                        ...styles.mrn5,
                        ...styles.ph5,
                    }
                }
                shouldHaveOptionSeparator
                disableRowInnerPadding
                contentContainerStyles={[styles.ph5]}
            />
        </ScreenWrapper>
    );
};

PriorityModePage.displayName = 'PriorityModePage';
PriorityModePage.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
        },
    }),
)(PriorityModePage);
