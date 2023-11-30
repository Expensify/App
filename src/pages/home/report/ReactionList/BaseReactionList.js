/* eslint-disable rulesdir/onyx-props-must-have-default */
import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React from 'react';
import {FlatList} from 'react-native';
import OptionRow from '@components/OptionRow';
import participantPropTypes from '@components/participantPropTypes';
import withWindowDimensions from '@components/withWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as UserUtils from '@libs/UserUtils';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import HeaderReactionList from './HeaderReactionList';
import reactionPropTypes from './reactionPropTypes';

const propTypes = {
    /**
     *  Array of personal detail objects
     */
    users: PropTypes.arrayOf(participantPropTypes).isRequired,

    /**
     * Returns true if the current account has reacted to the report action (with the given skin tone).
     */
    hasUserReacted: PropTypes.bool,

    ...reactionPropTypes,
};

const defaultProps = {
    hasUserReacted: false,
};

/**
 * Create a unique key for each action in the FlatList.
 * @param {Object} item
 * @param {Number} index
 * @return {String}
 */
const keyExtractor = (item, index) => `${item.login}+${index}`;

/**
 * This function will be used with FlatList getItemLayout property for optimization purpose that allows skipping
 * the measurement of dynamic content if we know the size (height or width) of items ahead of time.
 * Generate and return an object with properties length(height of each individual row),
 * offset(distance of the current row from the top of the FlatList), index(current row index)
 *
 * @param {*} _ FlatList item
 * @param {Number} index row index
 * @returns {Object}
 */
const getItemLayout = (_, index) => ({
    index,
    length: variables.listItemHeightNormal,
    offset: variables.listItemHeightNormal * index,
});

function BaseReactionList(props) {
    const styles = useThemeStyles();
    if (!props.isVisible) {
        return null;
    }

    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly
     *
     * @param {Object} params
     * @param {Object} params.item
     * @return {React.Component}
     */
    const renderItem = ({item}) => (
        <OptionRow
            item={item}
            boldStyle
            style={{maxWidth: variables.mobileResponsiveWidthBreakpoint}}
            hoverStyle={styles.hoveredComponentBG}
            onSelectRow={() => {
                props.onClose();
                Navigation.navigate(ROUTES.PROFILE.getRoute(item.accountID));
            }}
            option={{
                text: Str.removeSMSDomain(item.displayName),
                alternateText: Str.removeSMSDomain(item.login || ''),
                participantsList: [item],
                icons: [
                    {
                        id: item.accountID,
                        source: UserUtils.getAvatar(item.avatar, item.accountID),
                        name: item.login,
                        type: CONST.ICON_TYPE_AVATAR,
                    },
                ],
                keyForList: item.login || String(item.accountID),
            }}
        />
    );

    return (
        <>
            <HeaderReactionList
                onClose={props.onClose}
                emojiName={props.emojiName}
                emojiCodes={props.emojiCodes}
                emojiCount={props.emojiCount}
                hasUserReacted={props.hasUserReacted}
            />
            <FlatList
                data={props.users}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                getItemLayout={getItemLayout}
                contentContainerStyle={styles.pv2}
                style={[styles.reactionListContainer, !props.isSmallScreenWidth && styles.reactionListContainerFixedWidth]}
            />
        </>
    );
}

BaseReactionList.propTypes = propTypes;
BaseReactionList.defaultProps = defaultProps;
BaseReactionList.displayName = 'BaseReactionList';

export default withWindowDimensions(BaseReactionList);
