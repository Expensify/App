import React from 'react';

// This Context API keeps track of the `route` object from the navigator so that `route` can be accessed inside
// of the tab navigator screens. This is because there is no way to access `route` inside a tab screen with reliability.
// See this convo for more context: https://expensify.slack.com/archives/C04878MDF34/p1696353684560689
// It also holds the report and transaction for the IOU so that it's easier to access in deep component trees.
// TODO: See about removing this by rendering tab components with the "children" prop.
export default React.createContext({
    report: {},
    route: {},
    transaction: {},
});
