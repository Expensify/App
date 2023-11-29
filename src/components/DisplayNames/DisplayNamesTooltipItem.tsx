import React, {RefObject, useCallback} from 'react';
import {Text as RNText, StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import {AvatarSource} from '@libs/UserUtils';
import useThemeStyles from '@styles/useThemeStyles';

type DisplayNamesTooltipItemProps = {
    index?: number;

    /** The function to get a distance to shift the tooltip horizontally */
    getTooltipShiftX?: (index: number) => number | undefined;

    /** The Account ID for the tooltip */
    accountID?: number;

    /** The name to display in bold */
    displayName?: string;

    /** The login for the tooltip fallback */
    login?: string;

    /** The avatar for the tooltip fallback */
    avatar?: AvatarSource;

    /** Arbitrary styles of the displayName text */
    textStyles?: StyleProp<TextStyle>;

    /** Refs to all the names which will be used to correct the horizontal position of the tooltip */
    childRefs: RefObject<RNText[]>;
};

function DisplayNamesTooltipItem({
    index = 0,
    getTooltipShiftX = () => undefined,
    accountID = 0,
    avatar = '',
    login = '',
    displayName = '',
    textStyles = [],
    childRefs = {current: []},
}: DisplayNamesTooltipItemProps) {
    const styles = useThemeStyles();
    const tooltipIndexBridge = useCallback(() => getTooltipShiftX(index), [getTooltipShiftX, index]);

    return (
        <UserDetailsTooltip
            key={index}
            accountID={accountID}
            fallbackUserDetails={{
                avatar,
                login,
                displayName,
            }}
            shiftHorizontal={tooltipIndexBridge}
        >
            {/* We need to get the refs to all the names which will be used to correct the horizontal position of the tooltip */}
            <Text
                eslint-disable-next-line
                no-param-reassign
                ref={(el) => {
                    if (!childRefs.current?.[index] || !el) {
                        return;
                    }
                    // eslint-disable-next-line no-param-reassign
                    childRefs.current[index] = el;
                }}
                style={[textStyles, styles.pre]}
            >
                {displayName}
            </Text>
        </UserDetailsTooltip>
    );
}

DisplayNamesTooltipItem.displayName = 'DisplayNamesTooltipItem';

export default DisplayNamesTooltipItem;
