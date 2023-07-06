import React, {Fragment, useRef} from 'react';
import {View, useCallback, useEffect, useState} from 'react-native';
import _ from 'underscore';
import styles from '../../styles/styles';
import Text from '../Text';
import Tooltip from '../Tooltip';
import UserDetailsTooltip from '../UserDetailsTooltip';
import {defaultProps, propTypes} from './displayNamesPropTypes';

function DisplayNames(props) {
    const containerRef = useRef(null);
    const childRefs = [];
    const [isEllipsisActive, setIsEllipsisActive] = useState(false);
    const containerLayout = useRef(null);

    useEffect(() => {
        setIsEllipsisActive(containerRef && containerRef.current.offsetWidth && containerRef.current.scrollWidth && containerRef.current.offsetWidth < containerRef.current.scrollWidth);
    }, []);

    /**
     * Set the container layout for post calculations
     *
     * @param {*} {nativeEvent}
     */
    const setContainerLayout = ({nativeEvent}) => {
        containerLayout.current = nativeEvent.layout;
    };

    /**
     * We may need to shift the Tooltip horizontally as some of the inline text wraps well with ellipsis,
     * but their container node overflows the parent view which causes the tooltip to be misplaced.
     *
     * So we shift it by calculating it as follows:
     * 1. We get the container layout and take the Child inline text node.
     * 2. Now we get the tooltip original position.
     * 3. If inline node's right edge is overflowing the container's right edge, we set the tooltip to the center
     * of the distance between the left edge of the inline node and right edge of the container.
     * @param {Number} index Used to get the Ref to the node at the current index
     * @returns {Number} Distance to shift the tooltip horizontally
     */
    const getTooltipShiftX = useCallback((index) => {
        // Only shift the tooltip in case the containerLayout or Refs to the text node are available
        if (!containerLayout.current || !childRefs[index]) {
            return;
        }
        const {width: containerWidth, left: containerLeft} = containerLayout.current;

        // We have to return the value as Number so we can't use `measureWindow` which takes a callback
        const {width: textNodeWidth, left: textNodeLeft} = childRefs[index].getBoundingClientRect();
        const tooltipX = textNodeWidth / 2 + textNodeLeft;
        const containerRight = containerWidth + containerLeft;
        const textNodeRight = textNodeWidth + textNodeLeft;
        const newToolX = textNodeLeft + (containerRight - textNodeLeft) / 2;

        // When text right end is beyond the Container right end
        return textNodeRight > containerRight ? -(tooltipX - newToolX) : 0;
        // We only rely on teh containerLayout and childRefs[index] to calculate the shift and these values are not going to change after initialized.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!props.tooltipEnabled) {
        // No need for any complex text-splitting, just return a simple Text component
        return (
            <Text
                style={[...props.textStyles, props.numberOfLines === 1 ? styles.pre : styles.preWrap]}
                numberOfLines={props.numberOfLines}
            >
                {props.fullTitle}
            </Text>
        );
    }

    return (
        // Tokenization of string only support 1 numberOfLines on Web
        <Text
            style={[...props.textStyles, styles.pRelative]}
            onLayout={setContainerLayout}
            numberOfLines={1}
            ref={containerRef}
        >
            {props.shouldUseFullTitle
                ? props.fullTitle
                : _.map(props.displayNamesWithTooltips, ({displayName, accountID, avatar, login}, index) => (
                      <Fragment key={index}>
                          <UserDetailsTooltip
                              key={index}
                              accountID={accountID}
                              fallbackUserDetails={{
                                  avatar,
                                  login,
                                  displayName,
                              }}
                              shiftHorizontal={() => getTooltipShiftX(index)}
                          >
                              {/*  // We need to get the refs to all the names which will be used to correct
                                    the horizontal position of the tooltip */}
                              <Text
                                  ref={(el) => (childRefs.current[index] = el)}
                                  style={[...props.textStyles, styles.pre]}
                              >
                                  {displayName}
                              </Text>
                          </UserDetailsTooltip>
                          {index < props.displayNamesWithTooltips.length - 1 && <Text style={props.textStyles}>,&nbsp;</Text>}
                      </Fragment>
                  ))}
            {props.displayNamesWithTooltips.length > 1 && Boolean(isEllipsisActive) && (
                <View style={styles.displayNameTooltipEllipsis}>
                    <Tooltip text={props.fullTitle}>
                        {/* There is some Gap for real ellipsis so we are adding 4 `.` to cover */}
                        <Text>....</Text>
                    </Tooltip>
                </View>
            )}
        </Text>
    );
}
DisplayNames.propTypes = propTypes;
DisplayNames.defaultProps = defaultProps;

export default DisplayNames;
