import React, {Fragment, useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../../styles/styles';
import Text from '../Text';
import Tooltip from '../Tooltip';
import UserDetailsTooltip from '../UserDetailsTooltip';
import {defaultProps, propTypes} from './displayNamesPropTypes';

function DisplayNames(props) {
    const [isEllipsisActive, setIsEllipsisActive] = useState(false);
    const containerRef = useRef(null);
    const childRefs = useRef([]);
    const [containerLayout, setContainerLayout] = useState(null);

    useEffect(() => {
        setIsEllipsisActive(containerLayout && containerLayout.offsetWidth && containerLayout.scrollWidth && containerLayout.offsetWidth < containerLayout.scrollWidth);
    }, [containerLayout]);

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
    const getTooltipShiftX = useCallback(
        (index) => {
            if (!containerLayout || !childRefs.current[index]) {
                return;
            }
            const {width: containerWidth, left: containerLeft} = containerLayout;
            const {width: textNodeWidth, left: textNodeLeft} = childRefs.current[index].getBoundingClientRect();
            const tooltipX = textNodeWidth / 2 + textNodeLeft;
            const containerRight = containerWidth + containerLeft;
            const textNodeRight = textNodeWidth + textNodeLeft;
            const newToolX = textNodeLeft + (containerRight - textNodeLeft) / 2;

            return textNodeRight > containerRight ? -(tooltipX - newToolX) : 0;
        },
        [containerLayout, childRefs],
    );

    if (!props.tooltipEnabled) {
        return (
            // Tokenization of string only support prop numberOfLines on Web
            <Text
                style={[...this.props.textStyles, styles.pRelative]}
                onLayout={this.setContainerLayout}
                numberOfLines={this.props.numberOfLines || undefined}
                ref={(el) => (this.containerRef = el)}
            >
                {this.props.shouldUseFullTitle
                    ? this.props.fullTitle
                    : _.map(this.props.displayNamesWithTooltips, ({displayName, accountID, avatar, login}, index) => (
                          <Fragment key={index}>
                              <UserDetailsTooltip
                                  key={index}
                                  accountID={accountID}
                                  fallbackUserDetails={{
                                      avatar,
                                      login,
                                      displayName,
                                  }}
                                  shiftHorizontal={() => this.getTooltipShiftX(index)}
                              >
                                  {/*  // We need to get the refs to all the names which will be used to correct
                                    the horizontal position of the tooltip */}
                                  <Text
                                      ref={(el) => (this.childRefs[index] = el)}
                                      style={[...this.props.textStyles, styles.pre]}
                                  >
                                      {displayName}
                                  </Text>
                              </UserDetailsTooltip>
                              {index < this.props.displayNamesWithTooltips.length - 1 && <Text style={this.props.textStyles}>,&nbsp;</Text>}
                          </Fragment>
                      ))}
                {Boolean(this.state.isEllipsisActive) && (
                    <View style={styles.displayNameTooltipEllipsis}>
                        <Tooltip text={this.props.fullTitle}>
                            {/* There is some Gap for real ellipsis so we are adding 4 `.` to cover */}
                            <Text>....</Text>
                        </Tooltip>
                    </View>
                )}
            </Text>
        );
    }

    function UserTooltipItem({index, displayName, accountID, avatar, login}) {
        const getTooltipShiftXBridge = useCallback(() => getTooltipShiftX(index), [getTooltipShiftX, index]);

        return (
            <Fragment key={index}>
                <UserDetailsTooltip
                    key={index}
                    accountID={accountID}
                    fallbackUserDetails={{
                        avatar,
                        login,
                        displayName,
                    }}
                    shiftHorizontal={getTooltipShiftXBridge}
                >
                    <Text
                        ref={(el) => (childRefs.current[index] = el)}
                        style={[...props.textStyles, styles.pre]}
                    >
                        {displayName}
                    </Text>
                </UserDetailsTooltip>
                {index < props.displayNamesWithTooltips.length - 1 && <Text style={props.textStyles}>,&nbsp;</Text>}
            </Fragment>
        );
    }

    return (
        <Text
            style={[...props.textStyles, styles.pRelative]}
            onLayout={(event) => setContainerLayout(event.nativeEvent.layout)}
            numberOfLines={1}
            ref={containerRef}
        >
            {props.shouldUseFullTitle ? (
                props.fullTitle
            ) : (
                <>
                    {_.map(props.displayNamesWithTooltips, ({displayName, accountID, avatar, login}, index) => (
                        <UserTooltipItem
                            key={index}
                            index={index}
                            displayName={displayName}
                            accountID={accountID}
                            avatar={avatar}
                            login={login}
                        />
                    ))}
                    {props.displayNamesWithTooltips.length > 1 && Boolean(isEllipsisActive) && (
                        <View style={styles.displayNameTooltipEllipsis}>
                            <Tooltip text={props.fullTitle}>
                                <Text>....</Text>
                            </Tooltip>
                        </View>
                    )}
                </>
            )}
        </Text>
    );
}
DisplayNames.propTypes = propTypes;
DisplayNames.defaultProps = defaultProps;

export default DisplayNames;
