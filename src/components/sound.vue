<template>
    <div class='container'>
        <div class='mask'></div>
        <div class='caption'>{{ prompt }}</div>
        <!-- 录音 -->
        <div v-if='!audition' class='panel-recorder' :class='{active: recording}'>
            <svg class="icon icon-play" @mouseenter='extraPrompt(true, "试听")' @mouseleave='extraPrompt(false)' @mouseup.stop='handleAudition' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2815" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M204.454912 138.15808 820.340736 512.016384l-616.723456 373.819392L204.454912 138.15808M204.454912 84.583424c-29.586432 0-53.574656 23.988224-53.574656 53.574656l-0.837632 747.676672c-0.013312 19.47648 10.529792 37.421056 27.5456 46.877696 7.99232 4.368384 16.939008 6.670336 26.028032 6.695936 9.993216 0.014336 19.776512-2.771968 28.278784-8.04352L848.605184 557.559808c25.1392-15.591424 32.896-48.617472 17.317888-73.783296-4.369408-7.011328-10.30656-12.949504-17.317888-17.304576L232.733696 92.653568c-8.48896-5.25824-18.285568-8.04352-28.278784-8.04352l0 0L204.454912 84.583424z" p-id="2816"></path></svg>
            <svg class="icon icon-mic" @mousedown='start($event)' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4531" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M512 64c-87.4 0-158 75-158 167L354 540c0 92 70.6 167 158 167 87.4 0 158-75 158-167L670 231C670 139 599.4 64 512 64zM638 540c0 74.4-56.6 135-126 135-69.4 0-126-60.6-126-135L386 231c0-74.4 56.6-135 126-135 69.4 0 126 60.6 126 135L638 540zM734 384l0 159.4c0 120.4-99.6 218.4-220 218.4-120.4 0-220-98-220-218.4L294 384l-38 0 0 159.4c0 134.4 106 245.2 240 255L496 924l-146 0 0 36 322 0 0-36-138 0 0-125.6c132-9.8 234-120.6 234-255L768 384 734 384z" p-id="4532"></path></svg>
            <svg class="icon icon-trash" @mouseenter='extraPrompt(true, "取消")' @mouseleave='extraPrompt(false, recording ? null : "按住说话")' @mouseup.stop='abandon' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5193" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M1000.727273 93.090909h-311.854546L619.054545 23.272727c-4.654545-4.654545-9.309091-4.654545-13.963636-4.654545-4.654545-13.963636-13.963636-18.618182-23.272727-18.618182h-139.636364c-9.309091 0-18.618182 9.309091-23.272727 18.618182-4.654545 0-9.309091 4.654545-13.963636 4.654545L339.781818 88.436364s0 4.654545-4.654545 4.654545H23.272727c-13.963636 0-23.272727 9.309091-23.272727 23.272727s9.309091 23.272727 23.272727 23.272728h325.818182c9.309091 0 18.618182-4.654545 23.272727-13.963637h4.654546l65.163636-65.163636c0-9.309091 0-9.309091 4.654546-13.963636h134.981818c0 4.654545 4.654545 4.654545 4.654545 4.654545L651.636364 121.018182c4.654545 9.309091 13.963636 18.618182 23.272727 18.618182h325.818182c13.963636 0 23.272727-9.309091 23.272727-23.272728s-9.309091-23.272727-23.272727-23.272727zM907.636364 232.727273c-13.963636 0-23.272727 9.309091-23.272728 23.272727V930.909091c0 23.272727-18.618182 46.545455-46.545454 46.545454H186.181818c-27.927273 0-46.545455-18.618182-46.545454-46.545454V256c0-13.963636-9.309091-23.272727-23.272728-23.272727s-23.272727 9.309091-23.272727 23.272727V930.909091c0 51.2 41.890909 93.090909 93.090909 93.090909h651.636364c51.2 0 93.090909-41.890909 93.090909-93.090909V256c0-13.963636-9.309091-23.272727-23.272727-23.272727z" fill="" p-id="5194"></path><path d="M325.818182 861.090909v-605.090909c0-13.963636-9.309091-23.272727-23.272727-23.272727s-23.272727 9.309091-23.272728 23.272727v605.090909c0 13.963636 9.309091 23.272727 23.272728 23.272727s23.272727-9.309091 23.272727-23.272727zM512 861.090909v-605.090909c0-13.963636-9.309091-23.272727-23.272727-23.272727s-23.272727 9.309091-23.272728 23.272727v605.090909c0 13.963636 9.309091 23.272727 23.272728 23.272727s23.272727-9.309091 23.272727-23.272727zM698.181818 861.090909v-605.090909c0-13.963636-9.309091-23.272727-23.272727-23.272727s-23.272727 9.309091-23.272727 23.272727v605.090909c0 13.963636 9.309091 23.272727 23.272727 23.272727s23.272727-9.309091 23.272727-23.272727z"></path></svg>
        </div>
        <!-- 试听面板 -->
        <div v-else class='panel-audition'>
            <!-- 点击播放 -->
            <div class='progress-wrapper'>
                <svg class='progressbar' viewBox="0 0 100 100">
                    <circle class='track' cx='50' cy='50' r='50'></circle>
                    <circle class='progress' cx='50' cy='50' r='50' ref='progress'></circle>
                </svg>
                <svg v-if='!playing' class='play'  @click='$refs.audio[playing ? "pause" : "play"]();' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M268.7 79.1l586.1 373c33.6 21.4 43.5 65.9 22.1 99.4-5.7 8.9-13.2 16.4-22.1 22.1l-586.1 373c-33.6 21.4-78.1 11.5-99.4-22.1-7.4-11.6-11.3-25-11.3-38.7v-746c0-39.8 32.2-72 72-72 13.7 0 27.1 3.9 38.7 11.3z" p-id="2590"></path></svg>
                <svg v-else class='pause' @click='$refs.audio[playing ? "pause" : "play"]()' viewBox="0 0 100 100"><rect x='0' y='0' width='100' height='100' rx='10' ry='10'></rect></svg>
            </div>
            <!-- 确定是否发送录音 -->
            <div class='button-group'>
                <button class='send' @click='$emit("message", {data: [{type: "audio", content: recorder.wavBuffer}], duration: recorder.time}); quit();'>✔</button>
                <button class='delete' @click='quit'>✖</button>
            </div>
            <!-- 播放试听 -->
            <audio :src="recordURL" @durationchange='time = recorder.time' @playing='playing = true; update()' @pause='pause' style='display: none;' ref='audio'></audio>
        </div>
        
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Watch } from 'vue-property-decorator';
    import Recorder from '../assets/recorder';

    @Component
    export default class Sound extends Vue {

        //显隐控制
        recording: Boolean = false;
        timeBlock: Boolean = false;
        audition: Boolean = false;
        playing: Boolean = false;

        //数据
        prompt: string = '按住说话';
        time: number = 0;
        recorder: Recorder = null;
        reader = new FileReader();
        progressLen: number = 314;
        recordData: Blob = null;
        recordURL: string = '';
        ID: number = null;

        @Watch('time')
        onTimeChanged(val) {
            val = Math.min(val, 15);
            !this.timeBlock && (this.prompt = `00:${Math.round(val).toString().padStart(2, '0')}`);
        }

        mounted() {

            new Recorder((time: number)=> {
                if(time > 15) { this.handleAudition(); alert('录音不得超过15s'); } 
                else  this.time = time})
            .then(recorder=> { this.recorder = recorder; recorder.suspend(); }).catch(err=> { this.$emit('cantrecord'); alert(err.message || '当前浏览器无法使用录音功能') })
                    
            this.reader.addEventListener('load', (e: ProgressEvent)=> this.recordURL = this.reader.result);
        }

        //录音
        start(e: MouseEvent) {
            this.recorder.resume();
            this.recording = true;
            this.bus.$emit('state', true);

            document.onmouseup = (e: MouseEvent)=> {
                
                this.recorder.suspend()
                .then(()=> {
                    this.recorder.exportWAV();
                    this.$emit('message', {data: [{type: 'audio', content: this.recorder.wavBuffer}], duration: this.time});
                    this.recording = false;
                    this.prompt = '按住说话';
                    this.bus.$emit('state', false);

                    this.recorder.clear();
                    document.onmouseup = null;
                })
                .catch(err=> { alert('录音出现错误，请重试'); document.onmouseup = null; })
                

            };
        }

        //放弃本次录音
        abandon() {
            this.recording = false;
            this.bus.$emit('state', false);
            document.onmouseup = null; 
            this.recorder.suspend().then(()=> { this.recorder.clear(); this.time = 0; })
        }

        //显示额外的信息
        extraPrompt(flag: boolean, val?: string) {
            this.timeBlock = flag;
            this.prompt = val || `00:${Math.round(this.time).toString().padStart(2, '0')}`;
        }

        handleAudition() {

            this.recorder.suspend()
            .then(()=> {
                this.recordData = this.recorder.exportWAV();
                this.reader.readAsDataURL(this.recordData);
            });

            document.onmouseup = null;
            this.audition = true;
            this.recording = false;
            this.extraPrompt(false);
        }

        update() {

            this.time = 0.01;

            this.ID = setInterval(()=> {
                this.time += 0.05;
                this.$refs.progress.style.strokeDashoffset = (1 - this.time / this.recorder.time) * this.progressLen;
                this.time >= this.recorder.time && this.$refs.audio.pause();
            }, 50);
        }

        pause() {
            clearInterval(this.ID);
            this.time = this.recorder.time;
            this.$refs.progress.style.strokeDashoffset = this.progressLen;
            this.playing = false;
            this.$refs.audio.currentTime = 0;
        }

        quit() {
            this.$refs.audio.pause();
            this.audition = false; 
            this.recordData = null;
            this.recorder.clear();
            this.bus.$emit('state', false);
            let ID = setInterval(()=> this.playing || (this.prompt = '按住说话', clearInterval(ID)), 10);
        }
    }

</script>

<style lang="scss" scoped>

    .mask {
        position: fixed;
        height: 100%;
        margin: 0 20%;
        background-color: rgba(0, 0, 0, .5);
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;

        svg {
            overflow: visible;
        }

        .caption {
            flex: 0 1 3em;
            line-height: 3em;
            color: #666;
            font-weight: 200;
        }

        .panel-recorder {
            width: 100%;
            flex: 1 1 auto;
            position: relative;

            .icon-mic {
                position: absolute;
                z-index: 1;
                top: 50%;
                left: 50%;
                height: 50%;
                max-height: 200px;
                padding: 1em;
                fill: white;
                background-color: #409eff;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: transform .3s ease-in-out;

                &:hover {
                    cursor: pointer;
                }

            }

            .icon-play, .icon-trash {
                position: absolute;
                top: 25%;
                height: 10%;
                max-height: 2em;
                padding: .8em;
                border: 1px solid #BBB;
                border-radius: 50%;
                opacity: 0;
                visibility: hidden;
                background-color: transparent;
                transition: all .3s ease-in-out;

                &:hover {
                    cursor: pointer;
                    fill: white;
                    background-color: #AAA;
                    transform: scale(1.2);
                }
            }

            .icon-play {
                right: 50%;
            }

            .icon-trash {
                left: 50%;
            }

            &.active {

                .icon-mic {
                    transform: translate(-50%, -50%) scale(.8);
                }

                .icon-play {
                    visibility: visible;
                    opacity: 1;
                    top: 20%;
                    right: 75%;
                }

                .icon-trash {
                    visibility: visible;
                    opacity: 1;
                    top: 20%;
                    left: 75%;
                }
            }
        }

        .panel-audition {

            position: relative;
            width: 100%;
            flex: 1 1 auto;

            .progress-wrapper {

                position: absolute;
                width: 136px;
                top: 40%;
                left: 50%;
                transform: translate(-50%, -50%);
                height: 70%;
                max-height: 200px;

                .progressbar {
                    
                    height: 100%;

                    .track {
                        fill: none;
                        stroke: #ddd;;
                        stroke-width: .15em;
                    }

                    .progress {
                        fill: none;
                        stroke: #409eff;
                        stroke-width: .15em;
                        stroke-dasharray: 314;
                        stroke-dashoffset: 314;
                        transform: rotate(-90deg);
                        transform-origin: 50% 50%;
                    }
                }
                
                .play, .pause {
                    position: absolute;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    fill: #409eff;

                    &:hover {
                        cursor: pointer;
                    }
                }

                .play {
                    height: 50%;
                    left: 52%;
                }

                .pause {
                    height: 30%;
                    left: 50%;

                }
            }

            .button-group {
                
                position: absolute;
                left: 50%;
                top: 80%;
                transform: translateX(-50%);

                button {
                    width: 3em;
                    border: none;
                    outline: none;
                    color: #409eff;
                    text-align: center;
                    font-size: 1.5em;
                    background-color: transparent;
                    transition: transform .3s ease-in-out;

                    &:hover {
                        cursor: pointer;
                        transform: scale(1.3);
                    }
                }
            }

        }
    }

</style>

