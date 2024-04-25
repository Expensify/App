import Str from 'expensify-common/lib/str';
import React from 'react';
import {FlatList} from 'react-native';
import type {FlatListProps} from 'react-native';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import OptionRow from '@components/OptionRow';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PersonalDetails} from '@src/types/onyx';
import HeaderReactionList from './HeaderReactionList';
import type ReactionListProps from './types';

type BaseReactionListProps = ReactionListProps & {
    /**
     *  Array of personal detail objects
     */
    users: PersonalDetails[];

    /**
     * Returns true if the current account has reacted to the report action
     */
    hasUserReacted?: boolean;

    /**
     * Returns true if the reaction list is visible
     */
    isVisible?: boolean;
};

const keyExtractor: FlatListProps<PersonalDetails>['keyExtractor'] = (item, index) => `${item.login}+${index}`;

const getItemLayout = (data: ArrayLike<PersonalDetails> | null | undefined, index: number): {length: number; offset: number; index: number} => ({
    index,
    length: variables.listItemHeightNormal,
    offset: variables.listItemHeightNormal * index,
});

function BaseReactionList({hasUserReacted = false, users, isVisible = false, emojiCodes, emojiCount, emojiName, onClose}: BaseReactionListProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {hoveredComponentBG, reactionListContainer, reactionListContainerFixedWidth, pv2} = useThemeStyles();

    if (!isVisible) {
        return null;
    }

    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly
     *
     */
    const renderItem: FlatListProps<PersonalDetails>['renderItem'] = ({item}) => (
        <OptionRow
            boldStyle
            style={{maxWidth: variables.mobileResponsiveWidthBreakpoint}}
            hoverStyle={hoveredComponentBG}
            onSelectRow={() => {
                onClose?.();

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
                        source: item.avatar ?? FallbackAvatar,
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
                emojiName={emojiName}
                emojiCodes={emojiCodes}
                emojiCount={emojiCount}
                hasUserReacted={hasUserReacted}
            />
            <FlatList
                data={users}
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
