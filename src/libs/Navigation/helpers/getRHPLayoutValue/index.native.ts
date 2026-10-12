// The native animation driver cannot animate width/left/right. Use current window geometry instead.
const getRHPLayoutValue: <T>(value: number, animatedValue: T) => T | number = (value) => value;

export default getRHPLayoutValue;
