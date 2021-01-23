/**
 * On web/desktop, simply use the Tooltip component from Material-UI.
 *
 * https://material-ui.com/components/tooltips/
 */
import Tooltip from '@material-ui/core/Tooltip';
import withStyles from '@material-ui/core/styles/withStyles';
import styles from '../../styles/styles';

export default withStyles(styles.tooltip)(Tooltip);
