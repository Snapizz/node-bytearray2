/// <reference path='../typings/node/node.d.ts' />
/// <reference path='../local/lzma-native.d.ts' />
/// <reference path='../local/deasync.d.ts' />
import Endian from './endian';
import CompressionAlgorith from './compression-algorithm';
import * as zlib from 'zlib';
import * as lzma from 'lzma-native';
import * as deasync from 'deasync';
import Amf from './amf';
export default class ByteArray {
    constructor(buffer) {
        if (buffer instanceof ByteArray) {
            this.buffer = buffer.buffer;
        }
        else if (buffer instanceof Buffer) {
            this.buffer = buffer;
        }
        else {
            this.buffer = new Buffer(typeof (buffer) === 'number' ? Number(buffer) : ByteArray.BUFFER_SIZE);
        }
        this.shareable = false;
        this.endian = Endian.Big;
        this.objectEncoding = -1;
        this.position = 0;
    }
    get bytesAvailable() {
        return this.length - this.position;
    }
    get length() {
        return this.buffer.length;
    }
    set length(value) {
        this.buffer.length = length;
    }
    atomicCompareAndSwapIntAt(byteIndex, expectedValue, newValue) {
        let byte = this.buffer[byteIndex];
        if (byte === expectedValue) {
            this.buffer[byteIndex] = newValue;
        }
        return byte;
    }
    atomicCompareAndSwapLength(expectedLength, newLength) {
        let prevLength = this.length;
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
    }
    clear() {
        this.buffer = new Buffer(this.buffer.length);
    }
    compress(algorithm = CompressionAlgorith.Zlib) {
        switch (algorithm) {
            case CompressionAlgorith.Deflate:
                this.buffer = zlib.deflateRawSync(this.buffer);
                break;
            case CompressionAlgorith.Zlib:
                this.buffer = zlib.deflateSync(this.buffer);
                break;
            case CompressionAlgorith.Lzma:
                var done = false;
                lzma.LZMA().compress(this.buffer, 1, (result) => {
                    this.buffer = result;
                    done = true;
                });
                deasync.loopWhile(() => {
                    return !done;
                });
                break;
        }
    }
    deflate() {
        this.compress(CompressionAlgorith.Deflate);
    }
    inflate() {
        this.uncompress(CompressionAlgorith.Deflate);
    }
    readBoolean() {
        return Boolean(this.buffer.readInt8(this.updatePosition(1)));
    }
    readByte() {
        return this.buffer.readInt8(this.updatePosition(1));
    }
    readBytes(bytes, offset = 0, length) {
        length = length || this.length;
        for (var i = offset; i < length; i++) {
            bytes.writeByte(this.readByte());
        }
    }
    readDouble() {
        let position = this.updatePosition(8);
        return this.endian === Endian.Big
            ? this.buffer.readDoubleBE(position)
            : this.buffer.readDoubleBE(position);
    }
    readFloat() {
        let position = this.updatePosition(4);
        return this.endian === Endian.Big
            ? this.buffer.readFloatBE(position)
            : this.buffer.readFloatBE(position);
    }
    readInt() {
        let position = this.updatePosition(4);
        return this.endian === Endian.Big
            ? this.buffer.readInt32BE(position)
            : this.buffer.readInt32LE(position);
    }
    readMultiByte(length, charSet) {
        let position = this.updatePosition(length);
        return this.buffer.toString(charSet || 'utf8', position, position + length);
    }
    readObject() {
        return Amf.read(this.buffer, this.updatePosition(this.readInt()));
    }
    readShort() {
        let position = this.updatePosition(2);
        return this.endian === Endian.Big
            ? this.buffer.readInt16BE(position)
            : this.buffer.readInt16LE(position);
    }
    readUnsignedByte() {
        return this.buffer.readUInt8(this.updatePosition(1));
    }
    readUnsignedInt() {
        let position = this.updatePosition(4);
        return this.endian === Endian.Big
            ? this.buffer.readUInt32BE(position)
            : this.buffer.readUInt32LE(position);
    }
    readUnsignedShort() {
        let position = this.updatePosition(2);
        return this.endian === Endian.Big
            ? this.buffer.readUInt16BE(position)
            : this.buffer.readUInt16LE(position);
    }
    readUTF() {
        let len = this.readShort();
        let position = this.updatePosition(len);
        return this.buffer.toString('utf8', position, position + len);
    }
    readUTFBytes(length) {
        return this.readMultiByte(length);
    }
    toJSON(k) {
        return this.buffer.toJSON();
    }
    toString(encoding, offset, length) {
        return this.buffer.toString(encoding || 'utf8', offset || 0, length || this.length);
    }
    uncompress(algorithm = CompressionAlgorith.Zlib) {
        switch (algorithm) {
            case CompressionAlgorith.Deflate:
                this.buffer = zlib.inflateRawSync(this.buffer);
                break;
            case CompressionAlgorith.Zlib:
                this.buffer = zlib.inflateSync(this.buffer);
                break;
            case CompressionAlgorith.Lzma:
                var done = false;
                lzma.LZMA().decompress(this.buffer, (result) => {
                    this.buffer = result;
                    done = true;
                });
                deasync.loopWhile(() => {
                    return !done;
                });
                break;
        }
    }
    writeBoolean(value) {
        return this.buffer.writeInt8(Number(value), this.updatePosition(1, true));
    }
    writeByte(value) {
        return this.buffer.writeInt8(value, this.updatePosition(1, true));
    }
    writeBytes(bytes, offset = 0, length) {
        length = length || bytes.length;
        bytes.position = 0;
        let nsize = length - this.bytesAvailable;
        console.log(this.bytesAvailable, length, nsize);
        if (nsize > 0) {
            this.resize(this.length + nsize + 1);
        }
        for (var i = offset; i < length; i++) {
            this.writeByte(bytes.readByte());
        }
    }
    writeDouble(value) {
        let position = this.updatePosition(8, true);
        return this.endian === Endian.Big
            ? this.buffer.writeDoubleBE(value, position)
            : this.buffer.writeDoubleBE(value, position);
    }
    writeFloat(value) {
        let position = this.updatePosition(4, true);
        return this.endian === Endian.Big
            ? this.buffer.writeFloatBE(value, position)
            : this.buffer.writeFloatBE(value, position);
    }
    writeInt(value) {
        let position = this.updatePosition(4, true);
        return this.endian === Endian.Big
            ? this.buffer.writeInt32BE(value, position)
            : this.buffer.writeInt32LE(value, position);
    }
    writeMultiByte(value, charSet) {
        let len = Buffer.byteLength(value);
        return this.buffer.write(value, this.updatePosition(len, true), len, charSet || 'utf8');
    }
    writeObject(object) {
        let len = Buffer.byteLength(object);
        this.writeInt(len);
        Amf.write(this.buffer, object, this.updatePosition(len, true));
    }
    writeShort(value) {
        let position = this.updatePosition(2, true);
        return this.endian === Endian.Big
            ? this.buffer.writeInt16BE(value, position)
            : this.buffer.writeInt16LE(value, position);
    }
    writeUnsignedInt(value) {
        let position = this.updatePosition(4, true);
        return this.endian === Endian.Big
            ? this.buffer.writeUInt32BE(value, position)
            : this.buffer.writeUInt32LE(value, position);
    }
    writeUnsignedShort(value) {
        let position = this.updatePosition(2, true);
        return this.endian === Endian.Big
            ? this.buffer.writeUInt16BE(value, position)
            : this.buffer.writeUInt16LE(value, position);
    }
    writeUnsignedByte(value) {
        return this.buffer.writeUInt8(Number(value), this.updatePosition(1, true));
    }
    writeUTF(value) {
        let len = Buffer.byteLength(value);
        this.writeShort(len);
        return this.buffer.write(value, this.updatePosition(len, true), len);
    }
    writeUTFBytes(value) {
        return this.writeMultiByte(value);
    }
    resize(size) {
        let ba = new ByteArray(size || this.position);
        ba.writeBytes(this);
        this.position = size && this.position > size ? size : this.position;
        this.buffer = ba.buffer;
    }
    reset() {
        this.position = 0;
    }
    toArray() {
        this.reset();
        var array = [];
        while (this.bytesAvailable > 0) {
            array.push(this.readByte());
        }
        return array;
    }
    static fromArray(array) {
        let ba = new ByteArray(array.length);
        for (var i = 0; i < array.length; i++) {
            ba.writeByte(array[i]);
        }
        ba.reset();
        return ba;
    }
    updatePosition(n, write) {
        if (write) {
        }
        let a = this.position;
        this.position += n;
        return a;
    }
    resizeBeforeWrite(n) {
        let size = this.position + n;
        if (size >= this.length) {
            this.resize(size);
        }
    }
}
ByteArray.BUFFER_SIZE = 1024;
