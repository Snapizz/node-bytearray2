import Endian from './endian';
import CompressionAlgorithm from './compression-algorithm';
import * as zlib from 'zlib';
import * as lzma from 'lzma-native';
import Amf from './amf';

const BUFFER_SIZE = 1024;

export default class ByteArray {

	/**
	 * @param {Buffer|ByteArray|number}
	 */
    constructor(buff) {
        this.endian = Endian.BIG;
        this.objectEncoding = -1;
        this.position = 0;
        this.shareable = false;

		if (buff instanceof ByteArray) {
			this.buffer = buff.buffer;
		} else if (buff instanceof Buffer) {
			this.buffer = buff;
		} else {
			this.buffer = new Buffer(typeof (buff) === 'number' ? Number(buff) : BUFFER_SIZE);
		}
    }

	/**
	 * @return {number}
	 */
	get bytesAvailable() {
		return this.length - this.position;
	}

	/**
	 * @return {number}
	 */
	get length() {
		return this.buffer.length;
	}

	/**
	 * @param {number} value
	 */
	set length(value) {
		this.buffer.length = length;
	}

	/**
	 * In a single atomic operation,
	 * compares an number value in this byte array with another number value and,
	 * if they match, swaps those bytes with another value.
	 * 
	 * @param {number} byteIndex
	 * @param {number} expectedValue
	 * @param {number} newValue
	 * 
	 * @return {number}
	 */
	atomicCompareAndSwapIntAt(byteIndex, expectedValue, newValue) {
		let byte = this.buffer[byteIndex];
		if (byte === expectedValue) {
			this.buffer[byteIndex] = newValue;
		}
		return byte;
	};
	/**
	 * In a single atomic operation,
	 * compares this byte array's length with a provided value and,
	 * if they match, changes the length of this byte array.
	 * 
	 * @param {number} expectedLength
	 * @param {number} newLength
	 * 
	 * @return {number}
	 */
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
	/**
	 * Clears the contents of the byte array and resets the length and position properties to 0.
	 * Calling this method explicitly frees up the memory used by the ByteArray instance.
	 */
	clear() {
		this.buffer = new Buffer(this.buffer.length);
	}
	/**
	 * Compresses the byte array. The entire byte array is compressed.
	 * After the call, the length property of the ByteArray is set to the new length.
	 * The position property is set to the end of the byte array.
	 * 
	 * @param {CompressionAlgorithm} algorithm CompressionAlgorithm enum
	 */
	compress(algorithm) {
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
	/**
	 * Compresses the byte array using the deflate compression algorithm. The entire byte array is compressed.
	 */
	deflate() {
		this.compress(CompressionAlgorith.Deflate);
	}
	/**
	 * Decompresses the byte array using the deflate compression algorithm.
	 * The byte array must have been compressed using the same algorithm.
	 */
	inflate() {
		this.uncompress(CompressionAlgorith.Deflate);
	}
	/**
	 * Reads a Boolean value from the byte stream. A single byte is read, and true is returned if the byte is nonzero, false otherwise.
	 * 
	 * @return {boolean}
	 */
	readBoolean() {
		return Boolean(this.buffer.readInt8(this.updatePosition(1)));
	}
	/**
	 * Reads a signed byte from the byte stream.
	 * 
	 * @return {number}
	 */
	readByte() {
		return this.buffer.readInt8(this.updatePosition(1));
	}
	/**
	 * Reads the number of data bytes, specified by the length parameter, from the byte stream.
	 * The bytes are read into the ByteArray object specified by the bytes parameter,
	 * and the bytes are written into the destination ByteArray starting at the position specified by offset.
	 * 
	 * @param {ByteArray} bytes
	 * @param {number} offset
	 * @param {number} length
	 * 
	 */
	readBytes(bytes, offset, length) {
		length = length || this.length;
		for (var i = offset; i < length; i++) {
			bytes.writeByte(this.readByte());
		}
	}
	/**
	 * Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
	 * 
	 * @return {number}
	 */
	readDouble() {
		let position = this.updatePosition(8);
		return this.endian === Endian.BIG
			? this.buffer.readDoubleBE(position)
			: this.buffer.readDoubleBE(position);
	}
	/**
	 * Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
	 * 
	 * @return {number}
	 */
	readFloat() {
		let position = this.updatePosition(4);
		return this.endian === Endian.BIG
			? this.buffer.readFloatBE(position)
			: this.buffer.readFloatBE(position);
	}
	/**
	 * Reads a signed 32-bit integer from the byte stream.
	 * 
	 * @return {number}
	 */
	readInt() {
		let position = this.updatePosition(4);
		return this.endian === Endian.BIG
			? this.buffer.readInt32BE(position)
			: this.buffer.readInt32LE(position);
	}
	/**
	 * Reads a multibyte string of specified length from the byte stream using the specified character set.
	 * 
	 * @param {number} length
	 * @param {string} charSet
	 * 
	 * @return {string}
	 */
	readMultiByte(length, charSet) {
		let position = this.updatePosition(length);
		return this.buffer.toString(charSet || 'utf8', position, position + length);
	}
	/**
	 * Reads an object from the byte array, encoded in AMF serialized format.
	 * 
	 * @return {object}
	 */
	readObject() {
		return Amf.read(this.buffer, this.updatePosition(this.readInt()));
	}
	/**
	 * Reads a signed 16-bit integer from the byte stream.
	 * 
	 * @return {number}
	 */
	readShort() {
		let position = this.updatePosition(2);
		return this.endian === Endian.BIG
			? this.buffer.readInt16BE(position)
			: this.buffer.readInt16LE(position);
	}
	/**
	 * Reads an unsigned byte from the byte stream.
	 * 
	 * @return {number}
	 */
	readUnsignedByte() {
		return this.buffer.readUInt8(this.updatePosition(1));
	}
	/**
	 * Reads an unsigned 32-bit integer from the byte stream.
	 * 
	 * @return {number}
	 */
	readUnsignedInt() {
		let position = this.updatePosition(4);
		return this.endian === Endian.BIG
			? this.buffer.readUInt32BE(position)
			: this.buffer.readUInt32LE(position);
	}
	/**
	 * Reads an unsigned 16-bit integer from the byte stream
	 * 
	 * @return {number}
	 */
	readUnsignedShort() {
		let position = this.updatePosition(2);
		return this.endian === Endian.BIG
			? this.buffer.readUInt16BE(position)
			: this.buffer.readUInt16LE(position);
	}
	/**
	 * Reads a UTF-8 string from the byte stream.
	 * The string is assumed to be prefixed with an unsigned short indicating the length in bytes.
	 * 
	 * @return {string}
	 */
	readUTF() {
		let len = this.readShort();
		let position = this.updatePosition(len);
		return this.buffer.toString('utf8', position, position + len);
	}
	/**
	 * Reads a sequence of UTF-8 bytes specified by the length parameter from the byte stream and return a string.
	 * 
	 * @param {number} length
	 * 
	 * @return {string}
	 */
	readUTFBytes(length) {
		return this.readMultiByte(length);
	}
	/**
	 * Provides an overridable method for customizing the JSON encoding of values in an ByteArray object.
	 * 
	 * @param {string} k
	 * 
	 * @return {object}
	 */
	toJSON(k) {
		return this.buffer.toJSON();
	}
	/**
	 * Converts the byte array to a string.
	 * If the data in the array begins with a Unicode byte order mark, the application will honor that mark when converting to a string.
	 * If System.useCodePage is set to true,
	 * the application will treat the data in the array as being in the current system code page when converting.
	 * 
	 * @param {string} encoding
	 * @param {number} offset
	 * @param {number} length
	 * 
	 * @return {string}
	 */
	toString(encoding, offset, length) {
		return this.buffer.toString(encoding || 'utf8', offset || 0, length || this.length);
	}
	/**
	 * Decompresses the byte array. After the call,
	 * the length property of the ByteArray is set to the new length. The position property is set to 0.
	 * 
	 * @param {CompressionAlgorithm} algorithm
	 */
	uncompress(algorithm) {
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
	/**
	 * Writes a Boolean value.
	 * 
	 * @param {boolean} value
	 * 
	 * @return {number}
	 */
	writeBoolean(value) {
		return this.buffer.writeInt8(Number(value), this.updatePosition(1, true));
	}
	/**
	 * Writes a byte to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeByte(value) {
		return this.buffer.writeInt8(value, this.updatePosition(1, true));
	}
	/**
	 * Writes a sequence of length bytes from the specified byte array, bytes,
	 * starting offset(zero-based index) bytes into the byte stream.
	 * 
	 * @param {ByteArray} bytes
	 * @param {number} offset
	 * @param {number} length
	 */
	writeBytes(bytes, offset, length) {
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
	/**
	 * Writes an IEEE 754 double-precision (64-bit) floating-point number to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeDouble(value) {
		let position = this.updatePosition(8, true);
		return this.endian === Endian.BIG
			? this.buffer.writeDoubleBE(value, position)
			: this.buffer.writeDoubleBE(value, position);
	}
	/**
	 * Writes an IEEE 754 single-precision (32-bit) floating-point number to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeFloat(value) {
		let position = this.updatePosition(4, true);
		return this.endian === Endian.BIG
			? this.buffer.writeFloatBE(value, position)
			: this.buffer.writeFloatBE(value, position);
	}
	/**
	 * Writes a 32-bit signed integer to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeInt(value) {
		let position = this.updatePosition(4, true);
		return this.endian === Endian.BIG
			? this.buffer.writeInt32BE(value, position)
			: this.buffer.writeInt32LE(value, position);
	}
	/**
	 * Writes a multibyte string to the byte stream using the specified character set.
	 * 
	 * @param {string} value
	 * @param {string} charSet
	 * 
	 * @return {number}
	 */
	writeMultiByte(value, charSet) {
		let len = Buffer.byteLength(value);
		return this.buffer.write(value, this.updatePosition(len, true), len, charSet || 'utf8');
	}
	/**
	 * Writes an object into the byte array in AMF serialized format.
	 * 
	 * @param {object} object
	 */
	writeObject(object) {
		let len = Buffer.byteLength(object);
		this.writeInt(len);
		Amf.write(this.buffer, object, this.updatePosition(len, true));
	}
	/**
	 * Writes a 16-bit integer to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeShort(value) {
		let position = this.updatePosition(2, true);
		return this.endian === Endian.BIG
			? this.buffer.writeInt16BE(value, position)
			: this.buffer.writeInt16LE(value, position);
	}
	/**
	 * Writes a 32-bit unsigned integer to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeUnsignedInt(value) {
		let position = this.updatePosition(4, true);
		return this.endian === Endian.BIG
			? this.buffer.writeUInt32BE(value, position)
			: this.buffer.writeUInt32LE(value, position);
	}
	/**
	 * Writes a 16-bit unsigned integer to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeUnsignedShort(value) {
		let position = this.updatePosition(2, true);
		return this.endian === Endian.BIG
			? this.buffer.writeUInt16BE(value, position)
			: this.buffer.writeUInt16LE(value, position);
	}
	/**
	 * Writes a 8-bit unsigned integer to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeUnsignedByte(value) {
		return this.buffer.writeUInt8(Number(value), this.updatePosition(1, true));
	}
	/**
	 * Writes a UTF-8 string to the byte stream.
	 * 
	 * @param {string} value
	 * 
	 * @return {number}
	 */
	writeUTF(value) {
		let len = Buffer.byteLength(value);
		this.writeShort(len);
		return this.buffer.write(value, this.updatePosition(len, true), len);
	}
	/**
	 * Writes a UTF-8 string to the byte stream.
	 * 
	 * @return {number}
	 */
	writeUTFBytes(value) {
		return this.writeMultiByte(value);
	}
	/**
	* Resize buff without unusable byte base on position
	*
	* @param {number} size
	*/
	resize(size) {
		let ba = new ByteArray(size || this.position);
		ba.writeBytes(this);
		this.position = size && this.position > size ? size : this.position;
		this.buffer = ba.buffer;
	}
	/**
	* Set position to 0
	*/
	reset() {
		this.position = 0;
	}
	/**
	* Convert ByteArray to array number
	* 
	* @return {array}
	*/
	toArray() {
		this.reset();
		var array = [];
		while (this.bytesAvailable > 0) {
			array.push(this.readByte());
		}
		return array;
	}
	/**
	* Convert array number to ByteArray
	*
	* @return {ByteArray}
	*/
	static fromArray(array) {
		let ba = new ByteArray(array.length);
		for (var i = 0; i < array.length; i++) {
			ba.writeByte(array[i]);
		}
		ba.reset();
		return ba;
	}
	/**
	 * Update position with number after use it
	 * 
	 * @param {number} n
	 * @param {boolean} isWrite
	 * 
	 * @return {number}
	 */
	updatePosition(n, isWrite) {
		if (isWrite) {
			//this.resizeBeforeWrite(n);
		}
		let a = this.position;
		this.position += n;
		return a;
	}

	/**
	 * @param {number} n
	 */
	resizeBeforeWrite(n) {
		let size = this.position + n;
		if (size >= this.length) {
			this.resize(size);
		}
	}
};
