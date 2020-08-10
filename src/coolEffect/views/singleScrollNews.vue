<template>
    <div class="scroll">
        <ul class="list">
            <li v-for="item in list" :key="item">{{item}}</li>
        </ul>
    </div>
</template>

<script>
export default {
    name: "SingleScrollNews",
    data() {
        return {
            list: [
                "11111111111111111111111",
                "22222222222222222222222",
                "333333333333333333333333",
                "444444444444444444444444",
                "555555555555555555555555",
                "666666666666666666666666",
            ],
        };
    },

    methods: {},
};
</script>

<style lang="scss" scoped>
.scroll {
    width: 90%;
    height: 60px;
    margin: 100px auto;
    border: 2px solid red;
    overflow: hidden;
}

.list {
    background: #de0;
    li {
        padding-left: 20px;
        height: 60px;
    }
}
</style>