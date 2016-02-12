var Endian = require('./endian');
var CompressionAlgorith = require('./compression-algorithm');
var zlib = require('zlib');
var lzma = require('lzma-native');
var deasync = require('deasync');
var Amf = require('./amf');
var ByteArray = (function () {
    function ByteArray(buffer, size) {
        if (size === void 0) { size = ByteArray.BUFFER_SIZE; }
        if (buffer instanceof ByteArray) {
            this.buffer = buffer.buffer;
        }
        else if (buffer instanceof Buffer) {
            this.buffer = buffer;
        }
        else {
            this.buffer = new Buffer(size);
        }
        this.shareable = false;
        this.endian = Endian.Big;
        this.objectEncoding = -1;
        this.position = 0;
    }
    Object.defineProperty(ByteArray.prototype, "bytesAvailable", {
        get: function () {
            return this.length - this.position;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "length", {
        get: function () {
            return this.buffer.length;
        },
        set: function (value) {
            this.buffer.length = length;
        },
        enumerable: true,
        configurable: true
    });
    ByteArray.prototype.atomicCompareAndSwapIntAt = function (byteIndex, expectedValue, newValue) {
        var byte = this.buffer[byteIndex];
        if (byte === expectedValue) {
            this.buffer[byteIndex] = newValue;
        }
        return byte;
    };
    ByteArray.prototype.atomicCompareAndSwapLength = function (expectedLength, newLength) {
        var prevLength = this.length;
        if (prevLength !== expectedLength) {
            return prevLength;
        }
        if (prevLength < newLength) {
            this.buffer = Buffer.concat([this.buffer, new Buffer(newLength - prevLength)], newLength);
        }
        if (prevLength > newLength) {
            this.buffer = this.buffer.slice(newLength - 1, prevLength - 1);
        }
        this.buffer.length = newLength;
        return prevLength;
    };
    ByteArray.prototype.clear = function () {
        this.buffer = new Buffer(this.buffer.length);
    };
    ByteArray.prototype.compress = function (algorithm) {
        var _this = this;
        if (algorithm === void 0) { algorithm = CompressionAlgorith.Zlib; }
        switch (algorithm) {
            case CompressionAlgorith.Deflate:
                this.buffer = zlib.deflateRawSync(this.buffer);
                break;
            case CompressionAlgorith.Zlib:
                this.buffer = zlib.deflateSync(this.buffer);
                break;
            case CompressionAlgorith.Lzma:
                var done = false;
                lzma.LZMA().compress(this.buffer, 1, function (result) {
                    _this.buffer = result;
                    done = true;
                });
                deasync.loopWhile(function () {
                    return !done;
                });
                break;
        }
    };
    ByteArray.prototype.deflate = function () {
        this.compress(CompressionAlgorith.Deflate);
    };
    ByteArray.prototype.inflate = function () {
        this.uncompress(CompressionAlgorith.Deflate);
    };
    ByteArray.prototype.readBoolean = function () {
        return Boolean(this.buffer.readInt8(this.updatePosition(1)));
    };
    ByteArray.prototype.readByte = function () {
        return this.buffer.readInt8(this.updatePosition(1));
    };
    ByteArray.prototype.readBytes = function (bytes, offset, length) {
        if (offset === void 0) { offset = 0; }
        length = length || this.readShort();
        for (var i = offset; i < length; i++) {
            if (bytes instanceof ByteArray) {
                bytes.writeByte(this.readByte());
            }
            else if (bytes instanceof Buffer) {
                bytes.writeInt8(this.readByte(), i);
            }
        }
    };
    ByteArray.prototype.readDouble = function () {
        var position = this.updatePosition(8);
        return this.endian === Endian.Big
            ? this.buffer.readDoubleBE(position)
            : this.buffer.readDoubleBE(position);
    };
    ByteArray.prototype.readFloat = function () {
        var position = this.updatePosition(4);
        return this.endian === Endian.Big
            ? this.buffer.readFloatBE(position)
            : this.buffer.readFloatBE(position);
    };
    ByteArray.prototype.readInt = function () {
        var position = this.updatePosition(4);
        return this.endian === Endian.Big
            ? this.buffer.readInt32BE(position)
            : this.buffer.readInt32LE(position);
    };
    ByteArray.prototype.readMultiByte = function (length, charSet) {
        var position = this.updatePosition(length);
        return this.buffer.toString(charSet || 'utf8', position, position + length);
    };
    ByteArray.prototype.readObject = function () {
        return Amf.read(this.buffer, this.updatePosition(this.readInt()));
    };
    ByteArray.prototype.readShort = function () {
        var position = this.updatePosition(2);
        return this.endian === Endian.Big
            ? this.buffer.readInt16BE(position)
            : this.buffer.readInt16LE(position);
    };
    ByteArray.prototype.readUnsignedByte = function () {
        return this.buffer.readUInt8(this.updatePosition(1));
    };
    ByteArray.prototype.readUnsignedInt = function () {
        var position = this.updatePosition(4);
        return this.endian === Endian.Big
            ? this.buffer.readUInt32BE(position)
            : this.buffer.readUInt32LE(position);
    };
    ByteArray.prototype.readUnsignedShort = function () {
        var position = this.updatePosition(2);
        return this.endian === Endian.Big
            ? this.buffer.readUInt16BE(position)
            : this.buffer.readUInt16LE(position);
    };
    ByteArray.prototype.readUTF = function () {
        var len = this.readShort();
        var position = this.updatePosition(len);
        return this.buffer.toString('utf8', position, position + len);
    };
    ByteArray.prototype.readUTFBytes = function (length) {
        return this.readMultiByte(length);
    };
    ByteArray.prototype.toJSON = function (k) {
        return this.buffer.toJSON();
    };
    ByteArray.prototype.toString = function (encoding, offset, length) {
        return this.buffer.toString(encoding || 'utf8', offset || 0, length || this.length);
    };
    ByteArray.prototype.uncompress = function (algorithm) {
        var _this = this;
        if (algorithm === void 0) { algorithm = CompressionAlgorith.Zlib; }
        switch (algorithm) {
            case CompressionAlgorith.Deflate:
                this.buffer = zlib.inflateRawSync(this.buffer);
                break;
            case CompressionAlgorith.Zlib:
                this.buffer = zlib.inflateSync(this.buffer);
                break;
            case CompressionAlgorith.Lzma:
                var done = false;
                lzma.LZMA().decompress(this.buffer, function (result) {
                    _this.buffer = result;
                    done = true;
                });
                deasync.loopWhile(function () {
                    return !done;
                });
                break;
        }
    };
    ByteArray.prototype.writeBoolean = function (value) {
        return this.buffer.writeInt8(Number(value), this.updatePosition(1));
    };
    ByteArray.prototype.writeByte = function (value) {
        return this.buffer.writeInt8(value, this.updatePosition(1));
    };
    ByteArray.prototype.writeBytes = function (bytes, offset, length) {
        if (offset === void 0) { offset = 0; }
        length = length || bytes.length;
        this.writeShort(length);
        for (var i = offset; i < length; i++) {
            if (bytes instanceof ByteArray) {
                this.writeByte(bytes.readByte());
            }
            else if (bytes instanceof Buffer) {
                this.writeByte(bytes.readInt8(i));
            }
        }
    };
    ByteArray.prototype.writeDouble = function (value) {
        var position = this.updatePosition(8);
        return this.endian === Endian.Big
            ? this.buffer.writeDoubleBE(value, position)
            : this.buffer.writeDoubleBE(value, position);
    };
    ByteArray.prototype.writeFloat = function (value) {
        var position = this.updatePosition(4);
        return this.endian === Endian.Big
            ? this.buffer.writeFloatBE(value, position)
            : this.buffer.writeFloatBE(value, position);
    };
    ByteArray.prototype.writeInt = function (value) {
        var position = this.updatePosition(4);
        return this.endian === Endian.Big
            ? this.buffer.writeInt32BE(value, position)
            : this.buffer.writeInt32LE(value, position);
    };
    ByteArray.prototype.writeMultiByte = function (value, charSet) {
        var len = Buffer.byteLength(value);
        return this.buffer.write(value, this.updatePosition(len), len, charSet || 'utf8');
    };
    ByteArray.prototype.writeObject = function (object) {
        var len = Buffer.byteLength(object);
        this.writeInt(len);
        Amf.write(this.buffer, object, this.updatePosition(len));
    };
    ByteArray.prototype.writeShort = function (value) {
        var position = this.updatePosition(2);
        return this.endian === Endian.Big
            ? this.buffer.writeInt16BE(value, position)
            : this.buffer.writeInt16LE(value, position);
    };
    ByteArray.prototype.writeUnsignedInt = function (value) {
        var position = this.updatePosition(4);
        return this.endian === Endian.Big
            ? this.buffer.writeUInt32BE(value, position)
            : this.buffer.writeUInt32LE(value, position);
    };
    ByteArray.prototype.writeUnsignedShort = function (value) {
        var position = this.updatePosition(2);
        return this.endian === Endian.Big
            ? this.buffer.writeUInt16BE(value, position)
            : this.buffer.writeUInt16LE(value, position);
    };
    ByteArray.prototype.writeUnsignedByte = function (value) {
        return this.buffer.writeUInt8(Number(value), this.updatePosition(1));
    };
    ByteArray.prototype.writeUTF = function (value) {
        var len = Buffer.byteLength(value);
        this.writeShort(len);
        return this.buffer.write(value, this.updatePosition(len), len);
    };
    ByteArray.prototype.writeUTFBytes = function (value) {
        return this.writeMultiByte(value);
    };
    ByteArray.prototype.updatePosition = function (n) {
        var a = this.position;
        this.position += n;
        return a;
    };
    ByteArray.BUFFER_SIZE = 1024;
    return ByteArray;
})();
module.exports = ByteArray;
