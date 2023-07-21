import {View} from 'react-native';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import * as Expensicons from './Icon/Expensicons';
import ONYXKEYS from '../ONYXKEYS';
import TabSelectorItem from './TabSelectorItem';
import Tab from '../libs/actions/Tab';
import Permissions from '../libs/Permissions';
import CONST from '../CONST';
import useLocalize from '../hooks/useLocalize';

const propTypes = {
    /** Which tab has been selected */
    tabSelected: PropTypes.string,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    tabSelected: CONST.TAB.TAB_MANUAL,
    betas: [],
};

function TabSelector({tabSelected, betas}) {
    const {translate} = useLocalize();
    const selectedTab = tabSelected || CONST.TAB.TAB_MANUAL;
    return (
        <View style={{flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20}}>
            <TabSelectorItem
                title={translate('tabSelector.manual')}
                selected={selectedTab === CONST.TAB.TAB_MANUAL}
                icon={Expensicons.Pencil}
                onPress={() => {
                    Tab.onTabPress(CONST.TAB.TAB_MANUAL);
                }}
            />
            <TabSelectorItem
                title={translate('tabSelector.scan')}
                selected={selectedTab === CONST.TAB.TAB_SCAN}
                icon={Expensicons.Receipt}
                onPress={() => {
                    Tab.onTabPress(CONST.TAB.TAB_SCAN);
                }}
            />
            {Permissions.canUseDistanceRequests(betas) && (
                <TabSelectorItem
                    title={translate('tabSelector.distance')}
                    selected={selectedTab === CONST.TAB.TAB_DISTANCE}
                    icon={Expensicons.Car}
                    onPress={() => {
                        Tab.onTabPress(CONST.TAB.TAB_DISTANCE);
                    }}
                />
            )}
        </View>
    );
}

TabSelector.propTypes = propTypes;
TabSelector.defaultProps = defaultProps;
TabSelector.displayName = 'TabSelector';

export default withOnyx({
    tabSelected: {
        key: ONYXKEYS.TAB_SELECTOR,
    },
    betas: {
        key: ONYXKEYS.BETAS,
    },
})(TabSelector);
