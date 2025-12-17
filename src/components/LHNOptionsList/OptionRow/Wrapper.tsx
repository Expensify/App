import React from 'react';

function OptionRowLHNWrapper({children}: {children: React.ReactNode}) {
    // We can access context for Actions/State
    // const {
    //     actions: {onPress},
    // } = use(OptionRowContext);

    return (
      <>
        {/* This component can wrap the children item with eg. offline feedback capabilities */}
        {/* <OfflineWithFeedback> */}
        {children}
        {/* </OfflineWithFeedback> */}
      </>
    );
}

export default OptionRowLHNWrapper;
