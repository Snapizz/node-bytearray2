/// <reference path="../typings/node/node.d.ts" />
var Endian = require('./endian');
var CompressionAlgorith = require('./compression-algorithm');
var ByteArray = (function () {
    function ByteArray(buffer) {
        if (buffer instanceof ByteArray) {
            this.buffer = buffer.buffer;
        }
        else if (buffer instanceof Buffer) {
            this.buffer = buffer;
        }
        else {
            this.buffer = new Buffer(ByteArray.BUFFER_SIZE);
        }
        this.shareable = false;
        this.endian = Endian.Big;
        this.objectEncoding = -1;
    }
    Object.defineProperty(ByteArray.prototype, "bytesAvailable", {
        get: function () {
            throw new Error('ByteArray.getBytesAvailable Not implemented');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "position", {
        get: function () {
            throw new Error('ByteArray.getPosition Not implemented');
        },
        set: function (value) {
            throw new Error('ByteArray.setPosition Not implemented');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "length", {
        get: function () {
            throw new Error('ByteArray.getLength Not implemented');
        },
        set: function (value) {
            throw new Error('ByteArray.setLength Not implemented');
        },
        enumerable: true,
        configurable: true
    });
    ByteArray.prototype.atomicCompareAndSwapIntAt = function (byteIndex, expectedValue, newValue) {
        throw new Error('ByteArray.atomicCompareAndSwapIntAt Not implemented');
    };
    ByteArray.prototype.atomicCompareAndSwapLength = function (expectedLength, newLength) {
        throw new Error('ByteArray.atomicCompareAndSwapLength Not implemented');
    };
    ByteArray.prototype.clear = function () {
        throw new Error('ByteArray.clear Not implemented');
    };
    ByteArray.prototype.compress = function (algorithm) {
        if (algorithm === void 0) { algorithm = CompressionAlgorith.Zlib; }
        throw new Error('ByteArray.compress Not implemented');
    };
    ByteArray.prototype.deflate = function () {
        throw new Error('ByteArray.deflate Not implemented');
    };
    ByteArray.prototype.inflate = function () {
        throw new Error('ByteArray.inflate Not implemented');
    };
    ByteArray.prototype.readBoolean = function () {
        throw new Error('ByteArray.readBoolean Not implemented');
    };
    ByteArray.prototype.readByte = function () {
        throw new Error('ByteArray.readByte Not implemented');
    };
    ByteArray.prototype.readBytes = function (bytes, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = 0; }
        throw new Error('ByteArray.readBytes Not implemented');
    };
    ByteArray.prototype.readDouble = function () {
        throw new Error('ByteArray.readDouble Not implemented');
    };
    ByteArray.prototype.readFloat = function () {
        throw new Error('ByteArray.readFloat Not implemented');
    };
    ByteArray.prototype.readInt = function () {
        throw new Error('ByteArray.readInt Not implemented');
    };
    ByteArray.prototype.readMultiByte = function (length, charSet) {
        throw new Error('ByteArray.readMultiByte Not implemented');
    };
    ByteArray.prototype.readObject = function () {
        throw new Error('ByteArray.readObject Not implemented');
    };
    ByteArray.prototype.readShort = function () {
        throw new Error('ByteArray.readShort Not implemented');
    };
    ByteArray.prototype.readUnsignedByte = function () {
        throw new Error('ByteArray.readUnsignedByte Not implemented');
    };
    ByteArray.prototype.readUnsignedInt = function () {
        throw new Error('ByteArray.readUnsignedInt Not implemented');
    };
    ByteArray.prototype.readUnsignedShort = function () {
        throw new Error('ByteArray.readUnsignedShort Not implemented');
    };
    ByteArray.prototype.readUTF = function () {
        throw new Error('ByteArray.readUTF Not implemented');
    };
    ByteArray.prototype.readUTFBytes = function (length) {
        throw new Error('ByteArray.readUTFBytes Not implemented');
    };
    ByteArray.prototype.toJSON = function (k) {
        throw new Error('ByteArray.toJSON Not implemented');
    };
    ByteArray.prototype.toString = function () {
        throw new Error('ByteArray.toString Not implemented');
    };
    ByteArray.prototype.uncompress = function (algorithm) {
        if (algorithm === void 0) { algorithm = CompressionAlgorith.Zlib; }
        throw new Error('ByteArray.uncompress Not implemented');
    };
    ByteArray.prototype.writeBoolean = function (value) {
        throw new Error('ByteArray.writeBoolean Not implemented');
    };
    ByteArray.prototype.writeByte = function (value) {
        throw new Error('ByteArray.writeByte Not implemented');
    };
    ByteArray.prototype.writeBytes = function (bytes, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = 0; }
        throw new Error('ByteArray.writeBytes Not implemented');
    };
    ByteArray.prototype.writeDouble = function (value) {
        throw new Error('ByteArray.writeDouble Not implemented');
    };
    ByteArray.prototype.writeFloat = function (value) {
        throw new Error('ByteArray.writeFloat Not implemented');
    };
    ByteArray.prototype.writeInt = function (value) {
        throw new Error('ByteArray.writeInt Not implemented');
    };
    ByteArray.prototype.writeMultiByte = function (value, charSet) {
        throw new Error('ByteArray.writeMultiByte Not implemented');
    };
    ByteArray.prototype.writeObject = function (object) {
        throw new Error('ByteArray.writeObject Not implemented');
    };
    ByteArray.prototype.writeShort = function (value) {
        throw new Error('ByteArray.writeShort Not implemented');
    };
    ByteArray.prototype.writeUnsignedInt = function (value) {
        throw new Error('ByteArray.writeUnsignedInt Not implemented');
    };
    ByteArray.prototype.writeUTF = function (value) {
        throw new Error('ByteArray.writeUTF Not implemented');
    };
    ByteArray.prototype.writeUTFBytes = function (value) {
        throw new Error('ByteArray.writeUTFBytes Not implemented');
    };
    ByteArray.BUFFER_SIZE = 1024;
    return ByteArray;
})();
module.exports = ByteArray;
