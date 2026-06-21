/**
 * @jest-environment jsdom
 */
import {render} from '@testing-library/react-native';
import React from 'react';
import type {ReactNode} from 'react';
import Sheet from '@components/Modal/v2/compound/Sheet.web';
import Text from '@components/Text';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type PortalPropsCapture = {zIndex?: number};
const portalPropsCapture: {current: PortalPropsCapture[]} = {current: []};

jest.mock('@components/Overlay/Portal', () => {
    function MockPortal({zIndex, children}: {zIndex?: number; children?: ReactNode}) {
        portalPropsCapture.current.push({zIndex});
        return children ?? null;
    }
    return MockPortal;
});

beforeEach(() => {
    portalPropsCapture.current = [];
});

describe('Modal/v2/Sheet.web — kind-aware portal z-index', () => {
    it('maps RIGHT_DOCKED to modalRightDockedZIndex (matches v1 9997 for mixed v1↔v2 stacking)', () => {
        render(
            <Sheet kind={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}>
                <Text>Body</Text>
            </Sheet>,
        );
        expect(portalPropsCapture.current.at(-1)?.zIndex).toBe(variables.modalRightDockedZIndex);
    });

    it.each([
        ['CENTERED', CONST.MODAL.MODAL_TYPE.CENTERED],
        ['CENTERED_SMALL', CONST.MODAL.MODAL_TYPE.CENTERED_SMALL],
        ['BOTTOM_DOCKED', CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED],
        ['FULLSCREEN', CONST.MODAL.MODAL_TYPE.FULLSCREEN],
        ['CONFIRM', CONST.MODAL.MODAL_TYPE.CONFIRM],
    ])('maps %s to modalBaseZIndex (matches v1 9999)', (_label, kind) => {
        portalPropsCapture.current = [];
        render(
            <Sheet kind={kind}>
                <Text>Body</Text>
            </Sheet>,
        );
        expect(portalPropsCapture.current.at(-1)?.zIndex).toBe(variables.modalBaseZIndex);
    });

    it('keeps modalRightDockedZIndex BELOW modalBaseZIndex (v1↔v2 stacking invariant)', () => {
        expect(variables.modalRightDockedZIndex).toBeLessThan(variables.modalBaseZIndex);
    });
});
