import React, {PureComponent} from 'react';
import BaseSidebarScreen from './BaseSidebarScreen';

class SidebarScreen extends PureComponent {
    render() {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return (<BaseSidebarScreen {...this.props} />);
    }
}

export default SidebarScreen;
