import PropTypes from 'prop-types';
import withLocalize from '../withLocalize';

// import * as Session from '../../libs/actions/Session';
import Button from '../Button';

const propTypes = {
    apiCallback: PropTypes.func.optional,
};

const defaultProps = {
    apiCallback: () => {},
};

const GoogleSignInButton = props => <Button success onPress={() => console.log('Hello')} />;

GoogleSignInButton.displayName = 'GoogleSignInButton';
GoogleSignInButton.propTypes = propTypes;
GoogleSignInButton.defaultProps = defaultProps;
export default withLocalize(GoogleSignInButton);
