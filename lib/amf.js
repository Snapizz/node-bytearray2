/// <reference path="../typings/node/node.d.ts" />
export default class Amf {
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
        info.byteLength = 0;
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
                return this.END_OBJECT;
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
    static readNumber(buffer, info) {
        var offset = info.offset;
        this.bytesUsed(info, 8);
        return buffer.readDoubleBE(offset);
    }
    static readBoolean(buffer, info) {
        var offset = info.offset;
        this.bytesUsed(info, 1);
        return buffer.readUInt8(offset) !== 0;
    }
    static readString(buffer, info) {
        var offset = info.offset;
        var length = buffer.readUInt16BE(offset);
        this.bytesUsed(info, 2);
        offset = info.offset;
        this.bytesUsed(info, length);
        return buffer.toString('utf8', offset, offset + length);
    }
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
    static readReference(buffer, info) {
        var index = buffer.readUInt16BE(info.offset);
        this.bytesUsed(info, 2);
        return info.references[index];
    }
    static readECMAArray(buffer, info, array) {
        if (!Array.isArray(array)) {
            array = [];
        }
        var count = buffer.readUInt32BE(info.offset);
        this.bytesUsed(info, 4);
        this.readObject(buffer, info, array);
        return array;
    }
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
    static readDate(buffer, info) {
        var millis = buffer.readDoubleBE(info.offset);
        this.bytesUsed(info, 8);
        var timezone = buffer.readInt16BE(info.offset);
        this.bytesUsed(info, 2);
        return new Date(millis);
    }
    static readTypedObject(buffer, info) {
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
        info.byteLength = 0;
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
                break;
            case Amf0Type.kReferenceType:
                this.writeReference(buffer, value, info);
                break;
            case Amf0Type.kECMAArrayType:
                this.writeECMAArray(buffer, value, info);
                break;
            case Amf0Type.kObjectEndType:
                break;
            case Amf0Type.kStrictArrayType:
                break;
            case Amf0Type.kDateType:
                break;
            case Amf0Type.kTypedObjectType:
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
        if (this.END_OBJECT === value) {
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
    static writeNumber(buffer, value, info) {
        var offset = info.offset;
        this.bytesUsed(info, 8);
        return buffer.writeDoubleBE(value, offset);
    }
    static writeBoolean(buffer, value, info) {
        var offset = info.offset;
        this.bytesUsed(info, 1);
        return buffer.writeUInt8(value ? 1 : 0, offset);
    }
    static writeString(buffer, value, info) {
        var offset = info.offset;
        var encoding = 'utf8';
        var length = Buffer.byteLength(value, encoding);
        buffer.writeUInt16BE(length, offset);
        this.bytesUsed(info, 2);
        offset = info.offset;
        this.bytesUsed(info, length);
        var b = buffer.write(value, offset, length, encoding);
        return b;
    }
    static writeObject(buffer, object, info) {
        var keys = Object.keys(object);
        var key, value;
        if (!info.references) {
            info.references = [];
        }
        info.references.push(object);
        var temp = {};
        for (var i = 0; i < keys.length; i++) {
            temp.offset = info.offset;
            temp.byteLength = 0;
            key = keys[i];
            this.writeString(buffer, key, temp);
            this.bytesUsed(info, temp.byteLength);
            temp.offset = info.offset;
            temp.references = info.references;
            value = object[key];
            this.write(buffer, value, temp);
            this.bytesUsed(info, temp.byteLength);
        }
        temp.offset = info.offset;
        temp.byteLength = 0;
        this.writeString(buffer, '', temp);
        this.bytesUsed(info, temp.byteLength);
        temp.offset = info.offset;
        this.write(buffer, this.END_OBJECT, temp);
        this.bytesUsed(info, temp.byteLength);
    }
    static writeReference(buffer, value, info) {
        var refs = info.references;
        var offset = info.offset;
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
    static writeECMAArray(buffer, array, info) {
        buffer.writeUInt32BE(array.length, info.offset);
        this.bytesUsed(info, 4);
        this.writeObject(buffer, array, info);
    }
}
Amf.END_OBJECT = { endObject: true };
export var Amf0Type;
(function (Amf0Type) {
    Amf0Type[Amf0Type["kNumberType"] = 0] = "kNumberType";
    Amf0Type[Amf0Type["kBooleanType"] = 1] = "kBooleanType";
    Amf0Type[Amf0Type["kStringType"] = 2] = "kStringType";
    Amf0Type[Amf0Type["kObjectType"] = 3] = "kObjectType";
    Amf0Type[Amf0Type["kMovieClipType"] = 4] = "kMovieClipType";
    Amf0Type[Amf0Type["kNullType"] = 5] = "kNullType";
    Amf0Type[Amf0Type["kUndefinedType"] = 6] = "kUndefinedType";
    Amf0Type[Amf0Type["kReferenceType"] = 7] = "kReferenceType";
    Amf0Type[Amf0Type["kECMAArrayType"] = 8] = "kECMAArrayType";
    Amf0Type[Amf0Type["kObjectEndType"] = 9] = "kObjectEndType";
    Amf0Type[Amf0Type["kStrictArrayType"] = 10] = "kStrictArrayType";
    Amf0Type[Amf0Type["kDateType"] = 11] = "kDateType";
    Amf0Type[Amf0Type["kLongStringType"] = 12] = "kLongStringType";
    Amf0Type[Amf0Type["kUnsupportedType"] = 13] = "kUnsupportedType";
    Amf0Type[Amf0Type["kRecordsetType"] = 14] = "kRecordsetType";
    Amf0Type[Amf0Type["kXMLObjectType"] = 15] = "kXMLObjectType";
    Amf0Type[Amf0Type["kTypedObjectType"] = 16] = "kTypedObjectType";
})(Amf0Type || (Amf0Type = {}));
