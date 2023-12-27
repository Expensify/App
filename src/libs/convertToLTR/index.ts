// The Android platform has to handle switching between LTR and RTL languages a bit differently (https://developer.android.com/training/basics/supporting-devices/languages). For all other platforms, these can simply be no-op functions.
import ConvertToLTR from './types';

const convertToLTR: ConvertToLTR = (text) => text;

export default convertToLTR;
