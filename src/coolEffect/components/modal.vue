<template>
    <div class="mask-modal" v-show="isShow">
        <div class="close-btn" @click="closeModal">关闭</div>
        <div class="modal-container">
            <img src="../assets/images/avatar.png" alt />
        </div>
    </div>
</template>

<script>
export default {
    name: "Modal",
    data() {
        return {
            isShow: false,
        };
    },

    mounted() {
        // console.log("错误");
        // console.log(adgb);

        coreBus.$on("toggleModal", (bool) => {
            this.isShow = bool;
        });
    },

    methods: {
        closeModal() {
            coreBus.$emit("toggleModal", false);
        },
    },
};
</script>

<style lang="scss" scoped>
.mask-modal {
    position: fixed;
    width: 100%;
    height: 100%;
    background: url(../assets/images/bg-banner.png) 0 0/ 100% auto no-repeat #c20;
    left: 0;
    top: 0;

    .modal-container {
        position: absolute;
        width: 914px;
        height: 1314px;
        border-radius: 40px;
        background: #c28130;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
}
</style>