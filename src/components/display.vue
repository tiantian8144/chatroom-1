<template>
    <div class='assistor'>

        <div class='container' id='display' ref='container'
        @dragenter.self='$el.classList.add("drag-enter")'
        @dragover.prevent
        @drop.prevent='drop($event)'
        @dragleave.self='$el.classList.remove("drag-enter")'
        @scroll='scroll'>

            <div v-for='(item, index) of data' class='message' :class='{self: item.ID === ID}' :key='item.time + index'>
                <div v-if='index !== 0 && item.time - data[index - 1].time > 3600000' class='time'>{{formatTime(item.time)}}</div>
                <div class='avatar' :style='{backgroundImage: `url(${domain}/avatar/${item.avatar})`}'></div>
                <div class='wrapper'>
                    <div class='name'>{{item.name}}</div>
                    <div class='content' :class='{audio: item.duration, only: item.data.length === 1 && item.data[0].type === "img"}' :data-src='item.duration && item.data[0].content' v-html='generateHTML(item)'
                    @click='isMobile || handler($event)'
                    @touchstart='isMoved = false'
                    @touchmove='isMoved = true'
                    @touchend='isMoved || handler($event)'></div>
                </div>
            </div>

            <div v-show='mask' class='mask' ref='mask'></div>

            <transition name='tip'>
                <div class='unread' v-if='unread'><span 
                @click='scrollTo($refs.container.scrollHeight - $refs.container.offsetHeight); unread = 0;'
                @touchstart.prevent='scrollTo($refs.container.scrollHeight - $refs.container.offsetHeight); unread = 0;'>{{unread}}</span></div>
            </transition>
        </div>
    </div>

</template>

<script lang="ts">

    import { Vue, Prop, Component, Watch } from 'vue-property-decorator';
    import mixin from '../assets/mixin';
    import axios from 'axios';

    @Component({mixins: [mixin]})
    export default class Display extends Vue {

        @Prop(String) ID;
        @Prop(String) name;
        @Prop(String) domain;
        @Prop(Array) history;
        @Prop(Object) latest;
        @Prop(Boolean) isMobile;

        mask: boolean = false;
        isMoved: boolean = false;

        audioSrc: string = '';
        data: Array<message> = [];
        SVG: SVGElement = null;
        unread: number = 0;
        context: AudioContext = null;
        source: AudioBufferSourceNode = null;
        voiceDOM: SVGElement = null;
        endedID: number = null;
        loadingDOM: SVGElement = null;
        tokenSource: CancelTokenSource = null;

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
        onHistoryChanged(val) { val.length && this.data.unshift(...val) <= 20 && setTimeout(()=> this.$refs.container.scrollTop = this.$refs.container.scrollHeight, 500) }

        @Watch('latest')
        onLatestChanged(val) { 
            let display = this.$refs.container;

            this.data.push(val);

            if(val.ID === this.ID || display.scrollHeight - display.offsetHeight - display.scrollTop < 150) this.$nextTick(()=> this.scrollTo(display.scrollHeight));
            else this.unread++;

        }

        beforeMount() {
            this.voiceDOM = this.createNodeByString('<svg viewBox="0 0 1024 1024" class="icon-voice" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3119" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M819.2 686.08c-58.88-66.56-84.48-133.12-79.36-197.12 7.68-89.6 76.8-148.48 76.8-148.48 10.24-7.68 12.8-25.6 2.56-35.84-7.68-10.24-25.6-12.8-35.84-2.56-2.56 2.56-87.04 71.68-94.72 181.76-7.68 79.36 25.6 158.72 92.16 235.52 5.12 5.12 12.8 7.68 20.48 7.68 5.12 0 12.8-2.56 17.92-7.68C826.88 711.68 829.44 696.32 819.2 686.08z" p-id="3120"></path><path d="M504.32 468.48c12.8-168.96 143.36-276.48 145.92-276.48 10.24-7.68 12.8-25.6 2.56-35.84-7.68-10.24-25.6-12.8-35.84-2.56-5.12 5.12-148.48 120.32-163.84 312.32-10.24 135.68 43.52 271.36 161.28 404.48 5.12 5.12 12.8 7.68 20.48 7.68 5.12 0 12.8-2.56 17.92-7.68 10.24-10.24 12.8-25.6 2.56-35.84C545.28 711.68 494.08 588.8 504.32 468.48z" p-id="3121"></path><path d="M250.88 450.56C271.36 202.24 460.8 48.64 463.36 46.08c10.24-7.68 12.8-25.6 2.56-35.84-7.68-10.24-25.6-12.8-35.84-2.56-7.68 7.68-207.36 168.96-230.4 437.76-15.36 189.44 61.44 381.44 227.84 570.88 5.12 5.12 12.8 7.68 20.48 7.68 5.12 0 12.8-2.56 17.92-7.68 10.24-10.24 12.8-25.6 2.56-35.84C309.76 803.84 235.52 624.64 250.88 450.56z" p-id="3122"></path></svg>');            
            this.loadingDOM = this.createNodeByString('<svg class="icon-loading" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1850" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M543.659 105.664v162.877c0 17.766-14.389 32.153-32.153 32.153s-32.153-14.389-32.153-32.153v-162.877c0-17.766 14.389-32.153 32.153-32.153 17.766 0 32.153 14.389 32.153 32.153z" p-id="1853"></path><path d="M741.809 176.035l-81.478 141.027c-5.947 10.304-16.77 16.077-27.877 16.077-5.45 0-10.979-1.397-16.045-4.327-15.385-8.877-20.643-28.539-11.753-43.924l81.478-141.027c8.877-15.385 28.539-20.643 43.924-11.769 15.371 8.89 20.643 28.553 11.753 43.939z" p-id="1857"></path><path d="M878.144 336.001l-141.074 81.397c-5.063 2.909-10.597 4.308-16.045 4.308-11.108 0-21.931-5.772-27.877-16.093-8.877-15.385-3.601-35.047 11.783-43.924l141.091-81.397c15.371-8.859 35.033-3.585 43.906 11.783 8.877 15.385 3.601 35.047-11.783 43.924z" p-id="1861"></path>            <path d="M948.383 510.388c0 17.766-14.389 32.153-32.153 32.153h-162.877c-17.748 0-32.153-14.389-32.153-32.153 0-17.748 14.404-32.153 32.153-32.153h162.877c17.766 0 32.153 14.404 32.153 32.153z" p-id="1852"></path><path d="M889.799 728.941c-5.964 10.304-16.77 16.077-27.877 16.077-5.45 0-10.979-1.397-16.045-4.327l-141.045-81.478c-15.371-8.877-20.643-28.553-11.753-43.924 8.877-15.385 28.553-20.643 43.924-11.753l141.045 81.478c15.371 8.877 20.627 28.553 11.753 43.924z" p-id="1856"></path><path d="M729.815 888.826c-5.063 2.909-10.597 4.308-16.045 4.308-11.108 0-21.931-5.772-27.877-16.093l-81.381-141.091c-8.877-15.385-3.601-35.047 11.783-43.924 15.371-8.877 35.033-3.585 43.906 11.783l81.397 141.091c8.877 15.385 3.601 35.047-11.783 43.924z" p-id="1860"></path><path d="M543.659 752.236v162.892c0 17.748-14.389 32.153-32.153 32.153s-32.153-14.404-32.153-32.153v-162.892c0-17.748 14.389-32.153 32.153-32.153 17.766 0 32.153 14.404 32.153 32.153z" p-id="1854"></path><path d="M418.372 735.885l-81.478 141.045c-5.964 10.304-16.77 16.077-27.877 16.077-5.465 0-10.996-1.397-16.061-4.327-15.371-8.89-20.643-28.553-11.753-43.924l81.478-141.045c8.89-15.371 28.553-20.627 43.924-11.753 15.385 8.89 20.643 28.553 11.769 43.924z" p-id="1858"></path><path d="M318.083 659.102l-141.091 81.381c-5.047 2.925-10.579 4.308-16.027 4.308-11.125 0-21.931-5.772-27.877-16.093-8.877-15.385-3.601-35.047 11.783-43.924l141.074-81.381c15.385-8.877 35.047-3.601 43.924 11.783s3.601 35.047-11.783 43.924z" p-id="1862"></path><path d="M301.812 510.388c0 17.766-14.404 32.153-32.153 32.153h-162.877c-17.766 0-32.153-14.389-32.153-32.153 0-17.748 14.389-32.153 32.153-32.153h162.877c17.748 0 32.153 14.404 32.153 32.153z" p-id="1851"></path><path d="M329.932 405.486c-5.947 10.322-16.77 16.077-27.86 16.077-5.465 0-10.996-1.383-16.061-4.308l-141.045-81.478c-15.371-8.89-20.627-28.553-11.753-43.924 8.89-15.385 28.553-20.643 43.924-11.769l141.045 81.478c15.371 8.89 20.643 28.553 11.753 43.924z" p-id="1855"></path><path d="M406.716 328.75c-5.047 2.925-10.579 4.308-16.027 4.308-11.125 0-21.931-5.772-27.877-16.093l-81.397-141.074c-8.877-15.385-3.601-35.047 11.783-43.924s35.047-3.601 43.924 11.783l81.381 141.074c8.877 15.385 3.601 35.047-11.783 43.924z" p-id="1859"></path></svg>');
        }

        mounted() {
            if(AudioContext) this.context = new AudioContext();
            else alert('您的浏览器不支持音频播放');
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

        generateHTML(item: message) {
            return item.duration ? 
            `${this.voiceDOM.outerHTML}<span class="duration">${Math.round(item.duration)}"</span>` 
            : item.data.reduce((l, v)=> l += v.type === 'text' ? v.content : `<img src='${this.domain}/image/${v.content}'>`, '');
        }

        formatTime(time: number) {
            let date = new Date(time);
            return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours() >= 13 ? `下午${date.getHours() - 12}` : `上午${date.getHours()}`}:${date.getMinutes()}:${date.getSeconds()}`;
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

            }
        }

        scroll() {
            this.$refs.container.scrollTop === 0 && this.$emit('loadmore', this.data.length);
            this.unread && this.$refs.container.children[this.data.length - this.unread].getBoundingClientRect().top < this.$el.offsetHeight && (this.unread = 0);
        }
    }

</script>

<style lang="scss" scoped>

    .assistor {
        position: relative;
        overflow: hidden;
    }

    .container {

        height: 100%;
        padding: 0 .6em;
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
            z-index: 1;
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
                }

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
            padding: 0 .5em;
        }

        &.only img {
            padding: 0;
            vertical-align: middle;
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

            &.animating {

                path:nth-child(2) {
                    animation: icon-voice-2 1s infinite;
                }

                path:nth-child(3) {
                    animation: icon-voice-3 1s infinite;
                }

            }
        }

        .icon-loading {
            vertical-align: middle;
            width: $height * .8;
            height: $height * .8;
            padding: 0 $height * .1;
            fill: #409eff;

            $time: .96s;
            $delay: 0.08s;

            path {opacity: 0}
            path:nth-child(1) {animation: loading $time $delay * 1 infinite;}
            path:nth-child(2) {animation: loading $time $delay * 2 infinite;}
            path:nth-child(3) {animation: loading $time $delay * 3 infinite;}
            path:nth-child(4) {animation: loading $time $delay * 4 infinite;}
            path:nth-child(5) {animation: loading $time $delay * 5 infinite;}
            path:nth-child(6) {animation: loading $time $delay * 6 infinite;}
            path:nth-child(7) {animation: loading $time $delay * 7 infinite;}
            path:nth-child(8) {animation: loading $time $delay * 8 infinite;}
            path:nth-child(9) {animation: loading $time $delay * 9 infinite;}
            path:nth-child(10) {animation: loading $time $delay * 10 infinite;}
            path:nth-child(11) {animation: loading $time $delay * 11 infinite;}
            path:nth-child(12) {animation: loading $time $delay * 12 infinite;}
        }

    }

    @keyframes icon-voice-2 {

        40% {
            opacity: 0;
        }

        69% {
            opacity: 0;
        }

        70% {
            opacity: 1;
        }
    }

    @keyframes icon-voice-3 {

        0% {
            opacity: 0;
        }

        79% {
            opacity: 0;
        }

        80% {
            opacity: 1;
        }
    }

    @keyframes loading {
        0% {
            opacity: 0;
        }

        50% {
            opacity: 1;
        }

        100% {
            opacity: 0
        }
    }

    
    .message.self {

        .content {

            .icon-voice {
                transform: none;
            }

        }
    }

</style>

