/* eslint-disable */
// @ts-nocheck
/**
 * CJS-compatible mock of d3-scale for Jest.
 *
 * d3-scale is ESM-only ("type": "module") so it cannot be require()'d in Jest's CJS runtime.
 * Verbatim copy of the relevant parts of d3-array/src/ticks.js and d3-scale/src/linear.js.
 */

// d3-array/src/ticks.js
const e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);

function tickSpec(start, stop, count) {
    const step = (stop - start) / Math.max(0, count),
        power = Math.floor(Math.log10(step)),
        error = step / Math.pow(10, power),
        factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
    let i1, i2, inc;
    if (power < 0) {
        inc = Math.pow(10, -power) / factor;
        i1 = Math.round(start * inc);
        i2 = Math.round(stop * inc);
        if (i1 / inc < start) ++i1;
        if (i2 / inc > stop) --i2;
        inc = -inc;
    } else {
        inc = Math.pow(10, power) * factor;
        i1 = Math.round(start / inc);
        i2 = Math.round(stop / inc);
        if (i1 * inc < start) ++i1;
        if (i2 * inc > stop) --i2;
    }
    if (i2 < i1 && 0.5 <= count && count < 2) return tickSpec(start, stop, count * 2);
    return [i1, i2, inc];
}

function ticks(start, stop, count) {
    ((stop = +stop), (start = +start), (count = +count));
    if (!(count > 0)) return [];
    if (start === stop) return [start];
    const reverse = stop < start,
        [i1, i2, inc] = reverse ? tickSpec(stop, start, count) : tickSpec(start, stop, count);
    if (!(i2 >= i1)) return [];
    const n = i2 - i1 + 1,
        ticks = new Array(n);
    if (reverse) {
        if (inc < 0) for (let i = 0; i < n; ++i) ticks[i] = (i2 - i) / -inc;
        else for (let i = 0; i < n; ++i) ticks[i] = (i2 - i) * inc;
    } else {
        if (inc < 0) for (let i = 0; i < n; ++i) ticks[i] = (i1 + i) / -inc;
        else for (let i = 0; i < n; ++i) ticks[i] = (i1 + i) * inc;
    }
    return ticks;
}

function tickIncrement(start, stop, count) {
    ((stop = +stop), (start = +start), (count = +count));
    return tickSpec(start, stop, count)[2];
}

// d3-scale/src/linear.js
function scaleLinear() {
    let domain = [0, 1];

    const scale = {
        domain(d) {
            if (!d) return domain;
            domain = [...d];
            return scale;
        },
        nice(count = 10) {
            var d = domain;
            var i0 = 0;
            var i1 = d.length - 1;
            var start = d[i0];
            var stop = d[i1];
            var prestep;
            var step;
            var maxIter = 10;

            if (stop < start) {
                ((step = start), (start = stop), (stop = step));
                ((step = i0), (i0 = i1), (i1 = step));
            }

            while (maxIter-- > 0) {
                step = tickIncrement(start, stop, count);
                if (step === prestep) {
                    d[i0] = start;
                    d[i1] = stop;
                    domain = d;
                    return scale;
                } else if (step > 0) {
                    start = Math.floor(start / step) * step;
                    stop = Math.ceil(stop / step) * step;
                } else if (step < 0) {
                    start = Math.ceil(start * step) / step;
                    stop = Math.floor(stop * step) / step;
                } else {
                    break;
                }
                prestep = step;
            }
            return scale;
        },
        ticks(count = 10) {
            var d = domain;
            return ticks(d[0], d[d.length - 1], count);
        },
    };

    return scale;
}

module.exports = {scaleLinear};
