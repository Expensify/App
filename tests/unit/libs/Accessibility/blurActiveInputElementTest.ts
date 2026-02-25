/* eslint-disable @typescript-eslint/naming-convention */
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
// eslint-disable-next-line import/extensions
import blurActiveInputElement from '@libs/Accessibility/blurActiveInputElement/index.ts';

jest.mock('@libs/Accessibility/blurActiveElement', () => ({
    __esModule: true,
    default: jest.fn(),
}));

describe('blurActiveInputElement', () => {
    const mockBlurActiveElement = blurActiveElement as jest.Mock;

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    it('blurs the active element when it is an input', () => {
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();

        blurActiveInputElement();

        expect(mockBlurActiveElement).toHaveBeenCalledTimes(1);
    });

    it('does nothing when the active element is not an input or textarea', () => {
        const button = document.createElement('button');
        document.body.appendChild(button);
        button.focus();

        blurActiveInputElement();

        expect(mockBlurActiveElement).not.toHaveBeenCalled();
    });
});
