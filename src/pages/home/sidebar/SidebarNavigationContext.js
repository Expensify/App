import React, {useMemo, useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import CONST from '../../../CONST';
import Navigation from '../../../libs/Navigation/Navigation';
import GLOBAL_NAVIGATION_MAPPING from '../../../GLOBAL_NAVIGATION_MAPPING';

const propTypes = {
    /** Children to wrap. The part of app that should have acces to this context */
    children: PropTypes.node.isRequired,
};

const SidebarNavigationContext = React.createContext({
    selectedGlobalNavigationOption: undefined,
    selectedSubNavigationOption: undefined,
    updateFromNavigationState: () => {},
});

function mapSubNavigationOptionToGlobalNavigationOption(SubNavigationOption) {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key] of Object.entries(GLOBAL_NAVIGATION_MAPPING)) {
        if (GLOBAL_NAVIGATION_MAPPING[key].includes(SubNavigationOption)) {
            return key;
        }
    }
    return undefined;
}

function SidebarNavigationContextProvider({children}) {
    const [selectedGlobalNavigationOption, setSelectedGlobalNavigationOption] = useState(CONST.GLOBAL_NAVIGATION_OPTION.CHATS);
    const [selectedSubNavigationOption, setSelectedSubNavigationOption] = useState();

    const updateFromNavigationState = useCallback(
        (navigationState) => {
            const topmostCentralPaneRouteName = Navigation.getTopMostCentralPaneRouteName(navigationState);
            if (!topmostCentralPaneRouteName) {
                return;
            }

            setSelectedSubNavigationOption(topmostCentralPaneRouteName);
            setSelectedGlobalNavigationOption(mapSubNavigationOptionToGlobalNavigationOption(topmostCentralPaneRouteName));
        },
        [setSelectedGlobalNavigationOption, setSelectedSubNavigationOption],
    );

    const contextValue = useMemo(
        () => ({
            selectedGlobalNavigationOption,
            selectedSubNavigationOption,
            updateFromNavigationState,
        }),
        [selectedGlobalNavigationOption, selectedSubNavigationOption, updateFromNavigationState],
    );

    return <SidebarNavigationContext.Provider value={contextValue}>{children}</SidebarNavigationContext.Provider>;
}

SidebarNavigationContextProvider.propTypes = propTypes;

export {SidebarNavigationContextProvider, SidebarNavigationContext};
