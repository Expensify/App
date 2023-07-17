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
import * as Permissions from '../libs/Permissions';

const TAB_MANUAL = 'manual';
const TAB_SCAN = 'scan';
const TAB_DISTANCE = 'distance';

const propTypes = {
    /** Which tab has been selected */
    tabSelected: PropTypes.string,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    tabSelected: TAB_MANUAL,
    betas: [],
};

function TabSelector(props) {
    const selectedTab = lodashGet(props.tabSelected, 'selected', TAB_MANUAL);
    return (
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <TabSelectorItem
                title="Manual"
                selected={selectedTab === TAB_MANUAL}
                icon={Expensicons.Pencil}
                onPress={() => {
                    Tab.onTabPress(TAB_MANUAL);
                }}
            />
            <TabSelectorItem
                title="Scan"
                selected={selectedTab === TAB_SCAN}
                icon={Expensicons.Receipt}
                onPress={() => {
                    Tab.onTabPress(TAB_SCAN);
                }}
            />
            {Permissions.canUseDistanceRequests(props.betas) && (
                <TabSelectorItem
                    title="Distance"
                    selected={selectedTab === TAB_DISTANCE}
                    icon={Expensicons.Car}
                    onPress={() => {
                        Tab.onTabPress(TAB_DISTANCE);
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
