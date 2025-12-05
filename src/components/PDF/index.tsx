import {lazy} from 'react';

const PDFPreviewer = lazy(() => import(/* webpackPrefetch: true */ 'react-fast-pdf').then((m) => ({default: m.PDFPreviewer})));
const Document = lazy(() => import(/* webpackPrefetch: true */ 'react-pdf').then((m) => ({default: m.Document})));
const Thumbnail = lazy(() => import(/* webpackPrefetch: true */ 'react-pdf').then((m) => ({default: m.Thumbnail})));

export {PDFPreviewer, Document, Thumbnail};

export * from './setup';
