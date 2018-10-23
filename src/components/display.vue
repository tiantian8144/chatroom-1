<template>
    <div class='assistor'>

        <div class='container' id='display' ref='container'
        @dragenter.self='$el.classList.add("drag-enter")'
        @dragover.prevent
        @drop.prevent='drop($event)'
        @dragleave.self='$el.classList.remove("drag-enter")'
        @scroll='scroll'>

            <div v-show='loading' class='loading-wrapper'>
                <loading class='icon-loading'></loading>
            </div>

            <div v-for='(item, index) of data' class='message' :class='{self: item.ID === ID}' :key='item.time + index'>
                <div v-if='index !== 0 && item.time - data[index - 1].time > 3600000' class='time'>{{formatTime(item.time)}}</div>
                <div class='avatar' :style='{backgroundImage: `url(${domain}/avatar/${item.avatar})`}'></div>
                <div class='wrapper'>
                    <div class='name'>{{item.name}}</div>
                    <div class='content' :class='{audio: item.duration}' :data-src='item.duration && item.data[0].content'
                    @click='isMobile || handler($event)'
                    @touchstart='isMoved = false'
                    @touchmove='isMoved = true'
                    @touchend='isMoved || handler($event)'>
                        <template v-if='item.duration'>
                            <voice class='icon-voice'></voice>
                            <span class='duration'>{{ Math.round(item.duration) + '"' }}</span>
                        </template>
                        <span v-else v-html='generateHTML(item)'></span>
                    </div>
                </div>
            </div>

            <div v-show='mask' class='mask' ref='mask'></div>
        </div>

        <voice class='icon-voice' ref='voice' style='display: none'></voice>
        <loading class='icon-loading' ref='loading' style='display: none'></loading>

        <transition name='tip'>
            <div class='unread' v-if='unread'><span 
            @click='scrollTo($refs.container.scrollHeight - $refs.container.offsetHeight); unread = 0;'
            @touchstart.prevent='scrollTo($refs.container.scrollHeight - $refs.container.offsetHeight); unread = 0;'>{{ unread }}</span></div>
        </transition>
    </div>

</template>

<script lang="ts">

    import { Vue, Prop, Component, Watch } from 'vue-property-decorator';
    import Loading from './icons/loading.vue';
    import Voice from './icons/voice.vue';
    import mixin from '../assets/mixin';
    import axios from 'axios';

    @Component({mixins: [mixin], components: { Loading, Voice }})
    export default class Display extends Vue {

        @Prop(String) ID;
        @Prop(String) name;
        @Prop(String) domain;
        @Prop(Array) history;
        @Prop(Object) latest;

        mask: boolean = false;
        isMoved: boolean = false;
        loading: boolean = false;

        audioSrc: string = '';
        data: Array<message> = [];
        SVG: SVGElement = null;
        unread: number = 0;
        context: AudioContext = null;
        source: AudioBufferSourceNode = null;
        voiceDOM: SVGElement = null;
        loadingDOM: SVGElement = null;
        endedID: number = null;
        tokenSource: CancelTokenSource = null;
        time: number = 0;

        //修改遮罩大小
        @Watch('mask')
        onStateChanged(val) {
            if(val) {
                let send = this.$parent.$children[1].$el;
                this.$refs.mask.style.width = this.$el.offsetWidth + 'px';
                this.$refs.mask.style.height = this.$el.offsetHeight + send.children[0].offsetHeight + send.children[1].offsetHeight + 'px';
            }
        }

        @Watch('history', {immediate: true})
        onHistoryChanged(val) {

            let interval = Date.now() - this.time;

            setTimeout(()=> {
                this.loading = false;
                this.time = 0;
                if(val.length) {
                    if(this.data.unshift(...val) <= 20) setTimeout(()=> this.$refs.container.scrollTop = this.$refs.container.scrollHeight, 500);
                    else setTimeout(height=> this.$refs.container.scrollTop = this.$refs.container.scrollHeight - height, 0, this.$refs.container.scrollHeight);
                }
            }, interval >= 1000 ? 0 : 1000 - interval);
            
        }

        @Watch('latest')
        onLatestChanged(val) { 
            let display = this.$refs.container;

            this.data.push(val);

            if(val.ID === this.ID || display.scrollHeight - display.offsetHeight - display.scrollTop < 150) this.$nextTick(()=> this.scrollTo(display.scrollHeight));
            else this.unread++;
        }

        mounted() {

            if(AudioContext) this.context = new AudioContext();
            else alert('您的浏览器不支持音频播放');
            
            this.voiceDOM = this.$el.removeChild(this.$refs.voice.$el);
            this.loadingDOM = this.$el.removeChild(this.$refs.loading.$el);
            this.voiceDOM.style.display = this.loadingDOM.style.display = 'inline';
            this.bus.$on('state', val=> this.mask = val);
        }

        scrollTo(target: number) {
            let display = this.$refs.container,
                step = (target - display.scrollTop) / 30,
                height = display.offsetHeight,
                ID = setInterval(()=> display.scrollTop >= target || display.scrollTop >= display.scrollHeight - height ? clearInterval(ID) : (display.scrollTop += step), 10);
                
            //消除移动端软键盘消失导致的定时器无法取消问题
            this.isMobile && setTimeout(()=> { clearInterval(ID); display.scrollTop = display.scrollHeight }, 300);
        }

        drop(e: DragEvent) {
            this.$el.classList.remove('drag-enter');
            this.bus.$emit('data', e.dataTransfer.files);
        }

        generateHTML(item: message): string {
            return item.data.reduce((l, v)=> l += v.type === 'text' ? `<span>${v.content}</span>` : `<img src='${this.domain}/image/${v.content}'>`, '');
        }

        formatTime(time: number): string {
            let date = new Date(time);
            return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours() >= 13 ? `下午${date.getHours() - 12}` : `上午${date.getHours()}`}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        }

        handler(e: MouseEvent) {

            let content: HTMLElement = e.currentTarget as HTMLElement;

            if(content.className.includes('audio')) {
                if(this.context) {

                    let SVG = content.querySelector('svg');
                    clearInterval(this.endedID);
                    
                    if(SVG.getAttribute('class') === 'icon-loading') {
                        this.tokenSource.cancel('cancel');
                        this.loadingDOM.parentNode.replaceChild(this.voiceDOM.cloneNode(true), this.loadingDOM);
                    } else if(SVG.getAttribute('class').includes('animating')) {
                        SVG.setAttribute('class', 'icon-voice');
                        this.source.stop();
                    } else {

                        try { this.loadingDOM.parentNode.replaceChild(this.voiceDOM.cloneNode(true), this.loadingDOM) } catch(e) {};
                        try { document.querySelector('.icon-voice.animating').setAttribute('class', 'icon-voice') } catch(e) {};
                        try { this.source.stop() } catch(e) {};
                        
                        content.replaceChild(this.loadingDOM, SVG);
                        this.tokenSource && this.tokenSource.cancel('cancel');
                        this.tokenSource = axios.CancelToken.source();

                        axios.get(`${this.domain}/audio/${content.dataset.src}`, {responseType: 'arraybuffer', cancelToken: this.tokenSource.token})
                        .then(res=> this.context.decodeAudioData(res.data))
                        .then((buffer: AudioBuffer)=> {
                            this.source = this.context.createBufferSource();
                            this.source.buffer = buffer; 
                            this.source.connect(this.context.destination); 
                            this.source.start(0);
                            let start = this.context.currentTime;
                            this.endedID = setInterval(()=> {
                                    if(this.context.currentTime - start >= buffer.duration) {
                                        SVG.setAttribute('class', 'icon-voice');
                                        clearInterval(this.endedID);
                                    }
                                }, 100);
                            content.replaceChild(SVG, this.loadingDOM);
                            SVG.setAttribute('class', 'icon-voice animating');
                        }).catch(err=> { err.message === "cancel" || alert('音频文件加载错误，请重试!'); content.replaceChild(SVG, this.loadingDOM);});
                    }
                } else alert('您的浏览器不支持音频播放');

            } else if (e.target.nodeName === 'IMG') {
                e.preventDefault();
                let img = new Image(), rect = e.target.getBoundingClientRect();
                img.src = e.target.src;
                img.onload = e=> this.$emit('view-image', {src: e.target.src, width: img.width, height: img.height, top: rect.top, left: rect.left});
            }
        }

        scroll() {
            this.$refs.container.scrollTop <= 20 && (this.$emit('loadmore', this.data.length), this.loading = true, this.time = Date.now());
            this.unread && this.$refs.container.children[this.data.length - this.unread].getBoundingClientRect().top < this.$el.offsetHeight && (this.unread = 0);
        }
    }

</script>

<style lang="scss" scoped>

    .assistor {

        position: relative;
        overflow: hidden;

        .loading-wrapper {
            padding: 1em 0;
            text-align: center;

            .icon-loading {
                width: 1.2em;
                height: 1.2em;
                fill: #666;
            }
        }

        .unread {
            position: absolute;
            right: 1em;
            bottom: 1em;
            color: white;
            transition: all .5s ease-in-out;
            
            span {
                position: relative;
                display: table-cell;
                vertical-align: middle;
                width: 2em;
                height: 2em;
                background-color: #409eff;
                border-radius: 50%;
                text-align: center;

                &:hover {
                    cursor: pointer;
                }

                &:before {
                    content: '';
                    position: absolute;
                    width: .5em;
                    height: .5em;
                    top: 100%;
                    left: 50%;
                    transform-origin: 50% 50%;
                    transform: translate(-50%, -70%) rotate(45deg);
                    background-color: #409eff;
                }
            }
        }
    }

    .container {
        position: absolute;
        top: 0;
        left: 0;
        width: 96%;
        height: 100%;
        padding: 0 2%;
        overflow-x: hidden;
        overflow-y: auto;
        
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

        .mask {
            position: fixed;
            z-index: 2018;
            top: 0;
            left: 20%;
            background-color: rgba(0, 0, 0, .5);
        }

        @media screen and (max-width: 768px) {
            .mask {
                left: 0;
            }
        }

        &.drag-enter {
            // border: 3px dashed #999;
        }

        .message {

            overflow: hidden;
            margin-bottom: .5em;

            .time {
                margin: 1em 0;
                color: #666;
                font-size: .5em;
                text-align: center;
            }
            
            .avatar {
                float: left;
                width: 5%;
                max-width: 3.3em;
                min-width: 2em;
                border-radius: 50%;
                background-size: cover;
                background-position: 50% 50%;

                &:before {
                    content: '';
                    display: block;
                    padding: 50% 0;
                }
            }

            .wrapper { 
                float: left;
                width: 80%;
                margin-left: .5em;

                .name {
                    color: #666;
                    font-size: .6em;
                }

                .content {

                    position: relative;
                    display: inline-block;
                    max-width: 80%;
                    margin: .4em 0 0 .4em;
                    font-size: .9em;
                    word-wrap: break-word;
                    padding: .5em;
                    border-radius: .4em;
                    background-color: #fff;

                    &:before {
                        content: '';
                        position: absolute;
                        top: -0.2em;
                        left: -0.4em;
                        width: .6em;
                        height: .5em;
                        border-bottom: .5em #fff solid;
                        border-bottom-left-radius: 70%;
                    }
                }

                $height: 2em;

                .content.audio {

                    padding-right: 2em!important;
                    line-height: $height;

                    &:hover {
                        cursor: pointer;
                    }                        

                    .icon-voice {
                        width: $height;
                        height: $height * 0.8;
                        vertical-align: middle;
                        transform: rotate(180deg);
                        fill: #409eff;
                    }

                    .icon-loading {

                        vertical-align: middle;
                        width: $height * .8;
                        height: $height * .8;
                        padding: 0 $height * .1;
                        fill: #409eff;
                    }
                }
            }

        }

        .message.self {

            .avatar {
                float: right;
            }

            .wrapper {

                float: right;
                margin-right: .5em;
                
                .name {
                    direction: rtl;
                }

                .content {
                    
                    float: right;
                    margin: .4em .4em 0 0;

                    &:before {
                        left: auto;
                        right: -0.4em;
                        border-bottom-left-radius: 0;
                        border-bottom-right-radius: 70%;
                    }

                    .icon-voice {
                        transform: none;
                    }
                }

            }
        }
    }

    .tip-enter {
        opacity: 0;
        transform: translateY(-60px);
    }

    .tip.enter-to {
        opacity: 1;
        transform: translateY(0px);
    }

    .tip-leave-to {
        opacity: 0;
        transform: translateY(-60px);
    }

</style>

<style lang='scss'>

    #display .message .content {

        img {
            width: 8em;
            margin: 0 .5em;

            &:hover {
                cursor: pointer;
            }

            &:only-child {
                margin: 0;
                vertical-align: middle;
            }
        }
    }

</style>

