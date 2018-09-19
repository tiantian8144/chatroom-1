<template>
    <div class='container'><img :src="src"  ref='img'
    @mousedown='$refs.img.onmousemove = move'
    @mouseup="touching = false"></div>
</template>

<script lang='ts'>

    import { Vue, Component, Prop } from 'vue-property-decorator';

    @Component
    export default class ViewImage extends Vue {

        @Prop({type: Boolean, default: false}) isMobile;

        mounted() {
            this.bus.$on('view-image', target=> {
                this.src = target.src;

            });
        }

        move(e: MouseEvent) {

        }
    }

</script>

<style lang="scss" scoped>

    .container {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(0, 0, 0, .5);

        img {
            
            position: absolute;

            &:hover {
                cursor: pointer;
            }
        }
    }

</style>





