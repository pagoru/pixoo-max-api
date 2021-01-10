import { BluetoothSerialPort } from 'bluetooth-serial-port';
import {DisplayAnimation, TimeboxEvo} from 'node-divoom-timebox-evo';

const PIXOO_MAX_NAME = <const>'Pixoo-Max';

const btSerial = new BluetoothSerialPort();
const timeboxEvo = new TimeboxEvo()


const onConnect = async () => {

    //https://github.com/RomRider/node-divoom-timebox-evo/blob/HEAD/PROTOCOL.md#command-46

    // const animation = timeboxEvo.createRequest('picture', { size: 16 }) as DisplayAnimation;
    // animation.read('./src/DSC_0101.png').then(result => {
    //     const bufferArray = result.asBinaryBuffer();
    //     bufferArray.forEach(buffer => {
    //         btSerial.write(buffer, console.error);
    //     })
    // }).catch(console.error);

    //          01 LLLL 49 XXXX XX PAYLOAD CCCC 02
    const b2 = '01 a800 49 9f00 00 000000 aa 08000000050000aa0900000006000000aa8e00f40103020000000002ffaa0000000000000000000000000000000000000000000000000000000000060000c00ff001e01ff803f03ffc07f07ffe0ff07fff0ff0ffff0ff0fc470cf056540de0564505e0447405c04c7504c0fdff0380fdff0100fdff0000ff7f0000fe1f0000fc0f0000f8070000f8030000f0010000e00000000000000000000000000000 f62b 02'
        .replace(/ /gm, '');


    // 44000A0A04 AA LLLL 000000 NN COLOR_DATA PIXEL_DATA

    // AA 00 3a 00 BBBBBB COLOR_DATA PIXEL_DATA

    //765

    // [0, 0] 0x0055ff
    const f0 = '01 09003a 00 0055ff 01 00 9801 02' // 38913 // 22270 // (22015)
        .replace(/ /gm, '');
    // [0, 0] 0x000000
    const f1 = '01 09003a 00 000000 01 00 4400 02' // 17408 // 765 // (0)
        .replace(/ /gm, '');
    // [0, 0] 0xFF0000
    const f2 = '01 09003a 00 ff0000 01 00 4301 02' // 17153 // 510 // (16711680)
        .replace(/ /gm, '');
    // [0, 0] 0xFFFFFF
    const f3 = '01 09003a 00 ffffff 01 00 4103 02' // 16643 // 0 // (16777215)
        .replace(/ /gm, '');

    //4400 -> 4103

    // [1, 0] 0x000000
    const r1 = '01 09003a 00 000000 01 01 4500 02'
        .replace(/ /gm, '');
    // [1, 0] 0xFF0000
    const r2 = '01 09003a 00 ff0000 01 01 4401 02'
        .replace(/ /gm, '');
    // [1, 0] 0xFFFFFF
    const r3 = '01 09003a 00 ffffff 01 01 4203 02' // 16899
        .replace(/ /gm, '');


    // [2, 0] 0x000000
    const g1 = '01 09003a 00 000000 01 02 4600 02'
        .replace(/ /gm, '');
    // [2, 0] 0xFF0000
    const g3 = '01 09003a 00 ff0000 01 02 4501 02'
        .replace(/ /gm, '');
    // [2, 0] 0xFFFFFF
    const g2 = '01 09003a 00 ffffff 01 02 4303 02' // 17155
        .replace(/ /gm, '');

    // [31, 31] 0x0055ff
    const t002 = '01 09003a 03 0055ff 01 ff 9a02 02' // 39426 // 20740
        .replace(/ /gm, '');
    // [31, 31] 0x000000
    const t000 = '01 09003a 03 000000 01 ff 4601 02' // 17921
        .replace(/ /gm, '');
    // [31, 31] 0xFF0000
    const t001 = '01 09003a 03 ff0000 01 ff 4502 02' //
        .replace(/ /gm, '');
    // [31, 31] 0xFFFFFF
    const t003 = '01 09003a 03 ffffff 01 ff 4304 02' // 17156
        .replace(/ /gm, '');

    const w_01 = '01 09003a 01 0055ff 01 ff 9802 02' // 38914 //
        .replace(/ /gm, '');

    function int2hexlittle(value) {
        const byte1 = (value & 0xFF).toString(16).padStart(2, "0");
        const byte2 = ((value >> 8) & 0xFF).toString(16).padStart(2, "0");
        return `${byte1}${byte2}`;
    }

    function getCRC(str) {
        let sum = 0;
        for (let i = 0, l = str.length; i < l; i += 2) {
            sum += parseInt(str.substr(i, 2), 16)
        }
        return int2hexlittle(sum);
    }

    const getMessageFrom = (x: number, y: number, hex: string): string => {
        const xIndex = Math.trunc(x/16);
        const squareIndex = Math.abs(xIndex + Math.trunc(y/16));
        let index = (x + (y * 16)) + squareIndex * (256) - (xIndex > 0 ? 16 : 0);
        const position_a = ((index >> 8) & 0xFF).toString(16).padStart(2, "0");
        const position_b = (index & 0xFF).toString(16).padStart(2, "0");
        const message = `09003a${position_a}${hex}01${position_b}`;
        return `01${message}${getCRC(message)}02`;
    }

    const drawPixel = async (x: number, y: number, hex: string) => {
        return btSerial.write(Buffer.from(getMessageFrom(x, y, hex), 'hex'), () => '');
    }

    function randomIntFromInterval(min, max) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function getHexColorFromInt(num: number) {
        return num.toString(16).padStart(6, '0');
    }

    // setInterval(() => {
    //     drawPixel(
    //         randomIntFromInterval(8, 24),
    //         randomIntFromInterval(8, 24),
    //         getHexColorFromInt(randomIntFromInterval(0xFF00FF, 0xFFFFFF))
    //     );
    // }, 9)

    for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
            await drawPixel(x, y, getHexColorFromInt(0x0F0F00 + x + (y*4)));
            await new Promise(r => setTimeout(r, 9));
        }
    }

}

btSerial.listPairedDevices((devices) => {
    const pixooDevice = devices.find(device => device.name === PIXOO_MAX_NAME);
    pixooDevice.address = pixooDevice.address.replace(/-/gm, ':');

    btSerial.findSerialPortChannel(pixooDevice.address, (channel) => {

        const connection = (attempt: number = 0) => {
            console.log(`Attempt connection... ${attempt}`)
            btSerial.connect(
                pixooDevice.address,
                channel,
                () => setTimeout(() => onConnect(), 100),
                () => setTimeout( () => connection(attempt + 1), 300));
        }
        connection();
    });
});
