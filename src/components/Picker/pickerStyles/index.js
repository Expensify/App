import {propTypes, defaultProps} from './propTypes';
import styles from '../../../styles/styles';

const pickerStyles = disabled => styles.expensiPicker(disabled);

pickerStyles.propTypes = propTypes;
pickerStyles.defaultProps = defaultProps;
pickerStyles.displayName = 'pickerStyles';

export default pickerStyles;
