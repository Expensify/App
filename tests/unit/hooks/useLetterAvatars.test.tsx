import {renderHook} from '@testing-library/react-native';
import React from 'react';
import type {SvgProps} from 'react-native-svg';
import useLetterAvatars from '@hooks/useLetterAvatars';
// eslint-disable-next-line no-restricted-syntax -- For mocking
import * as PresetAvatarCatalog from '@libs/Avatars/PresetAvatarCatalog';

const mockAvatarComponent: React.FC<SvgProps> = React.memo((props: SvgProps) =>
    React.createElement('svg', {
        ...props,
        dataTestId: 'letter-avatar',
    }),
);

describe('useLetterAvatars', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('basic functionality', () => {
        it('should return the expected structure', () => {
            jest.spyOn(PresetAvatarCatalog, 'getLetterAvatar').mockReturnValue(mockAvatarComponent);

            const {result} = renderHook(() => useLetterAvatars('John'));

            expect(result.current).toHaveProperty('avatarList');
            expect(result.current).toHaveProperty('avatarMap');
            expect(Array.isArray(result.current.avatarList)).toBe(true);
            expect(typeof result.current.avatarMap).toBe('object');
            // LETTER_AVATAR_COLOR_OPTIONS has 18 color combinations
            expect(result.current.avatarList).toHaveLength(18);
            expect(Object.keys(result.current.avatarMap)).toHaveLength(18);
        });

        it('should create unique IDs for each avatar variant', () => {
            jest.spyOn(PresetAvatarCatalog, 'getLetterAvatar').mockReturnValue(mockAvatarComponent);

            const {result} = renderHook(() => useLetterAvatars('Bob'));

            const ids = result.current.avatarList.map((item) => item.id);
            const uniqueIds = new Set(ids);

            expect(uniqueIds.size).toBe(ids.length);
            // IDs should follow the pattern: letter-avatar-{backgroundColor}-{fillColor}-{initial}
            expect(ids.at(0)).toMatch(/^letter-avatar-#[0-9a-f]{6}-#[0-9a-f]{6}-[a-z0-9]$/i);
        });

        it('should include the StyledLetterAvatar component in each item', () => {
            jest.spyOn(PresetAvatarCatalog, 'getLetterAvatar').mockReturnValue(mockAvatarComponent);

            const {result} = renderHook(() => useLetterAvatars('Charlie'));

            for (const item of result.current.avatarList) {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('StyledLetterAvatar');
                expect(typeof item.StyledLetterAvatar).toBe('function');
            }
        });
    });

    describe('name handling', () => {
        it.each([
            ['names with special characters', 'Émilie', '-E'],
            ['names starting with numbers', '5th Avenue', '-5'],
            ['single character names', 'X', '-'],
        ])('should handle %s', (_, name, expectedChar) => {
            jest.spyOn(PresetAvatarCatalog, 'getLetterAvatar').mockReturnValue(mockAvatarComponent);

            const {result} = renderHook(() => useLetterAvatars(name));

            expect(result.current.avatarList).toHaveLength(18);
            expect(result.current.avatarList.at(0)?.id).toContain(expectedChar);
        });
    });

    describe('edge cases', () => {
        it.each([
            ['undefined string name', undefined],
            ['empty string name', ''],
            ['names with only spaces', '   '],
            ['names with only special characters', '!@#$%'],
        ])('should handle %s', (_, name) => {
            jest.spyOn(PresetAvatarCatalog, 'getLetterAvatar').mockReturnValue(null);

            const {result} = renderHook(() => useLetterAvatars(name));

            expect(result.current.avatarList).toEqual([]);
            expect(result.current.avatarMap).toEqual({});
        });
    });
});
