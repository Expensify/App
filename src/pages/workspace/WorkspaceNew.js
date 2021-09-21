import React, {Component} from 'react';
import * as Policy from '../../libs/actions/Policy';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';

class WorkspaceNew extends Component {
    componentDidMount() {
        // After the workspace is created, the user will automatically be directed to its settings page
        Policy.create();
    }

    render() {
        return <FullScreenLoadingIndicator />;
    }
}

export default WorkspaceNew;
