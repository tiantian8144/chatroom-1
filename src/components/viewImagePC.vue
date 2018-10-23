<template>

    <div class='container' 
    @click.self='quit'>

        <img  ref='img' :style='{top: `${currentState.top}px`, left: `${currentState.left}px`, width: `${width}px`}' :class='{transition: transition}' :src='source.src' draggable="false"
        @transitionend='transition = false'
        
        @mousedown.left='$event.target.addEventListener("mousemove", move); time = Date.now();'
        @mouseup.left='$event.target.removeEventListener("mousemove", move); Date.now() - time < 200 ? quit() : adjust();'>

    </div>

</template>

<script lang='ts'>

    import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

    @Component
    export default  class ViewImage extends Vue {

        @Prop(Object) source;

        transition: boolean = true;

        time: number = 0;
        currentState: {top: number, left: number, scale: number} = {top: null, left: null, scale: null};
        initState: {top: number, left: number, scale: number} = {top: null, left: null, scale: null};

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

            document.onmousewheel = this.mousewheel;
        }

        move(e: MouseEvent) {
            this.currentState.top  += e.movementY;
            this.currentState.left += e.movementX;
        }

        adjust() {

            let currentState = this.currentState, {innerWidth, innerHeight} = window;  

            if(this.width < innerWidth || this.height < innerHeight 
            || currentState.top > 0 || currentState.left > 0 
            || innerWidth - currentState.left > this.width || innerHeight - currentState.top > this.height
            ) {

                this.transition = true;
                
                this.$nextTick(()=> {

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

        mousewheel(e: WheelEvent) {
            let zoom = 1 - e.deltaY / 100 * .1, currentState = this.currentState,
                       center = {x: window.innerWidth / 2, y: window.innerHeight / 2},
                       scale = currentState.scale * zoom;

            if(scale <= this.initState.scale || scale >= 2) return;

            currentState.top  = center.y - (center.y - currentState.top ) * zoom;
            currentState.left = center.x - (center.x - currentState.left) * zoom;
            currentState.scale = scale;
        }

        quit() {
            this.transition = true;
            this.$nextTick(()=> {
                this.currentState = {top: this.source.top, left: this.source.left, scale: 115.2 / this.source.width};
                this.$el.style.backgroundColor = 'transparent';
                this.$refs.img.addEventListener('transitionend', ()=> this.$emit('view-image-destroy'), {once: true});
            });
        }

        beforeDestroy() {
            document.onmousewheel = null;
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






