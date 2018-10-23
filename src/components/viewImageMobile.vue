<template>

    <div class='container' 
    @touchstart.prevent.self='quit'>

        <img  ref='img' :style='{top: `${currentState.top}px`, left: `${currentState.left}px`, width: `${width}px`}' :class='{transition: transition}' :src='source.src'
        @transitionend='transition = false'
        @touchstart='$event.touches.length === 1 && (multipoint = false)'
        v-finger:tap='Tap'
        v-finger:multipoint-start='multipointStart'
        v-finger:press-move='move'
        v-finger:pinch='pinch'
        v-finger:touch-end='touchEnd'>

    </div>

</template>

<script lang='ts'>

    import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

    @Component
    export default  class ViewImage extends Vue {

        @Prop(Object) source;

        transition: boolean = true;
        multipoint: boolean = false;

        currentState: {top: number, left: number, scale: number} = {top: null, left: null, scale: null};
        initState: {top: number, left: number, scale: number} = {top: null, left: null, scale: null};
        pinchInitScale: number = 0;
        pinchFactor: number = 0.05;
        lastPinchEvent: object = null;

        get width():number {
            return this.source.width * this.currentState.scale;
        }

        get height():number {
            return this.source.height * this.currentState.scale;
        }

        beforeMount() {
            let source = this.source, currentState = this.currentState;

            Object.assign(currentState, {top: source.top, left: source.left, scale: 115.2 / source.width});

            if(source.width < innerWidth && source.height < innerHeight) this.initState.scale = 1;
            else this.initState.scale = Math.min(innerWidth / source.width, innerHeight / source.height);

            setTimeout(()=> {
                this.$el.style.backgroundColor = this.isMobile ? 'black' : 'rgba(0, 0, 0, .8)';
                currentState.top = this.initState.top = (innerHeight - this.initState.scale * source.height) /2;
                currentState.left = this.initState.left = (innerWidth - this.initState.scale * source.width) /2;
                currentState.scale = this.initState.scale;
            }, 200);
        }

        Tap() { this.multipoint  || this.quit();}

        multipointStart() { this.pinchInitScale = this.currentState.scale; this.multipoint = true; }

        move(e: TouchEvent) {
            this.currentState.top  += e.deltaY;
            this.currentState.left += e.deltaX;
        }

        pinch(e: TouchEvent) {

            let currentState = this.currentState,
                [touch1, touch2] = e.touches,
                center = {x: Math.abs(touch1.clientX - touch2.clientX) / 2 + Math.min(touch1.clientX, touch2.clientX), 
                          y: Math.abs(touch1.clientY - touch2.clientY) / 2 + Math.min(touch1.clientY, touch2.clientY)};
            
            let zoom = 1 - (1 - this.pinchInitScale * e.zoom / currentState.scale) * this.pinchFactor;
            currentState.top  = center.y - (center.y - currentState.top ) * zoom;
            currentState.left = center.x - (center.x - currentState.left) * zoom;
            currentState.scale = currentState.scale * zoom;

            this.lastPinchEvent = e;
        }

        touchEnd(e: TouchEvent) {

            if(e.touches.length) return;

            let currentState = this.currentState, {innerWidth, innerHeight} = window;  

            if(currentState.scale > 2 || currentState.scale < this.initState.scale
            || this.width < innerWidth || this.height < innerHeight 
            || currentState.top > 0 || currentState.left > 0 
            || innerWidth - currentState.left > this.width || innerHeight - currentState.top > this.height
            ) {

                this.transition = true;
                
                this.$nextTick(()=> {

                    if(this.lastPinchEvent) {

                        let scale = currentState.scale;
                    
                        if(scale > 2) {

                            this.lastPinchEvent.zoom = (1 - (1 - 2 / scale) / this.pinchFactor) * scale / this.pinchInitScale;
                            this.pinch(this.lastPinchEvent);
                        } else if(scale < this.initState.scale) {

                            this.lastPinchEvent.zoom = (1 - (1 - this.initState.scale / scale) / this.pinchFactor) * scale / this.pinchInitScale;
                            this.pinch(this.lastPinchEvent);
                        }
                    }

                    let {width, height} = this;

                    if(width < innerWidth) currentState.left = (innerWidth - width) / 2;
                    else if(currentState.left > 0) currentState.left = 0;
                    else if(innerWidth - currentState.left > width) currentState.left = innerWidth - width;

                    if(height < innerHeight) currentState.top = (innerHeight - height) / 2;
                    else if(currentState.top > 0) currentState.top = 0;
                    else if(innerHeight - currentState.top > height) currentState.top = innerHeight - height;

                });
            }
        }

        quit() {
            this.transition = true;
            this.$nextTick(()=> {
                this.currentState = {top: this.source.top, left: this.source.left, scale: 115.2 / this.source.width};
                this.$el.style.backgroundColor = 'transparent';
                this.$refs.img.addEventListener('transitionend', ()=> this.$emit('view-image-destroy'), {once: true});
            });
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
        transition: all ease-in-out .4s;

        img {
            
            position: absolute;
            
            &:hover {
                cursor: pointer;
            }

            &.transition {
                transition: all ease-in-out .3s;
            }
        }
    }

</style>






