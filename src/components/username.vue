<template>
    <transition-group class='container' name='username' tag='div' appear>
        <svg key='svg' class='icon-chat' viewBox="0 0 1174 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1048" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M331.434667 263.424q0-23.424-14.293333-37.717333t-37.717333-14.293333q-24.576 0-43.434667 14.570667t-18.858667 37.418667q0 22.293333 18.858667 36.864t43.434667 14.570667q23.424 0 37.717333-13.994667t14.293333-37.418667zM756.010667 553.152q0-16-14.570667-28.565333t-37.418667-12.565333q-15.424 0-28.288 12.864t-12.864 28.288q0 16 12.864 28.864t28.288 12.864q22.848 0 37.418667-12.565333t14.570667-29.141333zM621.141333 263.424q0-23.424-13.994667-37.717333t-37.418667-14.293333q-24.576 0-43.434667 14.570667t-18.858667 37.418667q0 22.293333 18.858667 36.864t43.434667 14.570667q23.424 0 37.418667-13.994667t13.994667-37.418667zM984 553.152q0-16-14.848-28.565333t-37.141333-12.565333q-15.424 0-28.288 12.864t-12.864 28.288q0 16 12.864 28.864t28.288 12.864q22.293333 0 37.141333-12.565333t14.848-29.141333zM832 326.293333q-17.706667-2.282667-40-2.282667-96.576 0-177.706667 44.010667t-127.722667 119.146667-46.570667 164.288q0 44.565333 13.141333 86.848-20.010667 1.706667-38.848 1.706667-14.848 0-28.565333-0.853333t-31.424-3.712-25.429333-4.010667-31.146667-5.994667-28.565333-5.994667l-144.576 72.576 41.152-124.565333q-165.717333-116.010667-165.717333-280 0-96.576 55.722667-177.706667t150.848-127.722667 207.722667-46.570667q100.565333 0 189.994667 37.717333t149.717333 104.277333 77.994667 148.864zM1170.282667 646.848q0 66.858667-39.146667 127.722667t-106.005333 110.570667l31.424 103.424-113.706667-62.293333q-85.717333 21.141333-124.565333 21.141333-96.576 0-177.706667-40.277333t-127.722667-109.418667-46.570667-150.848 46.570667-150.848 127.722667-109.418667 177.706667-40.277333q92.010667 0 173.141333 40.277333t130.005333 109.717333 48.853333 150.570667z" p-id="1049"></path></svg>
        <p class='title' key='title'>We Chat</p>
        <form action='' key='nmae' @submit.prevent="submit" class='name' ref='form'>
            <input type="text" autofocus maxlength='16' placeholder="username" v-model='name'>
        </form>
    </transition-group>
</template>

<script lang='ts'>

    import { Vue, Component, Prop } from 'vue-property-decorator';
    import mixin from '../assets/mixin';

    @Component({mixins: [mixin]})
    export default class Username extends Vue {

        @Prop(Boolean) isMobile: boolean;

        name: string = '';

        mounted() {

            if(this.isMobile) {
                window.onresize = ()=> {
                    this.$refs.form.scrollIntoView();
                }
            } else {
                document.onkeypress = (e: KeyboardEvent)=> {
                    if(e.key === 'Enter') this.submit();
                }
            }
            
        }

        submit() {
            if(3 <= this.name.length && this.name.length <= 16)
                this.$emit('change', this.encodeHTML(this.name));
            else alert('用户名长度应在3-16个字符之间');
        }

        beforeDestroy() {
            document.onkeypress = null;
            window.onresize = null;
        }

    }

</script>

<style lang="scss" scoped>

    .container {
        overflow-x: hidden;
        overflow-y: auto;
        position: relative;
        height: 100%;
        padding-top: 15%;
        background: rgba(0, 0, 0, .7);

        .icon-chat, .name, .title {
            display: block;
            z-index: 1;
            position: relative;
            transition: all 1s ease-in-out;
        }

        .icon-chat {
            width: 50%;
            margin: 0 auto 2em;
            fill: rgba(255, 255, 255, .7); 
        }

        .title {
            color: white;
            font-weight: 100;
            font-size: 2em;
            text-align: center;
        }

        .name {

            text-align: center;
            transition-delay: .1s;

            input {
                width: 40%;
                height: 1.5em;
                padding: .2em .3em;
                border: none;
                border-bottom: 1px solid white;
                outline: none;
                margin: 0 auto;
                text-align: center;
                color: white;
                font-size: 1.5em;
                font-weight: 100;
                background-color: transparent;
            }
        }

        .username-enter , .username-leave-to {
            opacity: 0;
            transform: translateY(100px);
        }

        .username-enter-to, .username-leave {
            opacity: 1;
            transform: translateY(0px);
        }

    }

</style>
