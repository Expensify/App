import variables from '../variables';

export default isSmallScreenWidth => ({
    width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
});
