import Endian from './endian';
import CompressionAlgorithm from './compression-algorithm';

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
		throw new Error('ByteArray.atomicCompareAndSwapIntAt() Not implemented');
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
		throw new Error('ByteArray.atomicCompareAndSwapLength() Not implemented');
	}
	/**
	 * Clears the contents of the byte array and resets the length and position properties to 0.
	 * Calling this method explicitly frees up the memory used by the ByteArray instance.
	 */
	clear() {
		throw new Error('ByteArray.clear() Not implemented');
	}
	/**
	 * Compresses the byte array. The entire byte array is compressed.
	 * After the call, the length property of the ByteArray is set to the new length.
	 * The position property is set to the end of the byte array.
	 * 
	 * @param {CompressionAlgorithm} algorithm CompressionAlgorithm enum
	 */
	compress(algorithm) {
		throw new Error('ByteArray.compress() Not implemented');
	}
	/**
	 * Compresses the byte array using the deflate compression algorithm. The entire byte array is compressed.
	 */
	deflate() {
		throw new Error('ByteArray.deflate() Not implemented');
	}
	/**
	 * Decompresses the byte array using the deflate compression algorithm.
	 * The byte array must have been compressed using the same algorithm.
	 */
	inflate() {
		throw new Error('ByteArray.inflate() Not implemented');
	}
	/**
	 * Reads a Boolean value from the byte stream. A single byte is read, and true is returned if the byte is nonzero, false otherwise.
	 * 
	 * @return {boolean}
	 */
	readBoolean() {
		throw new Error('ByteArray.readBoolean() Not implemented');
	}
	/**
	 * Reads a signed byte from the byte stream.
	 * 
	 * @return {number}
	 */
	readByte() {
		throw new Error('ByteArray.readByte() Not implemented');
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
		throw new Error('ByteArray.readBytes() Not implemented');
	}
	/**
	 * Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
	 * 
	 * @return {number}
	 */
	readDouble() {
		throw new Error('ByteArray.readDouble() Not implemented');
	}
	/**
	 * Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
	 * 
	 * @return {number}
	 */
	readFloat() {
		throw new Error('ByteArray.readFloat() Not implemented');
	}
	/**
	 * Reads a signed 32-bit integer from the byte stream.
	 * 
	 * @return {number}
	 */
	readInt() {
		throw new Error('ByteArray.readInt() Not implemented');
	}
	/**
	 * Reads a multibyte string of specified length from the byte stream using the specified character set.
	 * 
	 * @param {number} length
	 * @param {string} charSet
	 * 
	 * @return {string}
	 */
	readMultiByte(length, charSet) { throw new Error('ByteArray.readMultiByte() Not implemented'); }
	/**
	 * Reads an object from the byte array, encoded in AMF serialized format.
	 * 
	 * @return {object}
	 */
	readObject() { throw new Error('ByteArray.readObject() Not implemented'); }
	/**
	 * Reads a signed 16-bit integer from the byte stream.
	 * 
	 * @return {number}
	 */
	readShort() { throw new Error('ByteArray.readShort() Not implemented'); }
	/**
	 * Reads an unsigned byte from the byte stream.
	 * 
	 * @return {number}
	 */
	readUnsignedByte() { throw new Error('ByteArray.readUnsignedByte() Not implemented'); }
	/**
	 * Reads an unsigned 32-bit integer from the byte stream.
	 * 
	 * @return {number}
	 */
	readUnsignedInt() { throw new Error('ByteArray.readUnsignedInt() Not implemented'); }
	/**
	 * Reads an unsigned 16-bit integer from the byte stream
	 * 
	 * @return {number}
	 */
	readUnsignedShort() { throw new Error('ByteArray.readUnsignedShort() Not implemented'); }
	/**
	 * Reads a UTF-8 string from the byte stream.
	 * The string is assumed to be prefixed with an unsigned short indicating the length in bytes.
	 * 
	 * @return {string}
	 */
	readUTF() { throw new Error('ByteArray.readUTF() Not implemented'); }
	/**
	 * Reads a sequence of UTF-8 bytes specified by the length parameter from the byte stream and return a string.
	 * 
	 * @param {number} length
	 * 
	 * @return {string}
	 */
	readUTFBytes(length) { throw new Error('ByteArray.readUTFBytes() Not implemented'); }
	/**
	 * Provides an overridable method for customizing the JSON encoding of values in an ByteArray object.
	 * 
	 * @param {string} k
	 * 
	 * @return {object}
	 */
	toJSON(k) { throw new Error('ByteArray.toJSON() Not implemented'); }
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
	toString(encoding, offset, length) { throw new Error('ByteArray.toString() Not implemented'); }
	/**
	 * Decompresses the byte array. After the call,
	 * the length property of the ByteArray is set to the new length. The position property is set to 0.
	 * 
	 * @param {CompressionAlgorithm} algorithm
	 */
	uncompress(algorithm) { throw new Error('ByteArray.uncompress() Not implemented'); }
	/**
	 * Writes a Boolean value.
	 * 
	 * @param {boolean} value
	 * 
	 * @return {number}
	 */
	writeBoolean(value) { throw new Error('ByteArray.writeBoolean() Not implemented'); }
	/**
	 * Writes a byte to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeByte(value) { throw new Error('ByteArray.writeByte() Not implemented'); }
	/**
	 * Writes a sequence of length bytes from the specified byte array, bytes,
	 * starting offset(zero-based index) bytes into the byte stream.
	 * 
	 * @param {ByteArray} bytes
	 * @param {number} offset
	 * @param {number} length
	 */
	writeBytes(bytes, offset, length) { throw new Error('ByteArray.writeBytes() Not implemented'); }
	/**
	 * Writes an IEEE 754 double-precision (64-bit) floating-point number to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeDouble(value) { throw new Error('ByteArray.writeDouble() Not implemented'); }
	/**
	 * Writes an IEEE 754 single-precision (32-bit) floating-point number to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeFloat(value) { throw new Error('ByteArray.writeFloat() Not implemented'); }
	/**
	 * Writes a 32-bit signed integer to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeInt(value) { throw new Error('ByteArray.writeInt() Not implemented'); }
	/**
	 * Writes a multibyte string to the byte stream using the specified character set.
	 * 
	 * @param {string} value
	 * @param {string} charSet
	 * 
	 * @return {number}
	 */
	writeMultiByte(value, charSet) { throw new Error('ByteArray.writeMultiByte() Not implemented'); }
	/**
	 * Writes an object into the byte array in AMF serialized format.
	 * 
	 * @param {object} object
	 */
	writeObject(object) { throw new Error('ByteArray.writeObject() Not implemented'); }
	/**
	 * Writes a 16-bit integer to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeShort(value) { throw new Error('ByteArray.writeShort() Not implemented'); }
	/**
	 * Writes a 32-bit unsigned integer to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeUnsignedInt(value) { throw new Error('ByteArray.writeUnsignedInt() Not implemented'); }
	/**
	 * Writes a 16-bit unsigned integer to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeUnsignedShort(value) { throw new Error('ByteArray.writeUnsignedShort() Not implemented'); }
	/**
	 * Writes a 8-bit unsigned integer to the byte stream.
	 * 
	 * @param {number} value
	 * 
	 * @return {number}
	 */
	writeUnsignedByte(value) { throw new Error('ByteArray.writeUnsignedByte() Not implemented'); }
	/**
	 * Writes a UTF-8 string to the byte stream.
	 * 
	 * @param {string} value
	 * 
	 * @return {number}
	 */
	writeUTF(value) { throw new Error('ByteArray.writeUTF() Not implemented'); }
	/**
	 * Writes a UTF-8 string to the byte stream.
	 * 
	 * @return {number}
	 */
	writeUTFBytes(value) { throw new Error('ByteArray.writeUTFBytes() Not implemented'); }
	/**
	* Resize buff without unusable byte base on position
	*
	* @param {number} size
	*/
	resize(size) { throw new Error('ByteArray.resize() Not implemented'); }
	/**
	* Set position to 0
	*/
	reset() { throw new Error('ByteArray.reset() Not implemented'); }
	/**
	* Convert ByteArray to array number
	* 
	* @return {array}
	*/
	toArray() { throw new Error('ByteArray.toArray() Not implemented'); }
	/**
	* Convert array number to ByteArray
	*
	* @return {ByteArray}
	*/
	static fromArray(array) { throw new Error('ByteArray.fromArray() Not implemented'); }
	/**
	 * Update position with number after use it
	 */
	updatePosition(n) { throw new Error('ByteArray.updatePosition() Not implemented'); }
};
