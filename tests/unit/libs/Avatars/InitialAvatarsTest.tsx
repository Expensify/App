import {render} from '@testing-library/react-native';
import React from 'react';
import Icon from '@components/Icon';
import {DEFAULT_INITIAL, getInitialAvatarSvg, getInitialFromText} from '@libs/Avatars/InitialAvatars';

describe('getInitialFromText', () => {
    it('returns the first valid letter or number', () => {
        expect(getInitialFromText('John')).toBe('J');
        expect(getInitialFromText(' Ringo')).toBe('R');
        expect(getInitialFromText('123George')).toBe('1');
        expect(getInitialFromText('!@#Paul')).toBe('P');
    });

    it('falls back to DEFAULT_INITIAL for empty or invalid input', () => {
        expect(getInitialFromText('')).toBe(DEFAULT_INITIAL);
        expect(getInitialFromText(null)).toBe(DEFAULT_INITIAL);
        expect(getInitialFromText(undefined)).toBe(DEFAULT_INITIAL);
        expect(getInitialFromText('!@#$')).toBe(DEFAULT_INITIAL);
    });

    it('ignores non-ASCII leading characters', () => {
        expect(getInitialFromText('éJohn')).toBe('J'); // diacritic ignored
        expect(getInitialFromText('你好')).toBe(DEFAULT_INITIAL);
    });
});

describe('getInitialAvatarSvg', () => {
    it('resolves a component for a valid initial', () => {
        const AvatarComponent = getInitialAvatarSvg('J');
        expect(AvatarComponent).toBeDefined();
        expect(typeof AvatarComponent).toBe('function');
    });

    it('renders a letter avatar component', () => {
        const AvatarComponent = getInitialAvatarSvg('J');
        const {toJSON} = render(<Icon src={AvatarComponent} />);
        expect(toJSON()).toBeTruthy();
    });

    it('matches snapshot for a letter avatar', () => {
        const AvatarComponent = getInitialAvatarSvg('J');
        const {toJSON} = render(<Icon src={AvatarComponent} />);
        expect(toJSON()).toMatchSnapshot();
    });
});
