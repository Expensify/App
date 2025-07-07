"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var usersIDs = [15593135, 51760358, 26502375];
var personalDetails = (_a = {},
    _a[usersIDs[0]] = {
        accountID: usersIDs[0],
        avatar: '@assets/images/avatars/user/default-avatar_1.svg',
        firstName: 'John',
        lastName: 'Smith',
        status: {
            clearAfter: '',
            emojiCode: '🚲',
            text: '0% cycling in Canary islands',
        },
        displayName: 'John Smith',
        login: 'johnsmith@mail.com',
        pronouns: '__predefined_heHimHis',
        timezone: {
            automatic: true,
            selected: 'Europe/Luxembourg',
        },
        phoneNumber: '11111111',
        validated: true,
    },
    _a[usersIDs[1]] = {
        accountID: usersIDs[1],
        avatar: '@assets/images/avatars/user/default-avatar_2.svg',
        firstName: 'Ted',
        lastName: 'Kowalski',
        status: {
            clearAfter: '',
            emojiCode: '🚲',
            text: '0% cycling in Canary islands',
        },
        displayName: 'Ted Kowalski',
        login: 'tedkowalski@mail.com',
        pronouns: '__predefined_heHimHis',
        timezone: {
            automatic: true,
            selected: 'Europe/Warsaw',
        },
        phoneNumber: '22222222',
        validated: true,
    },
    _a[usersIDs[2]] = {
        accountID: usersIDs[2],
        avatar: '@assets/images/avatars/user/default-avatar_3.svg',
        firstName: 'Jane',
        lastName: 'Doe',
        status: {
            clearAfter: '',
            emojiCode: '🚲',
            text: '0% cycling in Canary islands',
        },
        displayName: 'Jane Doe',
        login: 'janedoe@mail.com',
        pronouns: '__predefined_sheHerHers',
        timezone: {
            automatic: true,
            selected: 'Europe/London',
        },
        phoneNumber: '33333333',
        validated: true,
    },
    _a);
exports.default = personalDetails;
