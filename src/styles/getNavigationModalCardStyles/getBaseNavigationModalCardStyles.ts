import variables from '../variables';
import GetNavigationModalCardStyles from './types';

const getBaseNavigationModalCardStyles: GetNavigationModalCardStyles = ({isSmallScreenWidth}) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,
    backgroundColor: 'transparent',
    height: '100%',
});

export default getBaseNavigationModalCardStyles;
