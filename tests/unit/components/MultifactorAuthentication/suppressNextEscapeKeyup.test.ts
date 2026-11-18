import type suppressNextEscapeKeyupType from '@components/MultifactorAuthentication/suppressNextEscapeKeyup';

// Jest resolves the native variant by default, so each variant is loaded by its explicit file name.
const suppressNextEscapeKeyupWeb = jest.requireActual<{default: typeof suppressNextEscapeKeyupType}>('@components/MultifactorAuthentication/suppressNextEscapeKeyup/index.ts').default;
const suppressNextEscapeKeyupNative = jest.requireActual<{default: typeof suppressNextEscapeKeyupType}>(
    '@components/MultifactorAuthentication/suppressNextEscapeKeyup/index.native.ts',
).default;

function dispatchKeyup(key: string): jest.SpyInstance {
    const event = new KeyboardEvent('keyup', {key, cancelable: true, bubbles: true});
    const stopImmediatePropagationSpy = jest.spyOn(event, 'stopImmediatePropagation');
    document.dispatchEvent(event);
    return stopImmediatePropagationSpy;
}

describe('suppressNextEscapeKeyup', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('web', () => {
        it('swallows the matching Escape keyup so the confirmation modal does not close immediately', () => {
            // Given the Escape keydown that opens the cancel confirmation armed the suppression
            suppressNextEscapeKeyupWeb();

            // When that Escape is released
            // Then its keyup is stopped, because the confirmation modal closes on Escape keyup and would vanish right away
            expect(dispatchKeyup('Escape')).toHaveBeenCalledTimes(1);
        });

        it('lets a non-Escape keyup that races in propagate', () => {
            // Given the suppression is armed by an Escape keydown
            suppressNextEscapeKeyupWeb();

            // When another key is released before Escape
            // Then that keyup is untouched, because only the Escape release can close the confirmation modal
            expect(dispatchKeyup('Enter')).not.toHaveBeenCalled();
        });

        it('removes itself after one keyup, so a later Escape is not swallowed', () => {
            // Given the suppression already swallowed the opening Escape release
            suppressNextEscapeKeyupWeb();
            dispatchKeyup('Escape');

            // When the user releases Escape again
            // Then it goes through, so the user can still dismiss the confirmation modal with Escape
            expect(dispatchKeyup('Escape')).not.toHaveBeenCalled();
        });

        it('removes itself even when the first keyup is not Escape', () => {
            // Given the suppression was used up by another key released first
            suppressNextEscapeKeyupWeb();
            dispatchKeyup('Enter');

            // When Escape is released later
            // Then it goes through, so a leftover listener can never swallow an unrelated Escape
            expect(dispatchKeyup('Escape')).not.toHaveBeenCalled();
        });

        it('stops swallowing once the window loses focus, so a lost keyup cannot eat a later Escape', () => {
            // Given the suppression is armed, and the window loses focus before Escape is released
            suppressNextEscapeKeyupWeb();
            window.dispatchEvent(new Event('blur'));

            // When Escape is pressed and released later
            // Then it goes through, because the keyup of the opening press was never going to arrive
            expect(dispatchKeyup('Escape')).not.toHaveBeenCalled();
        });

        it('arms one listener for a held Escape, so only its release is swallowed', () => {
            // Key repeat sends a keydown, and so a request, several times before the single release.
            // Given Escape is held, so key repeat arms the suppression several times
            suppressNextEscapeKeyupWeb();
            suppressNextEscapeKeyupWeb();
            suppressNextEscapeKeyupWeb();

            // When the held Escape is released
            // Then only that release is swallowed
            expect(dispatchKeyup('Escape')).toHaveBeenCalledTimes(1);
            // When Escape is pressed again
            // Then it goes through, because stacked listeners would keep swallowing the user's later Escapes
            expect(dispatchKeyup('Escape')).not.toHaveBeenCalled();
        });
    });

    describe('native', () => {
        it('never touches document, which does not exist there', () => {
            // Given a spy on document listeners, standing in for a document that native does not have
            const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

            // When the native variant is called
            suppressNextEscapeKeyupNative();

            // Then nothing is armed, because touching document on native would crash and there is no Escape keyup to swallow
            expect(addEventListenerSpy).not.toHaveBeenCalled();
            expect(dispatchKeyup('Escape')).not.toHaveBeenCalled();
        });
    });
});
