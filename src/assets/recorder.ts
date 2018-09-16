export default class Recorder {

    context: AudioContext = null;
    sourceNode: MediaStreamAudioSourceNode = null;
    rawBuffer: Array<any> = [];
    wavBuffer: ArrayBuffer | Array<any>  = null;
    time: number = 0;

    constructor(processHandler?: (time: number)=> any) {

        if(!window.AudioContext) {
            return Promise.reject(new Error('您的浏览器暂不支持音频处理，请下载新版本或者更换浏览器重试'));
        }

        !navigator.mediaDevices && (navigator.mediaDevices = {});
        !navigator.mediaDevices.getUserMedia && (navigator.mediaDevices.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia);
    
        if(!navigator.mediaDevices.getUserMedia) {
            return Promise.reject(new Error('您的浏览器暂不支持录音，请下载新版本或者更换浏览器重试'));
        }

        this.context = new AudioContext();

        return navigator.mediaDevices.getUserMedia({ audio: true})
                .then((stream: MediaStream)=> {
                    this.sourceNode = this.context.createMediaStreamSource(stream);

                    let scriptNode = this.context.createScriptProcessor(1024, 1, 1);
                    scriptNode.addEventListener('audioprocess', (e: AudioProcessingEvent)=> {
                        this.rawBuffer.push(...e.inputBuffer.getChannelData(0));
                        this.time += e.inputBuffer.duration;
            
                        processHandler && processHandler(this.time);
                    });

                    this.sourceNode.connect(scriptNode);
                    scriptNode.connect(this.context.destination);

                    return new Promise(resolve=> resolve(this));
                })
    }

    static writerStringToBuffer(view: DataView, offset: number, str: string) {
        for(let i = 0, len = str.length; i < len; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    }

    exportWAV() {
        let data = this.rawBuffer;
        this.wavBuffer = new ArrayBuffer(44 + data.length * 2);
        let view = new DataView(this.wavBuffer);

        /* RIFF identifier */
        Recorder.writerStringToBuffer(view, 0, 'RIFF'); 
        /* RIFF chunk length */
        view.setUint32(4, 36 + data.length * 2, true);
        /* RIFF type */
        Recorder.writerStringToBuffer(view, 8, 'WAVE');
        /* format chunk identifier */
        Recorder.writerStringToBuffer(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, 1, true);
        /* sample rate */
        view.setUint32(24, 48000, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, 48000 * 2, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, 2, true);
        /* bits per sample */
        view.setUint16(34, 16, true);
        /* data chunk identifier */
        Recorder.writerStringToBuffer(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, data.length * 2, true);

        for (let i = 0, len = data.length; i < len; i++) {
            let s = Math.max(-1, Math.min(1, data[i]));
            view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
        
        return new Blob([view], {type: 'audio/wav'});
    }

    resume() {
        return this.context.resume();
    }

    suspend() {
        return this.context.suspend();
    }

    clear() {
        this.rawBuffer = [];
        this.wavBuffer = null;
        this.time = 0;
        return this;
    }

    close() {
        this.context.close();
        this.sourceNode = this.rawBuffer = this.time = this.context = null;
        return this;
    }
} 