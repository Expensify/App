import type GetKeyboardHeight from './types';

const getKeyboardHeight: GetKeyboardHeight = (height: number, bottomInset: number) => height - bottomInset;

export default getKeyboardHeight;
