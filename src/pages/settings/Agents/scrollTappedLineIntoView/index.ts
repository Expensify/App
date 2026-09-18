import type ScrollTappedLineIntoView from './types';

// Only iOS leaves the tapped line behind the keyboard, the other platforms scroll it into view on their own.
const scrollTappedLineIntoView: ScrollTappedLineIntoView = () => {};

export default scrollTappedLineIntoView;
