import {createNavigationContainerRef} from '@react-navigation/native';
import type {NavigationRef} from './types';

const navigationRef: NavigationRef = createNavigationContainerRef();

const navigationSidebarRef: NavigationRef = createNavigationContainerRef();

export {navigationSidebarRef};

export default navigationRef;
