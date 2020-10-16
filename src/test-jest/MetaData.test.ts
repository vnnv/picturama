import moment from 'moment'

import { readMetadataOfImage, getExifData } from 'background/MetaData'


const testPhotosDir = 'submodules/test-data/photos'

test('MetaData.readMetadataOfImage', async () => {

    expect(await readMetadataOfImage(`${testPhotosDir}/800/architecture.jpg`)).toEqual({
        aperture: 5.6,
        camera: 'Nikon D3300',
        createdAt: toDate('2017-03-25T09:22:15.000Z'),
        exposureTime: 0.003125,
        focalLength: 40,
        imgHeight: undefined,
        imgWidth: undefined,
        iso: 100,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/800/ice-cubes.jpg`)).toEqual({
        aperture: 11,
        camera: 'FUJIFILM X-T2',
        createdAt: toDate('2018-06-28T17:37:06.000Z'),
        exposureTime: 0.05,
        focalLength: 80,
        imgHeight: undefined,
        imgWidth: undefined,
        iso: 200,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/800/light-bulb.jpg`)).toEqual({
        aperture: 4,
        camera: 'SONY ILCE-7',
        createdAt: toDate('2016-01-16T00:14:16.000Z'),
        exposureTime: 1,
        focalLength: 105,
        imgHeight: undefined,
        imgWidth: undefined,
        iso: 100,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/800/railway-tracks.jpg`)).toEqual({
        aperture: 6.3,
        camera: 'Olympus E-M10',
        createdAt: toDate('2018-06-01T10:21:18.000Z'),
        exposureTime: 0.0025,
        focalLength: 128,
        imgHeight: undefined,
        imgWidth: undefined,
        iso: 200,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/800/rustic.jpg`)).toEqual({
        aperture: 14,
        camera: 'SONY ILCE-6300',
        createdAt: toDate('2018-05-26T21:31:00.000Z'),
        exposureTime: 3.2,
        focalLength: 30,
        imgHeight: undefined,
        imgWidth: undefined,
        iso: 100,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/800/tomatoes.jpg`)).toEqual({
        aperture: 2.8,
        camera: 'Canon EOS 450D',
        createdAt: toDate('2017-04-15T07:11:52.000Z'),
        exposureTime: 0.01,
        focalLength: 50,
        imgHeight: undefined,
        imgWidth: undefined,
        iso: 200,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/800/water.jpg`)).toEqual({
        aperture: 11,
        camera: 'Nikon D750',
        createdAt: toDate('2016-09-30T12:37:39.000Z'),
        exposureTime: 0.00625,
        focalLength: 112,
        imgHeight: undefined,
        imgWidth: undefined,
        iso: 64,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/heic/Apple_iPhone_XR_portrait.HEIC`)).toEqual({
        aperture: 1.8,
        camera: 'Apple iPhone XR',
        createdAt: toDate('2019-07-31T12:34:34.000Z'),
        exposureTime: 0.000700770847932726,
        focalLength: 4.25,
        imgHeight: 3024,
        imgWidth: 4032,
        iso: 25,
        orientation: 6,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/jpg/Apple_iPhone_XR_landscape.jpg`)).toEqual({
        aperture: 1.8,
        camera: 'Apple iPhone XR',
        createdAt: toDate('2019-09-12T16:22:17.000Z'),
        exposureTime: 0.0007407407407407407,
        focalLength: 4.25,
        imgHeight: 2866,
        imgWidth: 3824,
        iso: 25,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/IMG_9700.JPG`)).toEqual({
        aperture: 5.6,
        camera: 'Canon EOS 700D',
        createdAt: toDate('2016-09-18T16:12:25.000Z'),
        exposureTime: 0.016666666666666666,
        focalLength: 55,
        imgHeight: 3456,
        imgWidth: 5184,
        iso: 1600,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/landscape.jpg`)).toEqual({
        createdAt: toDate('2020-06-28T09:49:10.811Z'),
        orientation: 1,
        tags: []
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/panorama.jpg`)).toEqual({
        aperture: undefined,
        camera: undefined,
        createdAt: toDate('2018-08-15T13:09:04.000Z'),
        exposureTime: undefined,
        focalLength: undefined,
        imgHeight: 225,
        imgWidth: 1024,
        iso: undefined,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/portrait.jpg`)).toEqual({
        aperture: 8,
        camera: 'SONY DSLR-A850',
        createdAt: toDate('2012-09-24T17:23:35.000Z'),
        exposureTime: 0.004,
        focalLength: 135,
        imgHeight: 1024,
        imgWidth: 785,
        iso: 100,
        orientation: 1,
        tags: [],
    })
})


test('MetaData.getExifData', async () => {
    expect(await getExifData(`${testPhotosDir}/IMG_9700.JPG`)).toMatchObject({
        ifd0: {
            Make: 'Canon',
            Model: 'Canon EOS 700D',
            Orientation: 'Horizontal (normal)',
            XResolution: 72,
            YResolution: 72,
            ResolutionUnit: 'inches',
            ModifyDate: toDate('2016-09-18T16:12:25.000Z'),
            Artist: undefined,
            YCbCrPositioning: 2,
            Copyright: undefined
        },
        ifd1: {
            Compression: 6,
            XResolution: 72,
            YResolution: 72,
            ResolutionUnit: 'inches',
            ThumbnailOffset: 11148,
            ThumbnailLength: 11668
        },
        exif: {
            ExposureTime: 0.016666666666666666,
            FNumber: 5.6,
            ExposureProgram: 'Normal program',
            ISO: 1600,
            SensitivityType: 2,
            RecommendedExposureIndex: 1600,
            ExifVersion: '2.3',
            DateTimeOriginal: toDate('2016-09-18T16:12:25.000Z'),
            CreateDate: toDate('2016-09-18T16:12:25.000Z'),
            ComponentsConfiguration: new Uint8Array([ 1, 2, 3, 0 ]),
            ShutterSpeedValue: 6,
            ApertureValue: 5,
            ExposureCompensation: 0,
            MeteringMode: 'Pattern',
            Flash: 'Flash fired, compulsory flash mode',
            FocalLength: 55,
            SubSecTime: '46',
            SubSecTimeOriginal: '46',
            SubSecTimeDigitized: '46',
            FlashpixVersion: '1.0',
            ColorSpace: 1,
            ExifImageWidth: 5184,
            ExifImageHeight: 3456,
            FocalPlaneXResolution: 5798.657718120805,
            FocalPlaneYResolution: 5788.94472361809,
            FocalPlaneResolutionUnit: 'Inch',
            CustomRendered: 'Normal',
            ExposureMode: 'Auto',
            WhiteBalance: 'Auto',
            SceneCaptureType: 'Standard',
            OwnerName: undefined,
            SerialNumber: '043031011731',
            LensInfo: [ 18, 55, 0, 0 ],
            LensModel: 'EF-S18-55mm f/3.5-5.6 IS STM',
            LensSerialNumber: '00000fae87'
        }
    })

    expect(await getExifData(`${testPhotosDir}/heic/Apple_iPhone_XR_portrait.HEIC`)).toMatchObject({
        ifd0: {
            Make: 'Apple',
            Model: 'iPhone XR',
            Orientation: 'Rotate 90 CW',
            XResolution: 72,
            YResolution: 72,
            ResolutionUnit: 'inches',
            Software: '12.3.1',
            ModifyDate: toDate('2019-07-31T12:34:34.000Z'),
            YCbCrPositioning: 1
        },
        exif: {
            ExposureTime: 0.000700770847932726,
            FNumber: 1.8,
            ExposureProgram: 'Normal program',
            ISO: 25,
            ExifVersion: '2.2.1',
            DateTimeOriginal: toDate('2019-07-31T12:34:34.000Z'),
            CreateDate: toDate('2019-07-31T12:34:34.000Z'),
            ComponentsConfiguration: new Uint8Array([ 1, 2, 3, 0 ]),
            ShutterSpeedValue: 10.47829793830414,
            ApertureValue: 1.6959938128383605,
            BrightnessValue: 9.717135464485436,
            ExposureCompensation: 0,
            MeteringMode: 'Pattern',
            Flash: 'Flash did not fire, auto mode',
            FocalLength: 4.25,
            SubjectArea: new Uint16Array([ 2013, 1511, 2217, 1330 ]),
            SubSecTimeOriginal: '101',
            SubSecTimeDigitized: '101',
            FlashpixVersion: '1.0',
            ColorSpace: 65535,
            ExifImageWidth: 4032,
            ExifImageHeight: 3024,
            SensingMethod: 'One-chip color area sensor',
            SceneType: 'Directly photographed',
            ExposureMode: 'Auto',
            WhiteBalance: 'Auto',
            FocalLengthIn35mmFormat: 26,
            SceneCaptureType: 'Standard',
            LensInfo: [ 4.25, 4.25, 1.8, 1.8 ],
            LensMake: 'Apple',
            LensModel: 'iPhone XR back camera 4.25mm f/1.8'
        },
        gps: {
            GPSLatitudeRef: 'N',
            GPSLatitude: [ 52, 29, 57.27 ],
            GPSLongitudeRef: 'E',
            GPSLongitude: [ 13, 22, 41.96 ],
            GPSAltitudeRef: new Uint8Array([ 0 ]),
            GPSAltitude: 30.4411456514146,
            GPSTimeStamp: '12:34:33.17',
            GPSSpeedRef: 'K',
            GPSSpeed: 0.005295293872192876,
            GPSImgDirectionRef: 'T',
            GPSImgDirection: 294.22216796875,
            GPSDestBearingRef: 'True North',
            GPSDestBearing: 294.22216796875,
            GPSDateStamp: '2019:07:31',
            GPSHPositioningError: 5.862719770362397,
            latitude: 52.49924166666667,
            longitude: 13.378322222222224
        },
    })

    expect(await getExifData(`${testPhotosDir}/jpg/Apple_iPhone_XR_landscape.jpg`)).toMatchObject({
        ifd0: {
            Make: 'Apple',
            Model: 'iPhone XR',
            XResolution: 72,
            YResolution: 72,
            ResolutionUnit: 'inches',
            Software: '12.4',
            ModifyDate: toDate('2019-09-12T16:22:17.000Z'),
            TileWidth: 512,
            TileLength: 512
        },
        exif: {
            ExposureTime: 0.0007407407407407407,
            FNumber: 1.8,
            ExposureProgram: 'Normal program',
            ISO: 25,
            ExifVersion: '2.2.1',
            DateTimeOriginal: toDate('2019-09-12T16:22:17.000Z'),
            CreateDate: toDate('2019-09-12T16:22:17.000Z'),
            ComponentsConfiguration: new Uint8Array([ 1, 2, 3, 0 ]),
            ShutterSpeedValue: 10.398238844365292,
            ApertureValue: 1.6959938128383605,
            BrightnessValue: 9.88633074595448,
            ExposureCompensation: 0,
            MeteringMode: 'Pattern',
            Flash: 'Flash did not fire, auto mode',
            FocalLength: 4.25,
            SubjectArea: new Uint16Array([ 2013, 1511, 2217, 1330 ]),
            SubSecTimeOriginal: '766',
            SubSecTimeDigitized: '766',
            FlashpixVersion: '1.0',
            ExifImageWidth: 3824,
            ExifImageHeight: 2866,
            SensingMethod: 'One-chip color area sensor',
            SceneType: 'Directly photographed',
            ExposureMode: 'Auto',
            WhiteBalance: 'Auto',
            FocalLengthIn35mmFormat: 26,
            SceneCaptureType: 'Standard',
            LensInfo: [ 4.25, 4.25, 1.8, 1.8 ],
            LensMake: 'Apple',
            LensModel: 'iPhone XR back camera 4.25mm f/1.8'
        },
        gps: {
            GPSLatitudeRef: 'N',
            GPSLatitude: [ 42, 6, 21.51 ],
            GPSLongitudeRef: 'E',
            GPSLongitude: [ 9, 33, 0.03 ],
            GPSAltitudeRef: new Uint8Array([ 0 ]),
            GPSAltitude: 1.579963440189041,
            GPSTimeStamp: '16:22:17',
            GPSSpeedRef: 'K',
            GPSSpeed: 0.02863073909027235,
            GPSImgDirectionRef: 'T',
            GPSImgDirection: 183.88793183291656,
            GPSDestBearingRef: 'True North',
            GPSDestBearing: 183.88793183291656,
            GPSDateStamp: '2019:09:12',
            GPSHPositioningError: 5.12280761970139,
            latitude: 42.105975,
            longitude: 9.550008333333334
        },
    })
})


function toDate(isoTimeStamp: string): Date {
    return moment(isoTimeStamp).toDate()
}
