import {CommonActions} from '@react-navigation/native';
import {getStateFromPath} from '@react-navigation/core';
import getOneRouteDiffAction from '../../src/libs/Navigation/getOneRouteDiffAction';

import linkinConfig from '../../src/libs/Navigation/linkingConfig';

describe('getOneRouteDiffAction', () => {
    describe('mocked states', () => {
        it('returns simple action for /settings to /settings/profile', () => {
            const currentState = {
                index: 1,
                routes: [
                    {
                        name: 'Home',
                    },
                    {
                        name: 'RightModalNavigator',
                        state: {
                            routes: [
                                {
                                    name: 'Settings',
                                    state: {
                                        routes: [
                                            {
                                                name: 'Settings_Root',
                                                path: '/settings',
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            };

            const targetState = {
                index: 1,
                routes: [
                    {
                        name: 'Home',
                    },
                    {
                        name: 'RightModalNavigator',
                        state: {
                            routes: [
                                {
                                    name: 'Settings',
                                    state: {
                                        index: 1,
                                        routes: [
                                            {
                                                name: 'Settings_Root',
                                            },
                                            {
                                                name: 'Settings_Profile',
                                                path: '/settings/profile',
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            };

            const action = getOneRouteDiffAction(currentState, targetState);
            expect(action).toEqual(CommonActions.navigate({name: 'Settings_Profile', path: '/settings/profile'}));
        });
        it('returns simple action for /settings/profile to /settings/profile/display-name ', () => {
            const currentState = {
                index: 1,
                routes: [
                    {
                        name: 'Home',
                    },
                    {
                        name: 'RightModalNavigator',
                        state: {
                            routes: [
                                {
                                    name: 'Settings',
                                    state: {
                                        index: 1,
                                        routes: [
                                            {
                                                name: 'Settings_Root',
                                            },
                                            {
                                                name: 'Settings_Profile',
                                                path: '/settings/profile',
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            };

            const targetState = {
                index: 1,
                routes: [
                    {
                        name: 'Home',
                    },
                    {
                        name: 'RightModalNavigator',
                        state: {
                            routes: [
                                {
                                    name: 'Settings',
                                    state: {
                                        index: 2,
                                        routes: [
                                            {
                                                name: 'Settings_Root',
                                            },
                                            {
                                                name: 'Settings_Profile',
                                            },
                                            {
                                                name: 'Settings_Display_Name',
                                                path: '/settings/profile/display-name',
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            };
            const action = getOneRouteDiffAction(currentState, targetState);
            expect(action).toEqual(CommonActions.navigate({name: 'Settings_Display_Name', path: '/settings/profile/display-name'}));
        });
        
        it('returns simple action for /settings/profile to /settings/profile/display-name ', () => {
            const currentState = {
                index: 1,
                routes: [
                    {
                        name: 'Home',
                    },
                    {
                        name: 'RightModalNavigator',
                        state: {
                            routes: [
                                {
                                    name: 'Settings',
                                    state: {
                                        index: 1,
                                        routes: [
                                            {
                                                name: 'Settings_Root',
                                            },
                                            {
                                                name: 'Settings_Profile',
                                                path: '/settings/profile',
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            };

            const targetState = {
                index: 1,
                routes: [
                    {
                        name: 'Home',
                    },
                    {
                        name: 'RightModalNavigator',
                        state: {
                            routes: [
                                {
                                    name: 'Settings',
                                    state: {
                                        index: 2,
                                        routes: [
                                            {
                                                name: 'Settings_Root',
                                            },
                                            {
                                                name: 'Settings_Profile',
                                            },
                                            {
                                                name: 'Settings_Display_Name',
                                                path: '/settings/profile/display-name',
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            };
            const action = getOneRouteDiffAction(currentState, targetState);
            expect(action).toEqual(CommonActions.navigate({name: 'Settings_Display_Name', path: '/settings/profile/display-name'}));
        });
    });
    describe('generated states', () => {
        it('returns simple action for /settings/profile to /settings/profile/display-name with generated states', () => {
            const currentState = getStateFromPath('/settings/profile', linkinConfig.config);
            const targetState = getStateFromPath('/settings/profile/display-name', linkinConfig.config);
            const action = getOneRouteDiffAction(currentState, targetState);

            expect(action).toEqual(CommonActions.navigate({name: 'Settings_Display_Name', path: '/settings/profile/display-name'}));
        });
        it('returns simple action for /settings/profile to /settings/profile/display-name with generated states', () => {
            const currentState = getStateFromPath('/settings', linkinConfig.config);
            const targetState = getStateFromPath('/settings/profile', linkinConfig.config);
            const action = getOneRouteDiffAction(currentState, targetState);

            expect(action).toEqual(CommonActions.navigate({name: 'Settings_Profile', path: '/settings/profile'}));
        });
    });

    describe('generated states with params', () => {
        it('returns simple action for /workspaces to /workspace/1 with generated states', () => {
            const currentState = getStateFromPath('/settings/workspaces', linkinConfig.config);
            const targetState = getStateFromPath('/workspace/1', linkinConfig.config);
            const action = getOneRouteDiffAction(currentState, targetState);


            console.log('current: ', JSON.stringify(currentState));
            console.log('target: ', JSON.stringify(targetState));

            expect(action).toEqual(CommonActions.navigate({name: 'Workspace_Initial', path: '/workspace/1', params: {policyID: '1'}}));
        });
        it('returns simple action for settings/workspace/1 to settings/workspace/1/bills with generated states', () => {
            const currentState = getStateFromPath('/settings/workspaces/1', linkinConfig.config);
            const targetState = getStateFromPath('/settings/workspace/1/bills', linkinConfig.config);
            const action = getOneRouteDiffAction(currentState, targetState);

            console.log('current: ', JSON.stringify(currentState));
            console.log('target: ', JSON.stringify(targetState));
            
            expect(action).toEqual(CommonActions.navigate({name: 'Workspace_Initial_Bills', path: '/workspace/1/bills', params: {policyID: '1'}}));
        });
    });
});
