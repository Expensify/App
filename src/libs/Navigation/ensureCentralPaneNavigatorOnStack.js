import _ from 'lodash';
import NAVIGATORS from '../../NAVIGATORS';

const ensureCentralPaneNavigatorOnStack = (state) => {
    if (!_.find(state.routes, r => r.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR)) {
        state.routes.splice(1, 0, {name: NAVIGATORS.CENTRAL_PANE_NAVIGATOR});
        // eslint-disable-next-line no-param-reassign
        state.index = state.routes.length - 1;
    }
    return state;
};

export default ensureCentralPaneNavigatorOnStack;
