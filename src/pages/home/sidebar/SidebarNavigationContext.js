import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useState} from 'react';
import _ from 'underscore';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import GLOBAL_NAVIGATION_MAPPING from '@src/GLOBAL_NAVIGATION_MAPPING';

const propTypes = {
    /** Children to wrap. The part of app that should have acces to this context */
    children: PropTypes.node.isRequired,
};

const SidebarNavigationContext = React.createContext({
    selectedGlobalNavigationOption: undefined,
    selectedSubNavigationOption: undefined,
    updateFromNavigationState: () => {},
});

const mapSubNavigationOptionToGlobalNavigationOption = (SubNavigationOption) =>
    _.findKey(GLOBAL_NAVIGATION_MAPPING, (globalNavigationOptions) => globalNavigationOptions.includes(SubNavigationOption));

function SidebarNavigationContextProvider({children}) {
    const [selectedGlobalNavigationOption, setSelectedGlobalNavigationOption] = useState(CONST.GLOBAL_NAVIGATION_OPTION.CHATS);
    const [selectedSubNavigationOption, setSelectedSubNavigationOption] = useState();

    const updateFromNavigationState = useCallback((navigationState) => {
        const topmostCentralPaneRouteName = Navigation.getTopMostCentralPaneRouteName(navigationState);
        if (!topmostCentralPaneRouteName) {
            return;
        }

        setSelectedSubNavigationOption(topmostCentralPaneRouteName);
        setSelectedGlobalNavigationOption(mapSubNavigationOptionToGlobalNavigationOption(topmostCentralPaneRouteName));
    }, []);

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
