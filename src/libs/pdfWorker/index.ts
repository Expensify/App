// eslint-disable-next-line import/extensions
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs';
import {pdfjs} from 'react-pdf';

/**
 * Points PDF.js at its web worker. Import this module (for its side effect) before rendering anything from
 * `react-pdf` or `react-fast-pdf`: both read `GlobalWorkerOptions.workerSrc` off the single shared `pdfjs-dist`
 * instance, and neither ships a usable default (react-pdf sets a bare `'pdf.worker.mjs'` that 404s here,
 * react-fast-pdf sets nothing).
 *
 * The worker is emitted by rsbuild as a content-hashed file (`asset/resource`, see rsbuild.common.ts) and
 * included in the Workbox service worker precache alongside every other build asset, so it is available offline
 * without being inlined into a JS chunk as a string.
 */
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
