export default class compressImg {

    compress(data: Blob | Array<Blob> | string | Array<string>, options?: options): Promise<{}[]> {

        options = Object.assign({quality: .7, scale: .5, type: 'base64'}, options || {});
        data = Array.isArray(data) ? data : [data];

        return Promise.all(data.map(v=> v instanceof Blob ? this.blobToBase64(v) : v))
                .then(urls=> Promise.all(urls.map(v=> new Promise((resolve, reject)=> {
                    let img = new Image();
                    img.src = v;

                    img.onload = ()=> {
                        let {width, height} = img,
                            canvas = document.createElement('canvas'),
                            ctx = canvas.getContext('2d');

                        canvas.width = width * options.scale;
                        canvas.height = height * options.scale;

                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        let url = canvas.toDataURL(v.slice(0, v.indexOf(',')).match(/:(.*?);/)[1], options.quality);
                        resolve(options.type === 'base64' ? url : this.base64ToBlob(url));
                    }

                }))));
    }

    blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject)=> {
            let reader = new FileReader();
            reader.onload = ()=> resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    }

    base64ToBlob(str: string): Blob {

        let index = str.indexOf(','),
            mime = str.slice(0, index).match(/:(.*?);/)[1],
            bstr = atob(str.slice(index + 1)),
            n = bstr.length, 
            u8arr = new Uint8Array(n)

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], { type: mime });

    }
}