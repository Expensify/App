/* eslint-disable no-restricted-syntax */
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';
import * as PersonalDetailsActions from '../../src/libs/actions/PersonalDetails';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
const mockAPI = API as jest.Mocked<typeof API>;

jest.mock('@libs/Navigation/Navigation');
const mockNavigation = Navigation as jest.Mocked<typeof Navigation>;

jest.mock('@libs/PersonalDetailsUtils');
const mockPersonalDetailsUtils = PersonalDetailsUtils as jest.Mocked<typeof PersonalDetailsUtils>;

jest.mock('@libs/UserUtils');
const mockUserUtils = UserUtils as jest.Mocked<typeof UserUtils>;

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

        beforeEach(() => {
            return Onyx.set(ONYXKEYS.SESSION, {
                email: 'test@example.com',
                accountID: 123,
            }).then(waitForBatchedUpdates);
        });

        it('should call API.write with correct parameters and optimistic data', async () => {
            const legalFirstName = 'John';
            const legalLastName = 'Doe';
            const currentUserPersonalDetail: Pick<PersonalDetails, 'firstName' | 'lastName'> = {
                firstName: 'John',
                lastName: 'Doe',
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
            const currentUserPersonalDetail: Pick<PersonalDetails, 'firstName' | 'lastName'> = {
                firstName: 'Jane',
                lastName: 'Smith',
            };

            PersonalDetailsActions.updateLegalName(legalFirstName, legalLastName, mockFormatPhoneNumber, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
        });

        it('should include display name update in optimistic data when user has no firstName and lastName', async () => {
            const legalFirstName = 'Alice';
            const legalLastName = 'Johnson';
            const currentUserPersonalDetail: Pick<PersonalDetails, 'firstName' | 'lastName'> = {
                firstName: '',
                lastName: '',
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
            const currentUserPersonalDetail: Pick<PersonalDetails, 'firstName' | 'lastName'> = {
                firstName: '',
                lastName: '',
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
            const currentUserPersonalDetail: Pick<PersonalDetails, 'firstName' | 'lastName'> = {
                firstName: 'Charlie',
                lastName: '',
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
            const currentUserPersonalDetail: Pick<PersonalDetails, 'firstName' | 'lastName'> = {
                firstName: '',
                lastName: 'Miller',
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
            const currentUserPersonalDetail: Pick<PersonalDetails, 'firstName' | 'lastName'> = {
                firstName: '',
                lastName: '',
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

        it('should handle null/undefined currentUserPersonalDetail', async () => {
            const legalFirstName = 'Eve';
            const legalLastName = 'Davis';
            const currentUserPersonalDetail = null as unknown as Pick<PersonalDetails, 'firstName' | 'lastName'>;

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
            const currentUserPersonalDetail: Pick<PersonalDetails, 'firstName' | 'lastName'> = {
                firstName: '',
                lastName: '',
            };

            await Onyx.set(ONYXKEYS.SESSION, {
                email: 'test@example.com',
                accountID: 456,
            });
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
        beforeEach(() => {
            return Onyx.set(ONYXKEYS.SESSION, {
                email: 'test@example.com',
                accountID: 123,
            }).then(waitForBatchedUpdates);
        });

        it('should call API.write with correct parameters and optimistic data for File', async () => {
            const mockFile = {
                uri: 'file://test-avatar.jpg',
                name: 'test-avatar.jpg',
            } as File;
            const currentUserPersonalDetail: Pick<PersonalDetails, 'avatarThumbnail' | 'avatar'> = {
                avatar: 'old-avatar.jpg',
                avatarThumbnail: 'old-avatar-thumb.jpg',
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
            const currentUserPersonalDetail: Pick<PersonalDetails, 'avatarThumbnail' | 'avatar'> = {
                avatar: 'old-avatar.jpg',
                avatarThumbnail: 'old-avatar-thumb.jpg',
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

        it('should handle null avatarThumbnail in failure data', async () => {
            const mockFile = {
                uri: 'file://test-avatar.jpg',
                name: 'test-avatar.jpg',
            } as File;
            const currentUserPersonalDetail: Pick<PersonalDetails, 'avatarThumbnail' | 'avatar'> = {
                avatar: 'old-avatar.jpg',
                avatarThumbnail: undefined,
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
            await Onyx.set(ONYXKEYS.SESSION, {
                email: 'test@example.com',
                accountID: undefined,
            });
            await waitForBatchedUpdates();

            const mockFile = {
                uri: 'file://test-avatar.jpg',
                name: 'test-avatar.jpg',
            } as File;
            const currentUserPersonalDetail: Pick<PersonalDetails, 'avatarThumbnail' | 'avatar'> = {
                avatar: 'old-avatar.jpg',
                avatarThumbnail: 'old-avatar-thumb.jpg',
            };

            PersonalDetailsActions.updateAvatar(mockFile, currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockAPI.write).not.toHaveBeenCalled();
        });
    });

    describe('deleteAvatar', () => {
        beforeEach(() => {
            return Onyx.set(ONYXKEYS.SESSION, {
                email: 'test@example.com',
                accountID: 123,
            }).then(waitForBatchedUpdates);
        });

        it('should call API.write with correct parameters and optimistic data', async () => {
            const currentUserPersonalDetail: Pick<PersonalDetails, 'fallbackIcon' | 'avatar'> = {
                avatar: 'current-avatar.jpg',
                fallbackIcon: 'fallback-icon.jpg',
            };
            const expectedDefaultAvatar = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png';

            mockUserUtils.getDefaultAvatarURL.mockReturnValue(expectedDefaultAvatar);

            PersonalDetailsActions.deleteAvatar(currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockUserUtils.getDefaultAvatarURL).toHaveBeenCalledWith(123);
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
            const currentUserPersonalDetail: Pick<PersonalDetails, 'fallbackIcon' | 'avatar'> = {
                avatar: 'current-avatar.jpg',
                fallbackIcon: undefined,
            };
            const expectedDefaultAvatar = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png';

            mockUserUtils.getDefaultAvatarURL.mockReturnValue(expectedDefaultAvatar);

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
            await Onyx.set(ONYXKEYS.SESSION, {
                email: 'test@example.com',
                accountID: undefined,
            });
            await waitForBatchedUpdates();

            const currentUserPersonalDetail: Pick<PersonalDetails, 'fallbackIcon' | 'avatar'> = {
                avatar: 'current-avatar.jpg',
                fallbackIcon: 'fallback-icon.jpg',
            };

            PersonalDetailsActions.deleteAvatar(currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockUserUtils.getDefaultAvatarURL).not.toHaveBeenCalled();
            expect(mockAPI.write).not.toHaveBeenCalled();
        });

        it('should use different accountID from session', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {
                email: 'test@example.com',
                accountID: 456,
            });
            await waitForBatchedUpdates();

            const currentUserPersonalDetail: Pick<PersonalDetails, 'fallbackIcon' | 'avatar'> = {
                avatar: 'current-avatar.jpg',
                fallbackIcon: 'fallback-icon.jpg',
            };
            const expectedDefaultAvatar = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png';

            mockUserUtils.getDefaultAvatarURL.mockReturnValue(expectedDefaultAvatar);

            PersonalDetailsActions.deleteAvatar(currentUserPersonalDetail);
            await waitForBatchedUpdates();

            expect(mockUserUtils.getDefaultAvatarURL).toHaveBeenCalledWith(456);
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
