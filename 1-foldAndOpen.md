# 折叠展开

```html
<template>
    <div class="rank-block">
        <div class="folder-btn" @click="toggleRewardDesc">{{!!isshow ? '收起': '展开'}}</div>

        <transition name="foldOpen">
            <div class="reward-desc" v-show="isshow">hehheheheh</div>
        </transition>
        <ul class="rank-list">
            <li></li>
        </ul>
    </div>
</template>

<script>
export default {
    name: "Rank",

    data() {
        return {
            isshow: false,
        };
    },

    methods: {
        toggleRewardDesc() {
            this.isshow = !this.isshow;
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../../__common/css/base.scss";

.reward-desc {
    width: 100%;
    background: red;
    height: 490px;
    transition: all 0.3s ease;
}

/** 折叠展开 Collapse and expand  */
.foldOpen-enter,
.foldOpen-leave-to {
    height: 0;
    opacity: 0;
}
.foldOpen-enter-to,
.foldOpen-leave {
    height: 490px;
}
</style>
```