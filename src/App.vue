<template>
	<div id='app' :style='{margin: name ? "0 20%" : "0 30%"}'>
        <div v-if='name && ID && avatar' class='wrapper'>
            <display class='display' :ID='ID' :name='name' :domain='domain' :history='history' :latest='latest' @loadmore='socket.emit("history", $event, 20)' @view-image='viewSource = $event'></display>
            <send class='send' @message='sendMsg' :avatar='avatar' :domain='domain' ref='send'></send>
            <view-image-mobile v-if='isMobile && viewSource' :source='viewSource' @view-image-destroy='viewSource = null'></view-image-mobile>
            <view-image-pC v-if='!isMobile && viewSource' :source='viewSource' @view-image-destroy='viewSource = null'></view-image-pC>
        </div>
        <username v-else @change='nameChanged'></username>
    </div>
</template>

<script lang="ts">

    import io from 'socket.io';
    import { Vue, Component } from 'vue-property-decorator';

    import Username from './components/username.vue';
    import Display from './components/display.vue';
    import Send from './components/send.vue';

    const ViewImageMobile = ()=> import('./components/viewImageMobile.vue');
    const ViewImagePC = ()=> import('./components/viewImagePC.vue');

    @Component({components: {Username, Display, Send, ViewImageMobile, ViewImagePC}})
    export default class App extends Vue {

        name: string = localStorage.name || '';
        ID: string = localStorage.ID || '';
        avatar: string = localStorage.avatar || '';
        socket: object = null;
        messages: Array<segment> = [];
        domain: string = 'http://localhost:8080';
        history: Array<message> = [];
        latest: message = null;
        viewSource: object = null;

        mounted() {
            
            let socket = this.socket = io(this.domain, {autoConnect: false});

            socket.on('history', data=> data ? (this.history = data) : alert('历史消息获取失败，请刷新重试'));
            socket.on('message', data=> this.latest = data);
            socket.on('response', res=> { res ? (this.latest = res) : alert('消息发送失败'); this.$children[1].sending = false});
            
            socket.open();
            socket.emit('history', 0, 20);
        }

        nameChanged(name: string) {
            localStorage.name = this.name = name;
            localStorage.ID = this.ID = Math.random().toString(16).slice(2);
            localStorage.avatar = this.avatar = Math.floor(Math.random() * 20) + '.png';
        }

        sendMsg(data) {
            this.socket.binary(true).send(Object.assign({name: this.name, ID: this.ID, avatar: this.avatar, time: Date.now()}, data));
        }
    }

</script>

<style lang="scss" scoped>

	#app {
        overflow: hidden;
		font-family: 'Open Sans','Avenir', Helvetica, Arial, sans-serif;
        height: 100%;
	}

    @media screen and (max-width: 768px) {
        #app {
            width: 100%;
            margin: 0!important;
        }
    }

    .wrapper {
        display: flex;
        flex-direction: column;
        max-width: 800px;
        height: 100%;
        margin: auto;
    }

    .display {
        flex: 1 1 auto;
        background-color: rgba(255, 255, 255, .8);
    }

    .send {
        flex: 0 1 auto;
        padding-top: .2em;
        background-color: rgba(255, 255, 255, .9);
    }

</style>