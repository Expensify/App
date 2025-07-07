"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("../../src/CONST");
var DateUtils_1 = require("../../src/libs/DateUtils");
var FileUtils = require("../../src/libs/fileDownload/FileUtils");
jest.useFakeTimers();
describe('FileUtils', function () {
    describe('splitExtensionFromFileName', function () {
        it('should return correct file name and extension', function () {
            var file = FileUtils.splitExtensionFromFileName('image.jpg');
            expect(file.fileName).toEqual('image');
            expect(file.fileExtension).toEqual('jpg');
        });
        it('should return correct file name and extension even with multiple dots on the file name', function () {
            var file = FileUtils.splitExtensionFromFileName('image.pdf.jpg');
            expect(file.fileName).toEqual('image.pdf');
            expect(file.fileExtension).toEqual('jpg');
        });
        it('should return empty extension if the file name does not have it', function () {
            var file = FileUtils.splitExtensionFromFileName('image');
            expect(file.fileName).toEqual('image');
            expect(file.fileExtension).toEqual('');
        });
    });
    describe('appendTimeToFileName', function () {
        it('should append current time to the end of the file name', function () {
            var actualFileName = FileUtils.appendTimeToFileName('image.jpg');
            var expectedFileName = "image-".concat(DateUtils_1.default.getDBTime(), ".jpg");
            expect(actualFileName).toEqual(expectedFileName.replace(CONST_1.default.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_'));
        });
        it('should append current time to the end of the file name without extension', function () {
            var actualFileName = FileUtils.appendTimeToFileName('image');
            var expectedFileName = "image-".concat(DateUtils_1.default.getDBTime());
            expect(actualFileName).toEqual(expectedFileName.replace(CONST_1.default.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_'));
        });
    });
});
