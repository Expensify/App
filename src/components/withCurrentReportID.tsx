import type {NavigationState} from '@react-navigation/native';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {createContext, forwardRef, useCallback, useMemo, useState} from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import Navigation from '@libs/Navigation/Navigation';

type CurrentReportIDContextValue = {
    updateCurrentReportID: (state: NavigationState) => void;
    currentReportID: string;
};

type CurrentReportIDContextProviderProps = {
    /** Actual content wrapped by this component */
    children: React.ReactNode;
};

const CurrentReportIDContext = createContext<CurrentReportIDContextValue | null>(null);

const withCurrentReportIDDefaultProps = {
    currentReportID: '',
};

function CurrentReportIDContextProvider(props: CurrentReportIDContextProviderProps) {
    const [currentReportID, setCurrentReportID] = useState('');

    /**
     * This function is used to update the currentReportID
     * @param state root navigation state
     */
    const updateCurrentReportID = useCallback(
        (state: NavigationState) => {
            const reportID = Navigation.getTopmostReportId(state);

            /*
             * Make sure we don't make the reportID undefined when switching between the chat list and settings tab.
             * This helps prevent unnecessary re-renders.
             */
            const params = state?.routes?.[state.index]?.params;
            if (params && 'screen' in params && typeof params.screen === 'string' && params.screen.indexOf('Settings_') !== -1) {
                return;
            }
            setCurrentReportID(reportID);
        },
        [setCurrentReportID],
    );

    /**
     * The context this component exposes to child components
     * @returns currentReportID to share between central pane and LHN
     */
    const contextValue = useMemo(
        (): CurrentReportIDContextValue => ({
            updateCurrentReportID,
            currentReportID,
        }),
        [updateCurrentReportID, currentReportID],
    );

    return <CurrentReportIDContext.Provider value={contextValue}>{props.children}</CurrentReportIDContext.Provider>;
}

CurrentReportIDContextProvider.displayName = 'CurrentReportIDContextProvider';

export default function withCurrentReportID<TProps extends CurrentReportIDContextValue, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (props: Omit<TProps, keyof CurrentReportIDContextValue> & React.RefAttributes<TRef>) => React.ReactElement | null {
    function WithCurrentReportID(props: Omit<TProps, keyof CurrentReportIDContextValue>, ref: ForwardedRef<TRef>) {
        return (
            <CurrentReportIDContext.Consumer>
                {(currentReportIDUtils) => (
                    <WrappedComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...currentReportIDUtils}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...(props as TProps)}
                        ref={ref}
                    />
                )}
            </CurrentReportIDContext.Consumer>
        );
    }

    WithCurrentReportID.displayName = `withCurrentReportID(${getComponentDisplayName(WrappedComponent)})`;

    return forwardRef(WithCurrentReportID);
}

export {withCurrentReportIDDefaultProps, CurrentReportIDContextProvider, CurrentReportIDContext};
export type {CurrentReportIDContextValue};
