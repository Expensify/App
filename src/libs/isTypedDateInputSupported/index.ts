/**
 * Whether a date field accepts typed input alongside the calendar picker. Touch devices keep the picker on its own so
 * the soft keyboard does not cover the calendar.
 */
import {canUseTouchScreen} from '@libs/DeviceCapabilities';

import type IsTypedDateInputSupported from './types';

const isTypedDateInputSupported: IsTypedDateInputSupported = () => !canUseTouchScreen();

export default isTypedDateInputSupported;
