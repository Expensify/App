import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {Rect, Circle} from 'react-native-svg';
import SkeletonViewContentLoader from 'react-content-loader/native';
import CONST from '../CONST';
import themeColors from '../styles/themes/default';
import styles from '../styles/styles';

const propTypes = {
    /** Whether to animate the skeleton view */
    shouldAnimate: PropTypes.bool,
};

const defaultTypes = {
    shouldAnimate: true,
};

class LHNSkeletonView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            skeletonViewItems: [],
        };
    }

    /**
     * Generate the skeleton view items.
     *
     * @param {Number} numItems
     */
    generateSkeletonViewItems(numItems) {
        if (this.state.skeletonViewItems.length === numItems) {
            return;
        }

        if (this.state.skeletonViewItems.length > numItems) {
            this.setState((prevState) => ({
                skeletonViewItems: prevState.skeletonViewItems.slice(0, numItems),
            }));
            return;
        }

        const skeletonViewItems = [];
        for (let i = this.state.skeletonViewItems.length; i < numItems; i++) {
            const step = i % 3;
            let lineWidth;
            switch (step) {
                case 0:
                    lineWidth = '100%';
                    break;
                case 1:
                    lineWidth = '50%';
                    break;
                default:
                    lineWidth = '25%';
            }
            skeletonViewItems.push(
                <SkeletonViewContentLoader
                    key={`skeletonViewItems${i}`}
                    animate={this.props.shouldAnimate}
                    height={CONST.LHN_SKELETON_VIEW_ITEM_HEIGHT}
                    backgroundColor={themeColors.borderLighter}
                    foregroundColor={themeColors.border}
                    style={styles.mr5}
                >
                    <Circle
                        cx="40"
                        cy="32"
                        r="20"
                    />
                    <Rect
                        x="72"
                        y="18"
                        width="20%"
                        height="8"
                    />
                    <Rect
                        x="72"
                        y="38"
                        width={lineWidth}
                        height="8"
                    />
                </SkeletonViewContentLoader>,
            );
        }

        this.setState((prevState) => ({
            skeletonViewItems: [...prevState.skeletonViewItems, ...skeletonViewItems],
        }));
    }

    render() {
        return (
            <View
                style={styles.flex1}
                onLayout={(event) => {
                    const numItems = Math.ceil(event.nativeEvent.layout.height / CONST.LHN_SKELETON_VIEW_ITEM_HEIGHT);
                    this.generateSkeletonViewItems(numItems);
                }}
            >
                <View>{this.state.skeletonViewItems}</View>
            </View>
        );
    }
}

LHNSkeletonView.propTypes = propTypes;
LHNSkeletonView.defaultProps = defaultTypes;

export default LHNSkeletonView;
