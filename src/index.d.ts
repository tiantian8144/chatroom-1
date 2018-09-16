interface message {
    ID: string;
    name: string;
    avatar: string;
    time: number;
    data: Array<segment>;
    duration: number
}

interface segment {
    type: 'text' | 'image' | 'audio';
    content: ArrayBufferView | ArrayBuffer | string;
}

interface options {
    quality?: number;
    scale?: number;
    type?: 'blob' | 'base64';
}

declare class compressImg {
    compressImg: (data: Blob | Array<Blob> | string | Array<string>, options?: options)=> Promise<{}[]>;
    blobToBase64: (blob: Blob)=> Promise<string>;
    base64ToBlob: (str: string)=> Blob;
}
