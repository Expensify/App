import React, {Fragment, useCallback, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text as RNText} from 'react-native';
import {View} from 'react-native';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import DisplayNamesTooltipItem from './DisplayNamesTooltipItem';
import type DisplayNamesProps from './types';

type HTMLElementWithText = HTMLElement & RNText;

function DisplayNamesWithToolTip({shouldUseFullTitle, fullTitle, displayNamesWithTooltips, textStyles = [], numberOfLines = 1, renderAdditionalText}: DisplayNamesProps) {
    const styles = useThemeStyles();
    const containerRef = useRef<HTMLElementWithText>(null);
    const childRefs = useRef<HTMLElementWithText[]>([]);
    const isEllipsisActive = !!containerRef.current?.offsetWidth && !!containerRef.current?.scrollWidth && containerRef.current.offsetWidth < containerRef.current.scrollWidth;

    /**
     * We may need to shift the Tooltip horizontally as some of the inline text wraps well with ellipsis,
     * but their container node overflows the parent view which causes the tooltip to be misplaced.
     *
     * So we shift it by calculating it as follows:
     * 1. We get the container layout and take the Child inline text node.
     * 2. Now we get the tooltip original position.
     * 3. If inline node's right edge is overflowing the container's right edge, we set the tooltip to the center
     * of the distance between the left edge of the inline node and right edge of the container.
     * @param index Used to get the Ref to the node at the current index
     * @returns Distance to shift the tooltip horizontally
     */
    const getTooltipShiftX = useCallback((index: number) => {
        // Only shift the tooltip in case the containerLayout or Refs to the text node are available
        if (!containerRef.current || index < 0 || !childRefs.current.at(index)) {
            return 0;
        }
        const {width: containerWidth, left: containerLeft} = containerRef.current.getBoundingClientRect();

        // We have to return the value as Number so we can't use `measureWindow` which takes a callback
        const {width: textNodeWidth, left: textNodeLeft} = childRefs.current.at(index)?.getBoundingClientRect() ?? {width: 0, left: 0};
        const tooltipX = textNodeWidth / 2 + textNodeLeft;
        const containerRight = containerWidth + containerLeft;
        const textNodeRight = textNodeWidth + textNodeLeft;
        const newToolX = textNodeLeft + (containerRight - textNodeLeft) / 2;

        // When text right end is beyond the Container right end
        return textNodeRight > containerRight ? -(tooltipX - newToolX) : 0;
    }, []);

    return (
        // Tokenization of string only support prop numberOfLines on Web
        <Text
            style={[textStyles, styles.pRelative]}
            numberOfLines={numberOfLines || undefined}
            ref={containerRef}
            testID={DisplayNamesWithToolTip.displayName}
        >
            {shouldUseFullTitle
                ? ReportUtils.formatReportLastMessageText(fullTitle)
                : displayNamesWithTooltips?.map(({displayName, accountID, avatar, login}, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Fragment key={index}>
                          <DisplayNamesTooltipItem
                              index={index}
                              getTooltipShiftX={getTooltipShiftX}
                              accountID={accountID}
                              displayName={displayName}
                              login={login}
                              avatar={avatar}
                              textStyles={textStyles}
                              childRefs={childRefs}
                          />
                          {index < displayNamesWithTooltips.length - 1 && <Text style={textStyles}>,&nbsp;</Text>}
                      </Fragment>
                  ))}
            {renderAdditionalText?.()}
            {!!isEllipsisActive && (
                <View style={styles.displayNameTooltipEllipsis}>
                    <Tooltip text={fullTitle}>
                        {/* There is some Gap for real ellipsis so we are adding 4 `.` to cover */}
                        <Text>....</Text>
                    </Tooltip>
                </View>
            )}
        </Text>
    );
}

DisplayNamesWithToolTip.displayName = 'DisplayNamesWithTooltip';

export default DisplayNamesWithToolTip;
