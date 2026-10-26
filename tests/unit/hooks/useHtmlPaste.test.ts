import {act, renderHook} from '@testing-library/react-native';

import useHtmlPaste from '@hooks/useHtmlPaste';

import type {RefObject} from 'react';
import type {TextInput} from 'react-native';

import createMock from '../../utils/createMock';

jest.mock('@src/hooks/useHtmlPaste', (): typeof useHtmlPaste => {
    return jest.requireActual('@hooks/useHtmlPaste/index.ts');
});

const originalRangeGeometryDescriptor = Object.getOwnPropertyDescriptor(Range.prototype, 'getBoundingClientRect');
let didInstallRangeGeometry = false;

beforeAll(() => {
    if (typeof Range.prototype.getBoundingClientRect === 'function') {
        return;
    }

    Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
        configurable: true,
        writable: true,
        value: (): DOMRect => ({
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            right: 0,
            bottom: 0,
            x: 0,
            y: 0,
            toJSON: () => {},
        }),
    });
    didInstallRangeGeometry = true;
});

afterAll(() => {
    if (!didInstallRangeGeometry) {
        return;
    }

    if (originalRangeGeometryDescriptor) {
        Object.defineProperty(Range.prototype, 'getBoundingClientRect', originalRangeGeometryDescriptor);
    } else {
        Reflect.deleteProperty(Range.prototype, 'getBoundingClientRect');
    }
});

describe('useHtmlPaste composer paste', () => {
    let textInputRef: RefObject<(HTMLDivElement & Pick<TextInput, 'isFocused'>) | null>;
    let textInputElement: HTMLDivElement;

    const createPasteEvent = (text: string, html = ''): ClipboardEvent => {
        const clipboardData = createMock<DataTransfer>({
            getData: (type: string) => {
                if (type === 'text/html') {
                    return html;
                }
                return type === 'text/plain' ? text : '';
            },
            types: html ? ['text/html', 'text/plain'] : ['text/plain'],
        });
        return Object.assign(new Event('paste', {bubbles: true, cancelable: true}), {clipboardData});
    };

    const pasteIntoComposer = async (text: string, html = '') => {
        renderHook(() => useHtmlPaste(textInputRef, undefined, true));
        const event = createPasteEvent(text, html);
        await act(async () => {
            document.dispatchEvent(event);
        });
    };

    beforeEach(() => {
        textInputElement = document.createElement('div');
        textInputElement.setAttribute('contenteditable', 'true');
        textInputElement.textContent = '';
        document.body.appendChild(textInputElement);
        textInputRef = {current: Object.assign(textInputElement, {isFocused: () => true})};

        const range = document.createRange();
        range.selectNodeContents(textInputElement);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    });

    afterEach(() => {
        textInputElement.remove();
    });

    it('pastes valid HTML as Markdown with the message line break', async () => {
        await pasteIntoComposer('first message second message', '<div>first message</div><div>second message</div>');

        expect(textInputElement.textContent).toBe('first message\nsecond message');
    });

    it('pastes text/plain when the HTML flavor is empty', async () => {
        await pasteIntoComposer('kept plain text', '   ');

        expect(textInputElement.textContent).toBe('kept plain text');
    });

    it('pastes text/plain when the HTML flavor is missing', async () => {
        await pasteIntoComposer('plain only');

        expect(textInputElement.textContent).toBe('plain only');
    });

    it('pastes text/plain for the native markdown input wrapper', async () => {
        await pasteIntoComposer('native markdown', '<p dir="ltr"><span>converted</span></p>');

        expect(textInputElement.textContent).toBe('native markdown');
    });
});
