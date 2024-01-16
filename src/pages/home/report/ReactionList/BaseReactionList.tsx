/* eslint-disable rulesdir/onyx-props-must-have-default */
import Str from 'expensify-common/lib/str';
import React from 'react';
import {FlatList} from 'react-native';
import type {FlatListProps} from 'react-native';
import OptionRow from '@components/OptionRow';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as UserUtils from '@libs/UserUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PersonalDetails} from '@src/types/onyx';
import HeaderReactionList from './HeaderReactionList';
import type {ReactionListProps} from './types';

type BaseReactionListProps = ReactionListProps & {
    /**
     *  Array of personal detail objects
     */
    users: PersonalDetails[];

    /**
     * Returns true if the current account has reacted to the report action (with the given skin tone).
     */
    hasUserReacted: boolean;

    /**
     * Returns true if the reaction list is visible
     */
    isVisible: boolean;
};

/**
 * Create a unique key for each action in the FlatList.
 * @param item object
 * @param index number
 * @return string
 */
const keyExtractor: FlatListProps<PersonalDetails>['keyExtractor'] = (item, index) => `${item.login}+${index}`;

/**
 * This function will be used with FlatList getItemLayout property for optimization purpose that allows skipping
 * the measurement of dynamic content if we know the size (height or width) of items ahead of time.
 * Generate and return an object with properties length(height of each individual row),
 * offset(distance of the current row from the top of the FlatList), index(current row index)
 *
 * @param data FlatList item
 * @param  index number - row index
 * @returns object
 */
const getItemLayout = (data: ArrayLike<PersonalDetails> | null | undefined, index: number): {length: number; offset: number; index: number} => ({
    index,
    length: variables.listItemHeightNormal,
    offset: variables.listItemHeightNormal * index,
});

function BaseReactionList(props: BaseReactionListProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {hoveredComponentBG, reactionListContainer, reactionListContainerFixedWidth, pv2} = useThemeStyles();
    if (!props.isVisible) {
        return null;
    }

    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly
     *
     * @param params object
     * @param params.item object
     * @return React.Component
     */
    const renderItem: FlatListProps<PersonalDetails>['renderItem'] = ({item}) => (
        <OptionRow
            boldStyle
            style={{maxWidth: variables.mobileResponsiveWidthBreakpoint}}
            hoverStyle={hoveredComponentBG}
            onSelectRow={() => {
                if (props.onClose) {
                    props.onClose();
                }

                Navigation.navigate(ROUTES.PROFILE.getRoute(item.accountID));
            }}
            option={{
                reportID: String(item.accountID),
                text: Str.removeSMSDomain(item.displayName ?? ''),
                alternateText: Str.removeSMSDomain(item.login ?? ''),
                participantsList: [item],
                icons: [
                    {
                        id: item.accountID,
                        source: UserUtils.getAvatar(item.avatar, item.accountID),
                        name: item.login ?? '',
                        type: CONST.ICON_TYPE_AVATAR,
                    },
                ],
                keyForList: item.login ?? String(item.accountID),
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
                contentContainerStyle={pv2}
                style={[reactionListContainer, !isSmallScreenWidth && reactionListContainerFixedWidth]}
            />
        </>
    );
}

BaseReactionList.displayName = 'BaseReactionList';

export default BaseReactionList;
