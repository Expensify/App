import React, {createContext, forwardRef, useMemo, useState} from "react";
import PropTypes from "prop-types";
import getComponentDisplayName from "../../../libs/getComponentDisplayName";


const withScrollFrozenPropTypes = {
    /** flag determining if we should freeze the scroll */
    shouldFreezeScroll: PropTypes.bool,

    /** Function to update the state */
    setShouldFreezeScroll: PropTypes.func,
};

const ReportActionListFrozenScrollContext = createContext(null);


function ReportActionListFrozenScrollContextProvider(props) {
    const [shouldFreezeScroll, setShouldFreezeScroll] = useState(false);

    /**
     * The context this component exposes to child components
     * @returns {Object} flag and a flag setter
     */
    const contextValue = useMemo(
        () => ({
            shouldFreezeScroll,
            setShouldFreezeScroll,
        }),
        [shouldFreezeScroll, setShouldFreezeScroll],
    );

    return <ReportActionListFrozenScrollContext.Provider
        value={contextValue}>{props.children}</ReportActionListFrozenScrollContext.Provider>;
}

ReportActionListFrozenScrollContextProvider.displayName = 'ReportActionListFrozenScrollContextProvider';
ReportActionListFrozenScrollContextProvider.propTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

function withScrollFrozen(WrappedComponent) {
    const WithScrollFrozenState = forwardRef((props, ref) => (
        <ReportActionListFrozenScrollContext.Consumer>
            {(scrollFrozenProps) =>
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...scrollFrozenProps}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={ref}
            />
        }
        </ReportActionListFrozenScrollContext.Consumer>
    ));

    WithScrollFrozenState.displayName = `WithScrollFrozenState(${getComponentDisplayName(WrappedComponent)})`;
    return WithScrollFrozenState;
}


export {
    ReportActionListFrozenScrollContext,
    ReportActionListFrozenScrollContextProvider,
    withScrollFrozenPropTypes,
    withScrollFrozen
};
