import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import CONST from '../CONST';
import styles from '../styles/styles';
import OptionsListSkeletonRow from './OptionsListSkeletonRow';

const propTypes = {
    /** Whether to animate the skeleton view */
    shouldAnimate: PropTypes.bool,
};

const defaultTypes = {
    shouldAnimate: true,
};

class OptionsListSkeletonView extends React.Component {
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
                <OptionsListSkeletonRow
                    key={`skeletonViewItems${i}`}
                    shouldAnimate={this.props.shouldAnimate}
                    lineWidth={lineWidth}
                />,
            );
        }

        this.setState((prevState) => ({
            skeletonViewItems: [...prevState.skeletonViewItems, ...skeletonViewItems],
        }));
    }

    render() {
        return (
            <View
                style={[styles.flex1, styles.overflowHidden]}
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

OptionsListSkeletonView.propTypes = propTypes;
OptionsListSkeletonView.defaultProps = defaultTypes;

export default OptionsListSkeletonView;
