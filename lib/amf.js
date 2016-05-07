/**
 * @enum {number}
 */
const Amf0Type = {
    kNumberType: 0,
    kBooleanType: 1,
    kStringType: 2,
    kObjectType: 3,
    kMovieClipType: 4,
    kNullType: 5,
    kUndefinedType: 6,
    kReferenceType: 7,
    kECMAArrayType: 8,
    kObjectEndType: 9,
    kStrictArrayType: 10,
    kDateType: 11,
    kLongStringType: 12,
    kUnsupportedType: 13,
    kRecordsetType: 14,
    kXMLObjectType: 15,
    kTypedObjectType: 16
}
// 2.11 Object End Type

/**
 * sentinel object that signifies the "end" of an ECMA Object/Array
 * 
 * @constant {endObject: boolean}
 */
const END_OBJECT = { endObject: true };

export default class Amf {
    /**
     * @param {Buffer} buffer
     * @param {object} info
     * @return {object}
     */
    static read(buffer, info) {
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
            case Amf0Type.kNumberType:
                return this.readNumber(buffer, info);
            case Amf0Type.kBooleanType:
                return this.readBoolean(buffer, info);
            case Amf0Type.kStringType:
                return this.readString(buffer, info);
            case Amf0Type.kObjectType:
                return this.readObject(buffer, info);
            case Amf0Type.kNullType:
                return null;
            case Amf0Type.kUndefinedType:
                return undefined;
            case Amf0Type.kReferenceType:
                return this.readReference(buffer, info);
            case Amf0Type.kECMAArrayType:
                return this.readECMAArray(buffer, info);
            case Amf0Type.kObjectEndType:
                return END_OBJECT;
            case Amf0Type.kStrictArrayType:
                return this.readStrictArray(buffer, info);
            case Amf0Type.kDateType:
                return this.readDate(buffer, info);
            case Amf0Type.kTypedObjectType:
                return this.readTypedObject(buffer, info);
            default:
                throw new Error('"type" not yet implemented: ' + type);
        }
    }

    static bytesUsed(info, n) {
        info.offset += n;
        info.byteLength += n;
    }

    // 2.2 Number Type

    static readNumber(buffer, info) {
        var offset = info.offset;
        this.bytesUsed(info, 8);
        return buffer.readDoubleBE(offset);
    }

    // 2.3 Boolean Type

    static readBoolean(buffer, info) {
        var offset = info.offset;
        this.bytesUsed(info, 1);
        return buffer.readUInt8(offset) !== 0;
    }

    // 2.4 String Type

    static readString(buffer, info) {
        var offset = info.offset;

        var length = buffer.readUInt16BE(offset);
        this.bytesUsed(info, 2);

        offset = info.offset;
        this.bytesUsed(info, length);
        return buffer.toString('utf8', offset, offset + length);
    }

    // 2.5 Object Type

    static readObject(buffer, info, object) {
        var key, value;
        if (!object) {
            object = {};
        }

        if (!info.references) {
            info.references = [];
        }
        info.references.push(object);

        var temp = {};
        while (value !== END_OBJECT) {
            temp.offset = info.offset;
            temp.byteLength = 0;
            key = this.readString(buffer, temp);
            this.bytesUsed(info, temp.byteLength);

            temp.offset = info.offset;
            temp.references = info.references;
            value = this.read(buffer, temp);
            this.bytesUsed(info, temp.byteLength);

            if (value !== END_OBJECT) {
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

    static readReference(buffer, info) {
        var index = buffer.readUInt16BE(info.offset);
        this.bytesUsed(info, 2);
        return info.references[index];
    }

    // 2.10 ECMA Array Type

    static readECMAArray(buffer, info, array) {
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

    // 2.12 Strict Array Type

    static readStrictArray(buffer, info, array) {
        var value, temp;
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

    static readDate(buffer, info) {
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

    static readTypedObject(buffer, info) {
        // "typed" objects are just regular ECMA Objects with a String class name at the
        // beginning
        var name = this.readString(buffer, info);
        var obj = this.readObject(buffer, info);
        obj.__className__ = name;
        return obj;
    }

    static write(buffer, value, info) {
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
            case Amf0Type.kNumberType:
                this.writeNumber(buffer, value, info);
                break;
            case Amf0Type.kBooleanType:
                this.writeBoolean(buffer, value, info);
                break;
            case Amf0Type.kStringType:
                this.writeString(buffer, value, info);
                break;
            case Amf0Type.kObjectType:
                this.writeObject(buffer, value, info);
                break;
            case Amf0Type.kNullType:
            case Amf0Type.kUndefinedType:
                break; // nothing to do for these two...
            case Amf0Type.kReferenceType:
                this.writeReference(buffer, value, info);
                break;
            case Amf0Type.kECMAArrayType:
                this.writeECMAArray(buffer, value, info);
                break;
            case Amf0Type.kObjectEndType:
                break; // nothing to do...
            case Amf0Type.kStrictArrayType:
                //this.writeStrictArray(buffer, value, info);
                break;
            case Amf0Type.kDateType:
                //this.writeDate(buffer, value, info);
                break;
            case Amf0Type.kTypedObjectType:
                //this.writeTypedObject(buffer, value, info);
                break;
            default:
                throw new Error('"type" not yet implemented: ' + type);
        }
    }

    static getType(value, info) {
        if (null === value) {
            return Amf0Type.kNullType;
        }
        if (undefined === value) {
            return Amf0Type.kUndefinedType;
        }
        if (END_OBJECT === value) {
            return Amf0Type.kObjectEndType;
        }
        var type = typeof value;
        if ('number' === type) {
            return Amf0Type.kNumberType;
        }
        if ('boolean' === type) {
            return Amf0Type.kBooleanType;
        }
        if ('string' === type) {
            return Amf0Type.kStringType;
        }
        if ('object' === type) {
            if (this.isReference(value, info)) {
                return Amf0Type.kReferenceType;
            }
            if (Array.isArray(value)) {
                return Amf0Type.kECMAArrayType;
            }
            return Amf0Type.kObjectType;
        }
        throw new Error('could not infer AMF "type" for ' + value);
    }

    // 2.2 Number Type

    static writeNumber(buffer, value, info) {
        var offset = info.offset;
        this.bytesUsed(info, 8);
        return buffer.writeDoubleBE(value, offset);
    }

    // 2.3 Boolean Type

    static writeBoolean(buffer, value, info) {
        var offset = info.offset;
        this.bytesUsed(info, 1);
        return buffer.writeUInt8(value ? 1 : 0, offset);
    }

    // 2.4 String Type

    static writeString(buffer, value, info) {
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

    static writeObject(buffer, object, info) {
        var keys = Object.keys(object);
        var key, value;

        if (!info.references) {
            info.references = [];
        }
        info.references.push(object);
        // loop through all the keys and write their keys ana values
        var temp = {};
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
        this.write(buffer, END_OBJECT, temp);
        this.bytesUsed(info, temp.byteLength);
    }

    // 2.9 Reference Type

    static writeReference(buffer, value, info) {
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

    static isReference(value, info) {
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

    static writeECMAArray(buffer, array, info) {

        // first write the array length
        buffer.writeUInt32BE(array.length, info.offset);
        this.bytesUsed(info, 4);

        // at this point it's the same binary structure as a regular Object
        this.writeObject(buffer, array, info);
    }
}
