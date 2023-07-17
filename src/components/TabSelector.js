import {View} from 'react-native';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import * as Expensicons from './Icon/Expensicons';
import compose from '../libs/compose';
import withLocalize from './withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import TabSelectorItem from './TabSelectorItem';
import Tab from '../libs/actions/Tab';
import Permissions from '../libs/Permissions';
import CONST from '../CONST';


const propTypes = {
    /** Which tab has been selected */
    tabSelected: PropTypes.string,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    tabSelected: CONST.TABS.MANUAL,
    betas: [],
};

function TabSelector(props) {
    const selectedTab = lodashGet(props.tabSelected, 'selected', CONST.TABS.MANUAL);
    return (
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <TabSelectorItem
                title="Manual"
                selected={selectedTab === CONST.TABS.MANUAL}
                icon={Expensicons.Pencil}
                onPress={() => {
                    Tab.onTabPress(CONST.TABS.MANUAL);
                }}
            />
            <TabSelectorItem
                title="Scan"
                selected={selectedTab === CONST.TABS.SCAN}
                icon={Expensicons.Receipt}
                onPress={() => {
                    Tab.onTabPress(CONST.TABS.SCAN);
                }}
            />
            {Permissions.canUseDistanceRequests(props.betas) && (
                <TabSelectorItem
                    title="Distance"
                    selected={selectedTab === CONST.TABS.DISTANCE}
                    icon={Expensicons.Car}
                    onPress={() => {
                        Tab.onTabPress(CONST.TABS.DISTANCE);
                    }}
                />
            )}
        </View>
    );
}

TabSelector.propTypes = propTypes;
TabSelector.defaultProps = defaultProps;
TabSelector.displayName = 'TabSelector';

export default compose(
    withLocalize,
    withOnyx({
        tabSelected: {
            key: ONYXKEYS.TAB_SELECTOR,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(TabSelector);
