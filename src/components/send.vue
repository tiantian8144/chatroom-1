<template>
    <div>
        <div class='bubble' ref='bubble' @transitionend='bubbleRemove'></div>

        <div class='panel-content'>
            <div class='avatar' :style="{backgroundImage: `url(${domain}/avatar/${avatar})`}"></div>
            <div class='content' @paste='paste($event)' ref='input' contenteditable="true" :placeholder='isMobile ? "" : "按Ctrl+Enter快速发送消息"'></div>
            <button :class='{sending: sending}' :disabled='sending'
            @click='sending || send()'
            @touchstart.prevent='sending || send()'>{{ sending ? 'sending' : '发送' }}</button>
        </div>

        <div class='options' :class='{PC: !isMobile}'>
            <div class='icon icon-emojis'>
                <svg  :class='{active: option === "emojis"}' 
                @click='option = option === "emojis" ? "" : "emojis"'
                @touchstart.prevent='option = option === "emojis" ? "" : "emojis"' 
                viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1728" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <path d="M512 51.2c254.088533 0 460.8 206.711467 460.8 460.8S766.088533 972.8 512 972.8 51.2 766.088533 51.2 512 257.911467 51.2 512 51.2M512 0C229.2224 0 0 229.2224 0 512s229.2224 512 512 512 512-229.2224 512-512S794.7776 0 512 0L512 0z" p-id="1729"></path>
                    <path d="M511.8464 768c-109.056 0-203.451733-77.755733-229.5808-189.0816-3.2256-13.7728 5.3248-27.5456 19.080533-30.7712 13.738667-3.208533 27.5456 5.307733 30.7712 19.063467C352.785067 655.291733 426.683733 716.8 511.8464 716.8c85.7088 0 159.726933-62.0032 180.002133-150.766933 3.140267-13.789867 16.827733-22.493867 30.651733-19.2512 13.789867 3.140267 22.408533 16.861867 19.2512 30.651733C716.151467 689.629867 621.6192 768 511.8464 768z" p-id="1730"></path>
                    <path d="M324.266667 375.466667m-51.2 0a3 3 0 1 0 102.4 0 3 3 0 1 0-102.4 0Z" p-id="1731"></path>
                    <path d="M699.733333 375.466667m-51.2 0a3 3 0 1 0 102.4 0 3 3 0 1 0-102.4 0Z" p-id="1732"></path>
                </svg>
            </div>

            <div class='icon icon-audio' v-if='!isMobile'>
                <svg  :class='{active: option === "audio"}' @click='switchAudio' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4417" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M480 704a160 160 0 0 0 160-160V160a160 160 0 0 0-320 0v384a160 160 0 0 0 160 160z m224-256v96a224 224 0 1 1-448 0v-96H192v96a288 288 0 0 0 256 286.208V960h-128v64h320v-64h-128v-129.792A288 288 0 0 0 768 544v-96h-64z" p-id="4418"></path></svg>
            </div>

            <label for='uploadImg' class='icon icon-image'>
                <svg  ref='icon-image' viewBox="0 0 1098 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1476" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M365.728 329.152q0 45.728-32 77.728t-77.728 32-77.728-32-32-77.728 32-77.728 77.728-32 77.728 32 32 77.728zM950.848 548.576l0 256-804.576 0 0-109.728 182.848-182.848 91.424 91.424 292.576-292.576zM1005.728 146.272l-914.272 0q-7.424 0-12.864 5.44t-5.44 12.864l0 694.848q0 7.424 5.44 12.864t12.864 5.44l914.272 0q7.424 0 12.864-5.44t5.44-12.864l0-694.848q0-7.424-5.44-12.864t-12.864-5.44zM1097.152 164.576l0 694.848q0 37.728-26.848 64.576t-64.576 26.848l-914.272 0q-37.728 0-64.576-26.848t-26.848-64.576l0-694.848q0-37.728 26.848-64.576t64.576-26.848l914.272 0q37.728 0 64.576 26.848t26.848 64.576z" p-id="1477"></path></svg>
            </label>
            <input id='uploadImg' type="file" @change='upload($event)' accept='image/*' style='display: none' multiple>
        </div>

        <div v-show='option === "emojis"' class='panel panel-emojis' :class='{"panel-emojis-hover": !isMobile}' @click='isMobile || insertEmoji($event)' @touchstart='insertEmoji($event)'>
            <li class='emoji' v-for='(char, i) of emojis' :key='i'>{{char}}</li>
        </div>
        <sound v-if='!isMobile && isRecorder' v-show='option === "audio"' class='panel panel-audio' @message='$emit("message", $event); sending = true;' @cantrecord='isRecorder = false'></sound>
    </div>
</template>

<script lang='ts'>

    import { Vue, Component, Prop } from 'vue-property-decorator';
    import mixin from '../assets/mixin';
    import compressImg from '../assets/compressImg';
    import Sound from './sound.vue';

    @Component({components: { Sound }, mixins: [mixin]})
    export default class Send extends Vue {

        @Prop(String) avatar;
        @Prop(String) domain;
        @Prop(Boolean) isMobile;

        sending: boolean = false;
        isRecorder: boolean = true;

        option: string = 'null';
        imageData: Array<Blob> = [];
        compress: compressImg = null;
        selection = null;
        emojis: Array<string> = ['😂', '🙏', '😄', '😏', '😇', '😅', '😌', '😘', '😍', '🤓', '😜', '😎', '😊', '😳', '🙄', '😱', '😒', '😔', '😷', '👿', '🤗', '😩', '😤', '😣', '😰', '😴', '😬', '😭', '👻', '👍', '✌️', '👉', '👀', '🐶', '🐷', '😹', '⚡️', '🔥', '🌈', '🍏', '⚽️', '❤️', '🇨🇳']

        mounted() {

            let val: Array<string> = ['表情', '录音', '图片'],
                bubble: Element = this.$refs.bubble as Element;

            this.comppress = new compressImg();

            if(!this.isMobile) {
                Array.from(document.querySelectorAll('.options svg'), (v, i)=> {
                    v.addEventListener('mouseenter', ()=> {
                        bubble.textContent = val[i];
                        v.parentNode.insertBefore(bubble, v.parentNode.children[0]);
                        setTimeout(()=> bubble.classList.toggle('bubble-active'), 0);
                    });

                    v.addEventListener('mouseleave', ()=> bubble.classList.toggle('bubble-active'));
                });
            }
            
            //插入拖拽的图片
            this.bus.$on('data', files=> this.insertImage(files));
            
            if(window.getSelection) {
                let Selection: Selection = window.getSelection();

                (this.$refs.input as EventTarget).addEventListener('blur', e=> {
                    let { anchorNode, anchorOffset } = Selection;
                    this.selection = { anchorNode, anchorOffset };
                });

                (document as EventTarget).addEventListener('focus', e=> {
                    if(e.target !== this.$refs['icon-image']) {
                        this.selection = null
                    }
                });
            }

            //快速发送消息
            this.isMobile || document.addEventListener('keydown', (e: KeyboardEvent)=> e.ctrlKey && e.key === 'Enter' && this.send());
        }
        
        //移除气泡
        bubbleRemove() {
            let bubble: Element = this.$refs.bubble as Element;
            bubble.parentNode && !bubble.classList.contains("bubble-active") && bubble.parentNode.removeChild(bubble);
        }

        //根据光标插入元素
        insert(node: Text | HTMLElement | DocumentFragment) {

            let input: HTMLInputElement = this.$refs.input as HTMLInputElement;

            if(this.selection) {

                let selection = this.selection;
                
                if(selection.anchorNode.nodeName === 'DIV')
                    selection.anchorOffset === input.childNodes.length ? input.appendChild(node) : input.insertBefore(node, input.childNodes[selection.anchorOffset]);
                else if(selection.anchorNode.nodeType === 3) {
                    if(selection.anchorOffset === selection.anchorNode.nodeValue.length)
                        selection.anchorNode.nextSibling ? input.insertBefore(node, selection.anchorNode.nextSibling) : input.appendChild(node);
                    else
                        input.insertBefore(node, (selection.anchorNode as Text).splitText(selection.anchorOffset));
                }

            } else {
                input.appendChild(node);
            }
        }
        
        //插入表情
        insertEmoji(e: MouseEvent) {
            this.insert(document.createTextNode(e.target.innerHTML));
        }

        switchAudio() {
            if(this.$children[0] && this.$children[0].recorder) {
                this.option = this.option === "audio" ? null : "audio"
            } else alert('无法使用录音功能'); 
        }

        //上传图片
        upload(e) {
            this.insertImage(e.target.files);
            e.target.value = '';
        }

        //在光标处插入图片
        insertImage(files: FileList) {

            let reader: FileReader = new FileReader(),
                p: Promise<any> = Promise.resolve(),
                fragment: DocumentFragment = document.createDocumentFragment();
            
            for(let v of files as FileList) {
                p = p.then(()=> new Promise(resolve=> {
                    reader.onload = e=> { fragment.appendChild(this.createNodeByString(`<img alt=图片链接已失效 data-order=${this.imageData.push(v) - 1} src=${e.target.result}>`) as Node); resolve(); };
                    reader.readAsDataURL(v);
                }));
            }

            p.then(resolve=> this.insert(fragment));
        }

        //粘贴事件处理函数
        paste(e: ClipboardEvent) {
            let file = e.clipboardData.files[0];
            setTimeout(()=> {
                for(let v of this.$refs.input.children) {
                    if(!v.dataset.hasOwnProperty('order')) {
                        v.dataset.order = this.imageData.push(file) - 1;
                    }
                }
            }, 0);
        }

        //发送消息
        send() {

            let input: HTMLInputElement = this.$refs.input as HTMLInputElement;

            if(input.querySelectorAll('img').length > 6) { alert('一次发送图片不得超过6张'); return; };
            if(input.textContent.length > 600) { alert('不得超过600字'); return; }

            if(input.hasChildNodes()) {

                this.sending = true;

                let content: Array<object> = [], 
                    p: Promise<any> = Promise.resolve(),
                    reader = new FileReader();

                //合并文本节点
                input.normalize();
                for(let i = 0, len = input.childNodes.length;i < len; i++) {
                    let node = input.childNodes[i];

                    if(node.nodeType === 3) {
                        content[i] = {type: 'text', content: this.encodeHTML(node.nodeValue)};
                    }
                    else if(node.nodeName === 'IMG') {
                        let data = this.imageData[node.dataset.order];
                        p = p.then(()=> data.size < 1024 * 512 ? [data] : this.compress.compress(data, {scale: .4, type: 'blob'}))
                                .then(result=> new Promise(resolve=> {
                                    reader.onload = (e: Event)=> { content[i] = {type: 'img', content: e.target.result}; resolve();};
                                    reader.readAsArrayBuffer(result[0]);
                                }));
                    }
                }

                p.then(()=> { this.$emit('message', {data: content}); this.clear();}).catch(err=> {alert('发送失败，请重试'); this.sending = false; })
            } else alert('内容为空');
        }

        clear() {
            this.$refs.input.innerHTML = '';
            this.imageData = [];
        }
    }

</script>

<style lang="scss" scoped>

    .panel-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: .3em;

        .avatar {
            flex-shrink: 0;
            width: 2.1em;
            border-radius: 15%;
            background-size: cover;
            background-position: 50% 50%;

            &:before {
                content: '';
                display: block;
                padding: 50% 0;
            }
        }

        .content {
            flex-grow: 1;
            overflow: auto;
            max-height: 10em;
            min-height: 2em;
            margin: 0 10px;
            line-height: 2em;
            padding: .2em .4em;
            border-radius: 3px;
            font-size: .9em;
            word-break: break-all;
            background: #fff;
            outline: none;

            &:empty:before {
                content: attr(placeholder);
                color: #999;
            }

            &::-webkit-scrollbar {
                width: .6em;
                height: .6em;
            }
        
            &::-webkit-scrollbar-thumb {
                width: .3em;
                border-radius: .3em;
                background: #E3E3E3;
            }
        
            &::-webkit-scrollbar-thumb:hover {
                background: #ddd;
            }
        }

        button {
            flex: 0 0 4.5em;
            position: relative;
            height: 2.4em;
            line-height: 2.4em;
            text-align: center;
            font-size: .9em;
            color: #fff;
            border: none;
            border-radius: 3px;
            background: #409eff;

            &:hover {
                cursor: pointer;
            }

            &.sending {

                padding: 0;

                &:hover {
                    cursor: not-allowed;
                }

                &:before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    background-color: rgba(255, 255, 255, .5);
                }
            }
        }
    }

    .options {
        display: flex;
        justify-content: space-around;
        padding: .4em 0;
        height: 1.4em;

        .icon {
            position: relative;
            float: left;
            text-align: center;

            svg {
                width: 1.4em;
                height: 1.4em;
                fill: #666;

                &.active {
                    fill: #409eff;
                }
            }
        }

        &.PC {
            .icon svg:hover{
                cursor: pointer;
                fill: #409eff;
            }
        } 


    }

    .bubble {
        position: absolute;
        top: 0;
        left: 50%;
        opacity: 0;
        padding: .2em .4em;
        border-radius: .2em;
        color: #fff;
        font-size: .8em;
        font-weight: 300;
        white-space: nowrap;
        background-color: rgba(0, 0, 0, 1);
        transform: translate(-50%, -200%);
        transition: all .5s ease-in-out;

        &:before {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            width: .8em;
            height: .8em;
            border-radius: .2em;
            transform: translate(-50%, -60%) rotate(45deg);
            background-image: linear-gradient(135deg, transparent, transparent 50%, black 50% ,black);
        }
    }

    .bubble-active {
        opacity: 1;
        transform: translate(-50%, -150%);
    }

    .panel {
        height: 15em;
        background-color: white;
    }

    .panel-emojis {

        overflow: auto;

        &::-webkit-scrollbar {
            width: 1%;
        }

        &::-webkit-scrollbar-thumb {
            width: 1%;
            min-width: .6em;
            border-radius: 20px;
            background-color: #AAA;
        }

        &::-webkit-scrollbar-thumb:hover {
            background-color: #999;
        }

        .emoji {
            float: left;        
            width: 10%;
            padding: 1em 0;
            font-size: 1.5em;
            text-align: center;
            list-style-type: none;
        }


        &.panel-emojis-hover {

            .emoji:hover {
                cursor: pointer;
                background-color: #ddd;
            }
        }
    }

    @media screen and (max-width: 768px) {

        .panel-emojis {

            .emoji {
                width: 16.66%!important;
            }
        }
        
    }

</style>

<style>

    .send .content img{
        width: 5em;
        padding: 0 .3em;
    }   
</style>