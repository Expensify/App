import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ROUTES from '../../../../ROUTES';
import Navigation from '../../../../libs/Navigation/Navigation';
import OptionsList from '../../../../components/OptionsList';
import styles from '../../../../styles/styles';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import themeColors from '../../../../styles/themes/default';
import ONYXKEYS from '../../../../ONYXKEYS';
import * as User from '../../../../libs/actions/User';
import MenuItemWithTopDescription from '../../../../components/MenuItemWithTopDescription';

const propTypes = {
    // The draft status of the custom status
    draftStatus: PropTypes.shape({
        // The text of the custom status
        text: PropTypes.string,
        // The emoji
        emoji: PropTypes.string,
        // The clear after value
        clearAfter: PropTypes.string,
    }),
};
const defaultProps = {
    draftStatus: {
        clearAfter: 'never',
    },
};

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};
const selectedProperties = {customIcon: greenCheckmark, boldStyle: true};

const options = [
    {value: 'never', text: 'Never'},
    {value: 'thirtyMinutes', text: 'After 30 minutes'},
    {value: 'oneHour', text: 'After 1 hour'},
    {value: 'afterToday', text: 'After today'},
    {value: 'afterWeek', text: 'After a week'},
    {value: 'custom', text: 'Custom'},
];

function ClearAfterPage(props) {
    const clearAfterOptions = [
        {
            data: _.map(options, (option) => ({
                ...option,
                ...(props.draftStatus.clearAfter === option.value ? selectedProperties : {}),
                keyForList: option.value,
            })),
        },
    ];

    const updateClearAfterSelection = (option) => {
        User.updateDraftCustomStatus({
            ...props.draftStatus,
            clearAfter: option.value,
        });
    };

    const showCustom = props.draftStatus.clearAfter === 'custom';

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title="Clear after"
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS)}
            />

            <OptionsList
                shouldHaveOptionSeparator
                hideSectionHeaders
                sections={clearAfterOptions}
                onSelectRow={updateClearAfterSelection}
                optionHoveredStyle={styles.hoveredComponentBG}
                listContainerStyles={[]}
            />

            {showCustom && (
                <>
                    <MenuItemWithTopDescription
                        title="2023-07-02"
                        description="Date"
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_SET)}
                    />
                    <MenuItemWithTopDescription
                        title="10:00 AM"
                        description="Time"
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_SET_TIME)}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

ClearAfterPage.displayName = 'ClearAfterPage';
ClearAfterPage.propTypes = propTypes;
ClearAfterPage.defaultProps = defaultProps;

export default withOnyx({
    draftStatus: {
        key: ONYXKEYS.CUSTOM_STATUS_DRAFT,
    },
})(ClearAfterPage);
