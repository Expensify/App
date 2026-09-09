import type {AnimatedMarkdownTextInputRef} from '@components/RNMarkdownTextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

/**
 * Wrap the external ref in a Proxy so programmatic focus() calls
 * are suppressed while in landscape mode
 * @param textInputRef The external ref to wrap in a Proxy
 * @returns The wrapped ref
 */
function getLandscapeTextInputRefProxy(textInputRef: BaseTextInputRef | null): BaseTextInputRef | null;
function getLandscapeTextInputRefProxy(textInputRef: AnimatedMarkdownTextInputRef | null): AnimatedMarkdownTextInputRef | null;
function getLandscapeTextInputRefProxy(textInputRef: AnimatedMarkdownTextInputRef | BaseTextInputRef | null): AnimatedMarkdownTextInputRef | BaseTextInputRef | null {
    return textInputRef
        ? new Proxy(textInputRef, {
              get(target, prop, receiver) {
                  if (prop !== 'focus') {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                      return Reflect.get(target, prop, receiver);
                  }
                  return () => {};
              },
          })
        : textInputRef;
}

export default getLandscapeTextInputRefProxy;
