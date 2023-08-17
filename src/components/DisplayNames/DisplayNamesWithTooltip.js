import React, {Fragment, useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../../styles/styles';
import Text from '../Text';
import Tooltip from '../Tooltip';
import DisplayNamesTooltipItem from './DisplayNamesTooltipItem';
import {defaultProps, propTypes} from './displayNamesPropTypes';

function DisplayNamesWithToolTip(props) {
    const containerRef = useRef(null);
    const childRefs = useRef([]);
    const [isEllipsisActive, setIsEllipsisActive] = useState(false);

    useEffect(() => {
        setIsEllipsisActive(
            containerRef.current && containerRef.current.offsetWidth && containerRef.current.scrollWidth && containerRef.current.offsetWidth < containerRef.current.scrollWidth,
        );
    }, []);

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
        if (!containerRef || !childRefs.current[index]) {
            return;
        }
        const {width: containerWidth, left: containerLeft} = containerRef.current.getBoundingClientRect();

        // We have to return the value as Number so we can't use `measureWindow` which takes a callback
        const {width: textNodeWidth, left: textNodeLeft} = childRefs.current[index].getBoundingClientRect();
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
            style={[...props.textStyles, styles.pRelative]}
            numberOfLines={props.numberOfLines || undefined}
            ref={(el) => (containerRef.current = el)}
        >
            {props.shouldUseFullTitle
                ? props.fullTitle
                : _.map(props.displayNamesWithTooltips, ({displayName, accountID, avatar, login}, index) => (
                      <Fragment key={index}>
                          <DisplayNamesTooltipItem
                              index={index}
                              getTooltipShiftX={getTooltipShiftX}
                              accountID={accountID}
                              displayName={displayName}
                              login={login}
                              avatar={avatar}
                              textStyles={props.textStyles}
                              childRefs={childRefs}
                              addComma={index < props.displayNamesWithTooltips.length - 1}
                          />
                          {index < props.displayNamesWithTooltips.length - 1 && <Text style={props.textStyles}>,&nbsp;</Text>}
                      </Fragment>
                  ))}
            {Boolean(isEllipsisActive) && (
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

DisplayNamesWithToolTip.propTypes = propTypes;
DisplayNamesWithToolTip.defaultProps = defaultProps;
DisplayNamesWithToolTip.displayName = 'DisplayNamesWithTooltip';

export default DisplayNamesWithToolTip;
