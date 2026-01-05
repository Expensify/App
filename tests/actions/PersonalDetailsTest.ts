/* eslint-disable no-restricted-syntax */
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as UserAvatarUtils from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';
import * as PersonalDetailsActions from '../../src/libs/actions/PersonalDetails';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
const mockAPI = API as jest.Mocked<typeof API>;

jest.mock('@libs/Navigation/Navigation');
const mockNavigation = Navigation as jest.Mocked<typeof Navigation>;

jest.mock('@libs/PersonalDetailsUtils');
const mockPersonalDetailsUtils = PersonalDetailsUtils as jest.Mocked<typeof PersonalDetailsUtils>;

jest.mock('@libs/UserAvatarUtils');
const mockUserAvatarUtils = UserAvatarUtils as jest.Mocked<typeof UserAvatarUtils>;

describe('actions/PersonalDetails', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();

        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('updateAddress', () => {
        it('should call API.write with correct parameters and optimistic data for US addresses and navigate back', async () => {
            const addresses: Address[] = [
                {
                    street: 'Old Street',
                    city: 'Old City',
                    state: 'NY',
                    zip: '10001',
                    country: CONST.COUNTRY.US,
                    current: false,
                },
            ];
            const street = '123 Main St';
            const street2 = 'Apt 4';
            const city = 'San Francisco';
            const state = 'CA';
            const zip = '94105';
            const country: Country | '' = CONST.COUNTRY.US;

            const formattedStreet = '123 Main St Apt 4';
            mockPersonalDetailsUtils.getFormattedStreet.mockReturnValue(formattedStreet);

            PersonalDetailsActions.updateAddress(addresses, street, street2, city, state, zip, country);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_HOME_ADDRESS,
                {
                    homeAddressStreet: street,
                    addressStreet2: street2,
                    homeAddressCity: city,
                    addressState: state,
                    addressZipCode: zip,
                    addressCountry: country,
                },
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                            value: {
                                addresses: [
                                    ...addresses,
                                    {
                                        street: formattedStreet,
                                        city,
                                        state,
                                        zip,
                                        country,
                                        current: true,
                                    },
                                ],
                            },
                        },
                    ],
                },
            );

            expect(mockPersonalDetailsUtils.getFormattedStreet).toHaveBeenCalledWith(street, street2);
            expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
        });

        it('should include addressStateLong for non-US addresses', async () => {
            const addresses: Address[] = [];
            const street = '10 Downing St';
            const street2 = '';
            const city = 'London';
            const state = 'Greater London';
            const zip = 'SW1A 2AA';
            const country: Country | '' = CONST.COUNTRY.GB;

            const formattedStreet = '10 Downing St';
            mockPersonalDetailsUtils.getFormattedStreet.mockReturnValue(formattedStreet);

            PersonalDetailsActions.updateAddress(addresses, street, street2, city, state, zip, country);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_HOME_ADDRESS,
                {
                    homeAddressStreet: street,
                    addressStreet2: street2,
                    homeAddressCity: city,
                    addressState: state,
                    addressZipCode: zip,
                    addressCountry: country,
                    addressStateLong: state,
                },
                expect.objectContaining({
                    optimisticData: [
                        expect.objectContaining({
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                        }),
                    ],
                }),
            );

            expect(mockPersonalDetailsUtils.getFormattedStreet).toHaveBeenCalledWith(street, street2);
            expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateLegalName', () => {
        const mockFormatPhoneNumber = jest.fn((phoneNumber: string) => phoneNumber);
        it('should call API.write with correct parameters and optimistic data', async () => {
            const legalFirstName = 'John';
            const legalLastName = 'Doe';
            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'firstName' | 'lastName' | 'accountID' | 'email'> = {
                firstName: 'John',
                lastName: 'Doe',
                accountID: 123,
                email: 'test@example.com',
            };

            PersonalDetailsActions.updateLegalName(legalFirstName, legalLastName, mockFormatPhoneNumber, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_LEGAL_NAME,
                {legalFirstName, legalLastName},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                            value: {
                                legalFirstName,
                                legalLastName,
                            },
                        },
                    ],
                },
            );
        });

        it('should call Navigation.goBack after API.write', async () => {
            const legalFirstName = 'Jane';
            const legalLastName = 'Smith';
            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'firstName' | 'lastName' | 'accountID' | 'email'> = {
                firstName: 'Jane',
                lastName: 'Smith',
                accountID: 123,
                email: 'test@example.com',
            };

            PersonalDetailsActions.updateLegalName(legalFirstName, legalLastName, mockFormatPhoneNumber, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
        });

        it('should include display name update in optimistic data when user has no firstName and lastName', async () => {
            const legalFirstName = 'Alice';
            const legalLastName = 'Johnson';
            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'firstName' | 'lastName' | 'accountID' | 'email'> = {
                firstName: '',
                lastName: '',
                accountID: 123,
                email: 'test@example.com',
            };

            const expectedDisplayName = 'Alice Johnson';

            mockPersonalDetailsUtils.createDisplayName.mockReturnValue(expectedDisplayName);

            PersonalDetailsActions.updateLegalName(legalFirstName, legalLastName, mockFormatPhoneNumber, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_LEGAL_NAME,
                {legalFirstName, legalLastName},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                            value: {
                                legalFirstName,
                                legalLastName,
                            },
                        },
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                123: {
                                    displayName: expectedDisplayName,
                                    firstName: legalFirstName,
                                    lastName: legalLastName,
                                },
                            },
                        },
                    ],
                },
            );
        });

        it('should call PersonalDetailsUtils.createDisplayName with correct parameters when user has no firstName and lastName', async () => {
            const legalFirstName = 'Bob';
            const legalLastName = 'Wilson';
            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'firstName' | 'lastName' | 'accountID' | 'email'> = {
                firstName: '',
                lastName: '',
                accountID: 123,
                email: 'test@example.com',
            };

            PersonalDetailsActions.updateLegalName(legalFirstName, legalLastName, mockFormatPhoneNumber, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockPersonalDetailsUtils.createDisplayName).toHaveBeenCalledWith(
                'test@example.com',
                {
                    firstName: legalFirstName,
                    lastName: legalLastName,
                },
                mockFormatPhoneNumber,
            );
        });

        it('should not include display name update in optimistic data when user has firstName', async () => {
            const legalFirstName = 'Charlie';
            const legalLastName = 'Brown';

            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'firstName' | 'lastName' | 'accountID' | 'email'> = {
                firstName: 'Charlie',
                lastName: '',
                accountID: 123,
                email: 'test@example.com',
            };

            PersonalDetailsActions.updateLegalName(legalFirstName, legalLastName, mockFormatPhoneNumber, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_LEGAL_NAME,
                {legalFirstName, legalLastName},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                            value: {
                                legalFirstName,
                                legalLastName,
                            },
                        },
                    ],
                },
            );
            expect(mockPersonalDetailsUtils.createDisplayName).not.toHaveBeenCalled();
        });

        it('should not include display name update in optimistic data when user has lastName', async () => {
            const legalFirstName = 'David';
            const legalLastName = 'Miller';
            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'firstName' | 'lastName' | 'accountID' | 'email'> = {
                firstName: '',
                lastName: 'Miller',
                accountID: 123,
                email: 'test@example.com',
            };
            PersonalDetailsActions.updateLegalName(legalFirstName, legalLastName, mockFormatPhoneNumber, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_LEGAL_NAME,
                {legalFirstName, legalLastName},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                            value: {
                                legalFirstName,
                                legalLastName,
                            },
                        },
                    ],
                },
            );
            expect(mockPersonalDetailsUtils.createDisplayName).not.toHaveBeenCalled();
        });

        it('should handle empty strings for legal names', async () => {
            const legalFirstName = '';
            const legalLastName = '';

            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'firstName' | 'lastName' | 'accountID' | 'email'> = {
                firstName: '',
                lastName: '',
                accountID: 123,
                email: 'test@example.com',
            };

            PersonalDetailsActions.updateLegalName(legalFirstName, legalLastName, mockFormatPhoneNumber, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_LEGAL_NAME,
                {legalFirstName, legalLastName},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                            value: {
                                legalFirstName,
                                legalLastName,
                            },
                        },
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                123: {
                                    displayName: expect.any(String) as string,
                                    firstName: legalFirstName,
                                    lastName: legalLastName,
                                },
                            },
                        },
                    ],
                },
            );
        });

        it('should use currentUserAccountID from session for personal details update', async () => {
            const legalFirstName = 'Frank';
            const legalLastName = 'Garcia';
            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'firstName' | 'lastName' | 'accountID' | 'email'> = {
                firstName: '',
                lastName: '',
                email: 'test@example.com',
                accountID: 456,
            };

            await waitForBatchedUpdates();

            PersonalDetailsActions.updateLegalName(legalFirstName, legalLastName, mockFormatPhoneNumber, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_LEGAL_NAME,
                {legalFirstName, legalLastName},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                            value: {
                                legalFirstName,
                                legalLastName,
                            },
                        },
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                456: {
                                    displayName: expect.any(String) as string,
                                    firstName: legalFirstName,
                                    lastName: legalLastName,
                                },
                            },
                        },
                    ],
                },
            );
        });
    });

    describe('updateAvatar', () => {
        it('should call API.write with correct parameters and optimistic data for File', async () => {
            const mockFile = {
                uri: 'file://test-avatar.jpg',
                name: 'test-avatar.jpg',
            } as File;
            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'avatarThumbnail' | 'avatar' | 'accountID'> = {
                avatar: 'old-avatar.jpg',
                avatarThumbnail: 'old-avatar-thumb.jpg',
                accountID: 123,
            };

            PersonalDetailsActions.updateAvatar(mockFile, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_USER_AVATAR,
                {file: mockFile},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                123: {
                                    avatar: mockFile.uri,
                                    avatarThumbnail: mockFile.uri,
                                    originalFileName: mockFile.name,
                                    errorFields: {
                                        avatar: null,
                                    },
                                    pendingFields: {
                                        avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                        originalFileName: null,
                                    },
                                    fallbackIcon: mockFile.uri,
                                },
                            },
                        },
                    ],
                    successData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                123: {
                                    pendingFields: {
                                        avatar: null,
                                    },
                                },
                            },
                        },
                    ],
                    failureData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                123: {
                                    avatar: currentUserPersonalDetail.avatar,
                                    avatarThumbnail: currentUserPersonalDetail.avatarThumbnail ?? currentUserPersonalDetail.avatar,
                                    pendingFields: {
                                        avatar: null,
                                    },
                                },
                            },
                        },
                    ],
                },
            );
        });

        it('should call API.write with correct parameters and optimistic data for CustomRNImageManipulatorResult', async () => {
            const mockFile = {
                uri: 'file://test-avatar.jpg',
                name: 'test-avatar.jpg',
                size: 1024,
                type: 'image/jpeg',
            } as CustomRNImageManipulatorResult;
            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'avatarThumbnail' | 'avatar' | 'accountID'> = {
                avatar: 'old-avatar.jpg',
                avatarThumbnail: 'old-avatar-thumb.jpg',
                accountID: 123,
            };

            PersonalDetailsActions.updateAvatar(mockFile, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_USER_AVATAR,
                {file: mockFile},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                123: {
                                    avatar: mockFile.uri,
                                    avatarThumbnail: mockFile.uri,
                                    originalFileName: mockFile.name,
                                    errorFields: {
                                        avatar: null,
                                    },
                                    pendingFields: {
                                        avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                        originalFileName: null,
                                    },
                                    fallbackIcon: mockFile.uri,
                                },
                            },
                        },
                    ],
                    successData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                123: {
                                    pendingFields: {
                                        avatar: null,
                                    },
                                },
                            },
                        },
                    ],
                    failureData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                123: {
                                    avatar: currentUserPersonalDetail.avatar,
                                    avatarThumbnail: currentUserPersonalDetail.avatarThumbnail ?? currentUserPersonalDetail.avatar,
                                    pendingFields: {
                                        avatar: null,
                                    },
                                },
                            },
                        },
                    ],
                },
            );
        });

        it('should call API.write with correct parameters and optimistic data for DefaultAvatarResult', async () => {
            const mockFile = {
                uri: 'file://test-avatar.jpg',
                name: 'test-avatar.jpg',
                customExpensifyAvatarID: 'default-avatar_7',
            };
            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'avatarThumbnail' | 'avatar' | 'accountID'> = {
                avatar: 'old-avatar.jpg',
                avatarThumbnail: 'old-avatar-thumb.jpg',
                accountID: 123,
            };

            PersonalDetailsActions.updateAvatar(mockFile, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_USER_AVATAR,
                {customExpensifyAvatarID: mockFile.customExpensifyAvatarID},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                123: {
                                    avatar: mockFile.uri,
                                    avatarThumbnail: mockFile.uri,
                                    originalFileName: mockFile.name,
                                    errorFields: {
                                        avatar: null,
                                    },
                                    pendingFields: {
                                        avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                        originalFileName: null,
                                    },
                                    fallbackIcon: mockFile.uri,
                                },
                            },
                        },
                    ],
                    successData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                123: {
                                    pendingFields: {
                                        avatar: null,
                                    },
                                },
                            },
                        },
                    ],
                    failureData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                123: {
                                    avatar: currentUserPersonalDetail.avatar,
                                    avatarThumbnail: currentUserPersonalDetail.avatarThumbnail ?? currentUserPersonalDetail.avatar,
                                    pendingFields: {
                                        avatar: null,
                                    },
                                },
                            },
                        },
                    ],
                },
            );
        });

        it('should handle null avatarThumbnail in failure data', async () => {
            const mockFile = {
                uri: 'file://test-avatar.jpg',
                name: 'test-avatar.jpg',
            } as File;
            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'avatarThumbnail' | 'avatar' | 'accountID'> = {
                avatar: 'old-avatar.jpg',
                avatarThumbnail: undefined,
                accountID: 123,
            };

            PersonalDetailsActions.updateAvatar(mockFile, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_USER_AVATAR,
                {file: mockFile},
                expect.objectContaining({
                    failureData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                123: {
                                    avatar: currentUserPersonalDetail.avatar,
                                    avatarThumbnail: currentUserPersonalDetail.avatar,
                                    pendingFields: {
                                        avatar: null,
                                    },
                                },
                            },
                        },
                    ],
                }),
            );
        });

        it('should return early when currentUserAccountID is not set', async () => {
            await waitForBatchedUpdates();

            const mockFile = {
                uri: 'file://test-avatar.jpg',
                name: 'test-avatar.jpg',
            } as File;
            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'avatarThumbnail' | 'avatar' | 'accountID'> = {
                avatar: 'old-avatar.jpg',
                avatarThumbnail: 'old-avatar-thumb.jpg',
                accountID: CONST.DEFAULT_NUMBER_ID,
            };

            PersonalDetailsActions.updateAvatar(mockFile, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockAPI.write).not.toHaveBeenCalled();
        });
    });

    describe('deleteAvatar', () => {
        it('should call API.write with correct parameters and optimistic data', async () => {
            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'fallbackIcon' | 'avatar' | 'accountID' | 'email'> = {
                avatar: 'current-avatar.jpg',
                fallbackIcon: 'fallback-icon.jpg',
                accountID: 123,
                email: 'test@test.te',
            };
            const expectedDefaultAvatar = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png';

            mockUserAvatarUtils.getDefaultAvatarURL.mockReturnValue(expectedDefaultAvatar);

            PersonalDetailsActions.deleteAvatar(currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockUserAvatarUtils.getDefaultAvatarURL).toHaveBeenCalledWith({accountID: currentUserPersonalDetail.accountID, accountEmail: currentUserPersonalDetail.email});
            expect(mockAPI.write).toHaveBeenCalledWith(WRITE_COMMANDS.DELETE_USER_AVATAR, null, {
                optimisticData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                        value: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            123: {
                                avatar: expectedDefaultAvatar,
                                fallbackIcon: null,
                            },
                        },
                    },
                ],
                failureData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                        value: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            123: {
                                avatar: currentUserPersonalDetail.avatar,
                                fallbackIcon: currentUserPersonalDetail.fallbackIcon,
                            },
                        },
                    },
                ],
            });
        });

        it('should handle null fallbackIcon in failure data', async () => {
            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'fallbackIcon' | 'avatar' | 'accountID'> = {
                avatar: 'current-avatar.jpg',
                fallbackIcon: undefined,
                accountID: 123,
            };
            const expectedDefaultAvatar = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png';

            mockUserAvatarUtils.getDefaultAvatarURL.mockReturnValue(expectedDefaultAvatar);

            PersonalDetailsActions.deleteAvatar(currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.DELETE_USER_AVATAR,
                null,
                expect.objectContaining({
                    failureData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                123: {
                                    avatar: currentUserPersonalDetail.avatar,
                                    fallbackIcon: undefined,
                                },
                            },
                        },
                    ],
                }),
            );
        });

        it('should return early when currentUserAccountID is not set', async () => {
            await waitForBatchedUpdates();
            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'fallbackIcon' | 'avatar' | 'accountID'> = {
                avatar: 'current-avatar.jpg',
                fallbackIcon: 'fallback-icon.jpg',
                accountID: CONST.DEFAULT_NUMBER_ID,
            };

            PersonalDetailsActions.deleteAvatar(currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockUserAvatarUtils.getDefaultAvatarURL).not.toHaveBeenCalled();
            expect(mockAPI.write).not.toHaveBeenCalled();
        });

        it('should use different accountID from session', async () => {
            await waitForBatchedUpdates();

            const currentUserPersonalDetail: Pick<CurrentUserPersonalDetails, 'fallbackIcon' | 'avatar' | 'accountID'> = {
                avatar: 'current-avatar.jpg',
                fallbackIcon: 'fallback-icon.jpg',
                accountID: 456,
            };
            const expectedDefaultAvatar = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png';

            mockUserAvatarUtils.getDefaultAvatarURL.mockReturnValue(expectedDefaultAvatar);

            PersonalDetailsActions.deleteAvatar(currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockUserAvatarUtils.getDefaultAvatarURL).toHaveBeenCalledWith({accountID: 456});
            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.DELETE_USER_AVATAR,
                null,
                expect.objectContaining({
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                            value: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                456: {
                                    avatar: expectedDefaultAvatar,
                                    fallbackIcon: null,
                                },
                            },
                        },
                    ],
                }),
            );
        });
    });
});
