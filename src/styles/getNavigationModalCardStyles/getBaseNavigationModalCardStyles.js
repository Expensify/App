import variables from '../variables';

export default isSmallScreenWidth => ({
    position: 'absolute',
    top: 0,
    right: 0,
    width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,
    backgroundColor: 'transparent',
    height: '100%',
});
