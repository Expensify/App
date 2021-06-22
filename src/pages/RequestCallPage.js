import * as React from 'react';
import {Text} from 'react-native';

// NOTE: suppressing, since this will need to be a class component eventually
// eslint-disable-next-line react/prefer-stateless-function
class RequestCallPage extends React.Component {
    render() {
        return (
            <Text>This will be the Request Call Page</Text>
        );
    }
}

RequestCallPage.displayName = 'RequestCallPage';
export default RequestCallPage;
