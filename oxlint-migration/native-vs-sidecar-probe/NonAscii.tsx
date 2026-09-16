import {useRef} from 'react';

// The point of this fixture is the non-ASCII above the bug, not the copy itself. Every character
// here is more than one UTF-8 byte, so oxc's byte offset for the ref read below is well ahead of
// the same position counted in UTF-16 code units: 😀 is four bytes and two units, é is two bytes
// and one unit, and 日本語 and € are three bytes each.
const LABEL = '😀😀😀😀😀😀😀😀 café 日本語 € ⚠️';

function NonAscii() {
    const ref = useRef(0);

    // BUG: reading a ref while rendering. This line, and only this line, is what rc/refs has to
    // report. Counting the offset above in UTF-16 units instead of bytes lands several lines past it.
    const doubled = ref.current * 2;

    return (
        <div>
            {LABEL}
            {doubled}
        </div>
    );
}

export default NonAscii;
