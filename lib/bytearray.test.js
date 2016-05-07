import assert from 'assert';
import ByteArray from './bytearray';

describe('ByteArray', function () {

	it('should be init', function () {
		var ba = new ByteArray();
		expect(ba.length).toEqual(1024);
		expect(ba.position).toEqual(0);
		expect(ba.bytesAvailable).toEqual(1024);
		expect(ba.shareable).toEqual(false);
		expect(ba.endian).toEqual(0);
		expect(ba.objectEncoding).toEqual(-1);
	});
	
	// wba.resize();
	var byteArray = new ByteArray();
	
	it('should read/write boolean', function () {
		var wba = new ByteArray();
		wba.writeBoolean(true);
		wba.writeBoolean(false);
		wba.writeBoolean(true);
		var rba = new ByteArray(wba);
		expect(rba.readBoolean()).toEqual(true);
		expect(rba.readBoolean()).toEqual(false);
		expect(rba.readBoolean()).toEqual(true);
	});

	it('should read/write UnsignedShort', function () {
		var wba = new ByteArray();
		wba.writeUnsignedShort(4);
		wba.writeUnsignedShort(54);
		wba.writeUnsignedShort(15);
		var rba = new ByteArray(wba);
		expect(rba.readUnsignedShort()).toEqual(4);
		expect(rba.readUnsignedShort()).toEqual(54);
		expect(rba.readUnsignedShort()).toEqual(15);
	});

	it('should read/write UnsignedInt', function () {
		var wba = new ByteArray();
		wba.writeUnsignedInt(47);
		wba.writeUnsignedInt(23);
		wba.writeUnsignedInt(15459);
		var rba = new ByteArray(wba);
		expect(rba.readUnsignedInt()).toEqual(47);
		expect(rba.readUnsignedInt()).toEqual(23);
		expect(rba.readUnsignedInt()).toEqual(15459);
	});

	it('should read/write UnsignedByte', function () {
		var wba = new ByteArray();
		wba.writeUnsignedByte(6);
		wba.writeUnsignedByte(68);
		wba.writeUnsignedByte(89);
		var rba = new ByteArray(wba);
		expect(rba.readUnsignedByte()).toEqual(6);
		expect(rba.readUnsignedByte()).toEqual(68);
		expect(rba.readUnsignedByte()).toEqual(89);
	});

	it('should read/write Short', function () {
		var wba = new ByteArray();
		wba.writeShort(-59);
		wba.writeShort(-96);
		wba.writeShort(119);
		var rba = new ByteArray(wba);
		expect(rba.readShort()).toEqual(-59);
		expect(rba.readShort()).toEqual(-96);
		expect(rba.readShort()).toEqual(119);
	});

	it('should read/write Int', function () {
		var wba = new ByteArray();
		wba.writeInt(4);
		wba.writeInt(-9654);
		wba.writeInt(789);
		var rba = new ByteArray(wba);
		expect(rba.readInt()).toEqual(4);
		expect(rba.readInt()).toEqual(-9654);
		expect(rba.readInt()).toEqual(789);
	});

	it('should read/write Float', function () {
		var wba = new ByteArray();
		wba.writeFloat(4.32658);
		wba.writeFloat(54.254);
		wba.writeFloat(15.48);
		var rba = new ByteArray(wba);
		expect(Number(rba.readFloat().toFixed(5))).toEqual(4.32658);
		expect(Number(rba.readFloat().toFixed(3))).toEqual(54.254);
		expect(Number(rba.readFloat().toFixed(2))).toEqual(15.48);
	});

	it('should read/write Double', function () {
		var wba = new ByteArray();
		wba.writeDouble(4.4);
		wba.writeDouble(2.34);
		wba.writeDouble(89.952);
		var rba = new ByteArray(wba);
		expect(rba.readDouble()).toEqual(4.4);
		expect(rba.readDouble()).toEqual(2.34);
		expect(rba.readDouble()).toEqual(89.952);
	});

	it('should read/write Byte', function () {
		var wba = new ByteArray();
		wba.writeByte(5);
		wba.writeByte(9);
		wba.writeByte(27);
		var rba = new ByteArray(wba);
		expect(rba.readByte()).toEqual(5);
		expect(rba.readByte()).toEqual(9);
		expect(rba.readByte()).toEqual(27);
	});

	it('should read/write UTFBytes', function () {
		var wba = new ByteArray();
		wba.writeUTFBytes('Holiday');
		wba.writeUTFBytes('Life of street');
		wba.writeUTFBytes('NFSU 3 comming soon');
		var rba = new ByteArray(wba);
		expect(rba.readUTFBytes(7)).toEqual('Holiday');
		expect(rba.readUTFBytes(14)).toEqual('Life of street');
		expect(rba.readUTFBytes(19)).toEqual('NFSU 3 comming soon');
	});

	it('should read/write UTF', function () {
		var wba = new ByteArray();
		wba.writeUTF('You should do it');
		wba.writeUTF('Because we can do');
		wba.writeUTF('Have faith in you');
		var rba = new ByteArray(wba);
		expect(rba.readUTF()).toEqual('You should do it');
		expect(rba.readUTF()).toEqual('Because we can do');
		expect(rba.readUTF()).toEqual('Have faith in you');
	});

	it('should read/write Bytes', function () {
		var wba = new ByteArray();
		wba.writeBytes(ByteArray.fromArray([1, 21, 48, 17]));
		wba.writeBytes(ByteArray.fromArray([9, 26, 6, 12]));
		wba.writeBytes(ByteArray.fromArray([15, 42, 73, 35]));
		wba.reset();
		var a = new ByteArray(),
			b = new ByteArray(4),
			c = new ByteArray();
		wba.readBytes(a, 0, 4);
		wba.readBytes(b);
		wba.readBytes(c, 0, 4);
		a.reset();
		b.reset();
		c.reset();
		expect(a.readByte()).toEqual(1);
		expect(a.readByte()).toEqual(21);
		expect(a.readByte()).toEqual(48);
		expect(a.readByte()).toEqual(17);
		expect(b.readByte()).toEqual(9);
		expect(b.readByte()).toEqual(26);
		expect(b.readByte()).toEqual(6);
		expect(b.readByte()).toEqual(12);
		expect(c.readByte()).toEqual(15);
		expect(c.readByte()).toEqual(42);
		expect(c.readByte()).toEqual(73);
		expect(c.readByte()).toEqual(35);
	});

	it('should read/write MultiBytes', function () {
		var wba = new ByteArray();
		wba.writeMultiByte('YOPPP', 'ascii');
		wba.writeMultiByte('YOLOO', 'ascii');
		wba.writeMultiByte('PILOU', 'ascii');
		var rba = new ByteArray(wba);
		expect(rba.readMultiByte(5, 'ascii')).toEqual('YOPPP');
		expect(rba.readMultiByte(5, 'ascii')).toEqual('YOLOO');
		expect(rba.readMultiByte(5, 'ascii')).toEqual('PILOU');
	});

	it('should read/write Object', function () {
		var wba = new ByteArray();
		wba.writeObject({ id: 1, name: 'uop', desc: 'polo' });
		wba.writeObject({ id: 41, name: 'mpo' });
		wba.writeObject({ id: 14, name: 'pipi' });
		var rba = new ByteArray(wba);
		expect(rba.readObject()).toEqual({ id: 1, name: 'uop', desc: 'polo' });
		expect(rba.readObject()).toEqual({ id: 41, name: 'mpo' });
		expect(rba.readObject()).toEqual({ id: 14, name: 'pipi' });
	});

	it('should compress/decompress', function () {
		var wba = new ByteArray();
		wba.writeMultiByte('YOPPP', 'ascii');
		wba.writeUTF('Have faith in you');
		wba.writeDouble(4.4);
		var length = wba.length;
		wba.compress();
		expect(wba.length).toBeLessThan(length);
		wba.uncompress();
		expect(wba.length).toEqual(length);
		wba.reset();
		wba.compress(1);
		expect(wba.length).toBeLessThan(length);
		wba.uncompress(1);
		expect(wba.length).toEqual(length);
		wba.reset();
		expect(wba.readMultiByte(5, 'ascii')).toEqual('YOPPP');
		expect(wba.readUTF()).toEqual('Have faith in you');
		expect(wba.readDouble()).toEqual(4.4);
		wba.compress(2);
		expect(wba.length).toBeLessThan(length);
		wba.uncompress(2);
		expect(wba.length).toEqual(length);
		wba.reset();
		expect(wba.readMultiByte(5, 'ascii')).toEqual('YOPPP');
		expect(wba.readUTF()).toEqual('Have faith in you');
		expect(wba.readDouble()).toEqual(4.4);
	});

	it('should change length', function () {
		var wba = new ByteArray();
		wba.atomicCompareAndSwapLength(1024, 512);
		expect(wba.length).toEqual(512);
		wba.atomicCompareAndSwapLength(1023, 1024);
		expect(wba.length).toEqual(512);
		wba.atomicCompareAndSwapLength(512, 2048);
		expect(wba.length).toEqual(2048);
	});
	it('should length to be 32', function () {
		expect((new ByteArray(32)).length).toEqual(32);
	});
	it('should be resized', function () {
		var wba = new ByteArray();
		wba.writeUTFBytes('yopm');
		expect(wba.length).toEqual(1024);
		wba.resize();
		expect(wba.length).toEqual(4);
		expect(wba.toArray().length).toEqual(4);
		expect((ByteArray.fromArray(wba.toArray())).toString()).toEqual('yopm');
		wba.resize(2);
		expect(wba.position).toEqual(2);

	});
});
