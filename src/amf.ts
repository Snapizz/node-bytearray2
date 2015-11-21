/// <reference path="../typings/node/node.d.ts" />

class Amf {
	public static read(buffer: Buffer, info: any): any {
		if ('number' === typeof info) {
			info = { offset: info };
		}
		if (!info) {
			info = {};
		}
		if (null == info.offset) {
			info.offset = 0;
		}

		// gets reset to 0 on each `read()` call
		info.byteLength = 0;

		// read the "type" byte
		var type = buffer.readUInt8(info.offset);
		this.bytesUsed(info, 1);

		switch (type) {
			case Amf.Amf0Type.kNumberType:
				return this.readNumber(buffer, info);
			case Amf.Amf0Type.kBooleanType:
				return this.readBoolean(buffer, info);
			case Amf.Amf0Type.kStringType:
				return this.readString(buffer, info);
			case Amf.Amf0Type.kObjectType:
				return this.readObject(buffer, info);
			case Amf.Amf0Type.kNullType:
				return null;
			case Amf.Amf0Type.kUndefinedType:
				return undefined;
			case Amf.Amf0Type.kReferenceType:
				return this.readReference(buffer, info);
			case Amf.Amf0Type.kECMAArrayType:
				return this.readECMAArray(buffer, info);
			case Amf.Amf0Type.kObjectEndType:
				return this.END_OBJECT;
			case Amf.Amf0Type.kStrictArrayType:
				return this.readStrictArray(buffer, info);
			case Amf.Amf0Type.kDateType:
				return this.readDate(buffer, info);
			case Amf.Amf0Type.kTypedObjectType:
				return this.readTypedObject(buffer, info);
			default:
				throw new Error('"type" not yet implemented: ' + type);
		}
	}

	private static bytesUsed(info: any, n: number) {
		info.offset += n;
		info.byteLength += n;
	}

	// 2.2 Number Type

	private static readNumber(buffer: Buffer, info: any): number {
		var offset = info.offset;
		this.bytesUsed(info, 8);
		return buffer.readDoubleBE(offset);
	}

	// 2.3 Boolean Type

	private static readBoolean(buffer: Buffer, info: any) {
		var offset = info.offset;
		this.bytesUsed(info, 1);
		return buffer.readUInt8(offset) !== 0;
	}

	// 2.4 String Type

	private static readString(buffer: Buffer, info: any): string {
		var offset = info.offset;

		var length = buffer.readUInt16BE(offset);
		this.bytesUsed(info, 2);

		offset = info.offset;
		this.bytesUsed(info, length);
		return buffer.toString('utf8', offset, offset + length);
	}

	// 2.5 Object Type

	private static readObject(buffer: Buffer, info: any, object?: any): any {
		var key: any, value: any;
		if (!object) {
			object = {};
		}

		if (!info.references) {
			info.references = [];
		}
		info.references.push(object);

		var temp: any = {};
		while (value !== this.END_OBJECT) {
			temp.offset = info.offset;
			temp.byteLength = 0;
			key = this.readString(buffer, temp);
			this.bytesUsed(info, temp.byteLength);

			temp.offset = info.offset;
			temp.references = info.references;
			value = this.read(buffer, temp);
			this.bytesUsed(info, temp.byteLength);

			if (value !== this.END_OBJECT) {
				object[key] = value;
			}
		}

		return object;
	}

	// 2.6 Movieclip Type
	// This type is not supported and is reserved for future use.

	// 2.7 null Type

	// 2.8 undefined Type

	// 2.9 Reference Type

	private static readReference(buffer: Buffer, info: any): any {
		var index = buffer.readUInt16BE(info.offset);
		this.bytesUsed(info, 2);
		return info.references[index];
	}

	// 2.10 ECMA Array Type

	private static readECMAArray<T>(buffer: Buffer, info: any, array?: T[]): T[] {
		if (!Array.isArray(array)) {
			array = [];
		}

		// ignored, and can't really be relied on since ECMA arrays can have numbered
		// indices, and/or names keys which may or may not be counted here
		var count = buffer.readUInt32BE(info.offset);
		this.bytesUsed(info, 4);

		// at this point it's the same binary structure as a regular Object
		this.readObject(buffer, info, array);

		return array;
	}

	// 2.11 Object End Type

	// sentinel object that signifies the "end" of an ECMA Object/Array
	private static END_OBJECT: any = { endObject: true };

	// 2.12 Strict Array Type

	private static readStrictArray<T>(buffer: Buffer, info: any, array?: T[]): T[] {
		var value: any, temp: any;
		if (!Array.isArray(array)) {
			array = [];
		}

		if (!info.references) {
			info.references = [];
		}
		info.references.push(array);

		var count = buffer.readUInt32BE(info.offset);
		this.bytesUsed(info, 4);

		temp = {};
		for (var i = 0; i < count; i++) {
			temp.offset = info.offset;
			temp.references = info.references;
			value = this.read(buffer, temp);
			this.bytesUsed(info, temp.byteLength);
			array.push(value);
		}

		return array;
	}

	// 2.13 Date Type

	private static readDate(buffer: Buffer, info: any): Date {
		// number of milliseconds elapsed since the epoch
		// of midnight on 1st Jan 1970 in the UTC time zone
		var millis = buffer.readDoubleBE(info.offset);
		this.bytesUsed(info, 8);

		// reserved, not supported SHOULD be set to 0x0000 (not enforced)
		var timezone = buffer.readInt16BE(info.offset);
		this.bytesUsed(info, 2);

		return new Date(millis);
	}

	// 2.14 Long String Type
	// 2.15 Unsupported Type

	// 2.16 RecordSet Type
	// This type is not supported and is reserved for future use.

	// 2.17 XML Document Type

	// 2.18 Typed Object Type

	private static readTypedObject(buffer: Buffer, info: any): any {
		// "typed" objects are just regular ECMA Objects with a String class name at the
		// beginning
		var name = this.readString(buffer, info);
		var obj = this.readObject(buffer, info);
		obj.__className__ = name;
		return obj;
	}

	public static write(buffer: Buffer, value: any, info: any): void {
		if ('number' === typeof info) {
			info = { offset: info };
		}
		if (!info) {
			info = {};
		}
		if (null == info.offset) {
			info.offset = 0;
		}
		var type = null == info.type ? this.getType(value, info) : info.type;

		// gets reset to 0 on each `write()` call
		info.byteLength = 0;

		// write the "type" byte
		buffer.writeUInt8(type, info.offset);
		this.bytesUsed(info, 1);

		switch (type) {
			case Amf.Amf0Type.kNumberType:
				this.writeNumber(buffer, value, info);
				break;
			case Amf.Amf0Type.kBooleanType:
				this.writeBoolean(buffer, value, info);
				break;
			case Amf.Amf0Type.kStringType:
				this.writeString(buffer, value, info);
				break;
			case Amf.Amf0Type.kObjectType:
				this.writeObject(buffer, value, info);
				break;
			case Amf.Amf0Type.kNullType:
			case Amf.Amf0Type.kUndefinedType:
				break; // nothing to do for these two...
			case Amf.Amf0Type.kReferenceType:
				this.writeReference(buffer, value, info);
				break;
			case Amf.Amf0Type.kECMAArrayType:
				this.writeECMAArray(buffer, value, info);
				break;
			case Amf.Amf0Type.kObjectEndType:
				break; // nothing to do...
			case Amf.Amf0Type.kStrictArrayType:
				//this.writeStrictArray(buffer, value, info);
				break;
			case Amf.Amf0Type.kDateType:
				//this.writeDate(buffer, value, info);
				break;
			case Amf.Amf0Type.kTypedObjectType:
				//this.writeTypedObject(buffer, value, info);
				break;
			default:
				throw new Error('"type" not yet implemented: ' + type);
		}
	}

	private static getType(value: any, info: any): number {
		if (null === value) {
			return Amf.Amf0Type.kNullType;
		}
		if (undefined === value) {
			return Amf.Amf0Type.kUndefinedType;
		}
		if (this.END_OBJECT === value) {
			return Amf.Amf0Type.kObjectEndType;
		}
		var type = typeof value;
		if ('number' === type) {
			return Amf.Amf0Type.kNumberType;
		}
		if ('boolean' === type) {
			return Amf.Amf0Type.kBooleanType;
		}
		if ('string' === type) {
			return Amf.Amf0Type.kStringType;
		}
		if ('object' === type) {
			if (this.isReference(value, info)) {
				return Amf.Amf0Type.kReferenceType;
			}
			if (Array.isArray(value)) {
				return Amf.Amf0Type.kECMAArrayType;
			}
			return Amf.Amf0Type.kObjectType;
		}
		throw new Error('could not infer AMF "type" for ' + value);
	}

	// 2.2 Number Type

	private static writeNumber(buffer: Buffer, value: any, info: any): number {
		var offset = info.offset;
		this.bytesUsed(info, 8);
		return buffer.writeDoubleBE(value, offset);
	}

	// 2.3 Boolean Type

	private static writeBoolean(buffer: Buffer, value: any, info: any): number {
		var offset = info.offset;
		this.bytesUsed(info, 1);
		return buffer.writeUInt8(value ? 1 : 0, offset);
	}

	// 2.4 String Type

	private static writeString(buffer: Buffer, value: any, info: any): number {
		var offset = info.offset;
		var encoding = 'utf8';

		// first write the byte length of the utf8 string
		var length = Buffer.byteLength(value, encoding);
		buffer.writeUInt16BE(length, offset);
		this.bytesUsed(info, 2);

		// second write the utf8 string bytes
		offset = info.offset;
		this.bytesUsed(info, length);
		var b = buffer.write(value, offset, length, encoding);
		return b;
	}

	// 2.5 Object Type

	private static writeObject(buffer: Buffer, object: any, info: any): void {
		var keys = Object.keys(object);
		var key: any, value: any;

		if (!info.references) {
			info.references = [];
		}
		info.references.push(object);

		// loop through all the keys and write their keys ana values
		var temp: any = {};
		for (var i = 0; i < keys.length; i++) {
			// write the "key"
			temp.offset = info.offset;
			temp.byteLength = 0;
			key = keys[i];
			this.writeString(buffer, key, temp);
			this.bytesUsed(info, temp.byteLength);

			// write the "value"
			temp.offset = info.offset;
			temp.references = info.references;
			value = object[key];
			this.write(buffer, value, temp);
			this.bytesUsed(info, temp.byteLength);
		}

		// now write the "end object" marker
		temp.offset = info.offset;
		temp.byteLength = 0;
		this.writeString(buffer, '', temp);
		this.bytesUsed(info, temp.byteLength);

		temp.offset = info.offset;
		this.write(buffer, this.END_OBJECT, temp);
		this.bytesUsed(info, temp.byteLength);
	}

	// 2.9 Reference Type

	private static writeReference(buffer: Buffer, value: any, info: any): void {
		var refs = info.references;
		var offset = info.offset;

		// first figure out the index of the reference
		for (var i = 0; i < refs.length; i++) {
			if (refs[i] === value) {
				break;
			}
		}

		this.bytesUsed(info, 2);
		buffer.writeUInt16BE(i, offset);
	}

	private static isReference(value: any, info: any): any {
		var rtn = false;
		var refs = info.references;
		if (refs) {
			for (var i = 0; i < refs.length; i++) {
				if (refs[i] === value) {
					rtn = true;
					break;
				}
			}
		}
		return rtn;
	}

	// 2.10 ECMA Array Type

	private static writeECMAArray(buffer: Buffer, array: any, info: any): void {

		// first write the array length
		buffer.writeUInt32BE(array.length, info.offset);
		this.bytesUsed(info, 4);

		// at this point it's the same binary structure as a regular Object
		this.writeObject(buffer, array, info);
	}
}

module Amf {
	export enum Amf0Type {
		kNumberType = 0,
		kBooleanType = 1,
		kStringType = 2,
		kObjectType = 3,
		kMovieClipType = 4,
		kNullType = 5,
		kUndefinedType = 6,
		kReferenceType = 7,
		kECMAArrayType = 8,
		kObjectEndType = 9,
		kStrictArrayType = 10,
		kDateType = 11,
		kLongStringType = 12,
		kUnsupportedType = 13,
		kRecordsetType = 14,
		kXMLObjectType = 15,
		kTypedObjectType = 16,

	}
}

export = Amf;
