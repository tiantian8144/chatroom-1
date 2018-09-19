<template>
    <div class='container' id='display'
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
                <div class='content' :class='{audio: item.duration}' :data-src='item.duration && `${domain}/audio/${item.data[0].content}`' v-html='generateHTML(item)'
                @click='handler($event)'
                @touchstart.prevent='handler($event)'></div>
            </div>
        </div>

        <div v-show='mask' class='mask' ref='mask'></div>
        <audio :src='audioSrc' style='display: none' ref='audio'
        @canplay='$refs.audio.play()' 
        @playing='SVG.setAttribute("class", "icon-voice animating");'
        @pause='SVG.setAttribute("class", "icon-voice"); audioSrc = "";'
        @ended='SVG.setAttribute("class", "icon-voice"); audioSrc = "";'></audio>

        <transition name='tip'>
            <div class='unread' v-if='unread'><span 
            @click='scrollTo($el.scrollHeight - $el.offsetHeight); unread = 0;'
            @touchstart.prevent='scrollTo($el.scrollHeight - $el.offsetHeight); unread = 0;'>{{unread}}</span></div>
        </transition>
    </div>

</template>

<script lang="ts">

    import { Vue, Prop, Component, Watch } from 'vue-property-decorator';

    @Component
    export default class Display extends Vue {

        @Prop(String) ID;
        @Prop(String) name;
        @Prop(String) domain;
        @Prop(Array) history;
        @Prop(Object) latest;
        @Prop(Boolean) isMobile;

        mask: boolean = false;

        audioSrc: string = '';
        data: Array<message> = [];
        SVG: SVGElement = null;
        unread: number = 0;

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
        onHistoryChanged(val) { this.data.unshift(...val); this.data.length === 20 && this.$nextTick(()=> this.$el.scrollTop = this.$el.scrollHeight) }

        @Watch('latest')
        onLatestChanged(val) { 
            let display = this.$el;

            this.data.push(val);

            if(val.ID === this.ID) this.$nextTick(()=> this.scrollTo(display.scrollHeight - display.offsetHeight));
            else if(display.scrollHeight - display.offsetHeight - display.scrollTop > 200) this.unread++;

        }

        mounted() {
            this.bus.$on('state', val=> this.mask = val);
        }

        scrollTo(target: number) {
            let display = this.$el,
                step = (target - display.scrollTop) / 30,
                ID = setInterval(()=> display.scrollTop >= target ? clearInterval(ID) : (display.scrollTop += step), 10);
                
            //消除移动端软键盘消失导致的定时器无法取消问题
            this.isMobile && setTimeout(()=> { clearInterval(ID); display.scrollTop = display.scrollHeight }, 300);
        }

        drop(e: DragEvent) {
            this.$el.classList.remove('drag-enter');
            this.bus.$emit('data', e.dataTransfer.files);
        }

        generateHTML(item: message) {
            return item.duration ? 
            `<svg viewBox="0 0 1024 1024" class='icon-voice' version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3119" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M819.2 686.08c-58.88-66.56-84.48-133.12-79.36-197.12 7.68-89.6 76.8-148.48 76.8-148.48 10.24-7.68 12.8-25.6 2.56-35.84-7.68-10.24-25.6-12.8-35.84-2.56-2.56 2.56-87.04 71.68-94.72 181.76-7.68 79.36 25.6 158.72 92.16 235.52 5.12 5.12 12.8 7.68 20.48 7.68 5.12 0 12.8-2.56 17.92-7.68C826.88 711.68 829.44 696.32 819.2 686.08z" p-id="3120"></path><path d="M504.32 468.48c12.8-168.96 143.36-276.48 145.92-276.48 10.24-7.68 12.8-25.6 2.56-35.84-7.68-10.24-25.6-12.8-35.84-2.56-5.12 5.12-148.48 120.32-163.84 312.32-10.24 135.68 43.52 271.36 161.28 404.48 5.12 5.12 12.8 7.68 20.48 7.68 5.12 0 12.8-2.56 17.92-7.68 10.24-10.24 12.8-25.6 2.56-35.84C545.28 711.68 494.08 588.8 504.32 468.48z" p-id="3121"></path><path d="M250.88 450.56C271.36 202.24 460.8 48.64 463.36 46.08c10.24-7.68 12.8-25.6 2.56-35.84-7.68-10.24-25.6-12.8-35.84-2.56-7.68 7.68-207.36 168.96-230.4 437.76-15.36 189.44 61.44 381.44 227.84 570.88 5.12 5.12 12.8 7.68 20.48 7.68 5.12 0 12.8-2.56 17.92-7.68 10.24-10.24 12.8-25.6 2.56-35.84C309.76 803.84 235.52 624.64 250.88 450.56z" p-id="3122"></path></svg><span class="duration">${Math.round(item.duration)}"</span>` 
            : item.data.reduce((l, v)=> l += v.type === 'text' ? v.content : `<img src='${this.domain}/image/${v.content}'>`, '');
        }

        formatTime(time: number) {
            let date = new Date(time);
            return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours() >= 13 ? `下午${date.getHours() - 12}` : `上午${date.getHours()}`}:${date.getMinutes()}:${date.getSeconds()}`;
        }

        handler(e: MouseEvent) {
            let content: HTMLElement = e.currentTarget as HTMLElement;

            if(content.className.includes('audio')) {
                
                if(this.$refs.audio.paused) {
                    this.audioSrc = content.dataset.src;
                    this.SVG = content.querySelector('svg');
                } else if (content.querySelector('svg').getAttribute('class').includes('animating')) {
                    this.$refs.audio.pause();
                } else {
                    this.$refs.audio.pause();
                    let ID = setInterval(()=> this.audioSrc || (this.audioSrc = content.dataset.src, this.SVG = content.querySelector('svg'), clearInterval(ID)), 10);
                }
            }
        }

        scroll() {
            this.$el.scrollTop === 0 && this.$emit('loadmore', this.data.length);
            this.$el.children[this.data.length - this.unread].getBoundingClientRect().top < this.$el.offsetHeight && (this.unread = 0);
        }
    }

</script>

<style lang="scss" scoped>

    .container {

        position: relative;
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

    .tip-enter-active {
        transition: all .5s ease-in-out
    }

    .tip.enter-to {
        opacity: 1;
        transform: translateY(0px);
    }

    .tip-leave-active {
        transition: all .5s ease-in-out;
    }

    .tip-leave-to {
        opacity: 0;
        transform: translateY(-100px);
    }

</style>

<style lang='scss'>

    #display .message .content {

        img {
            width: 8em;
            padding: 0 .5em;
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

    
    .message.self {

        .content {

            .icon-voice {
                transform: none;
            }

        }
    }





</style>

