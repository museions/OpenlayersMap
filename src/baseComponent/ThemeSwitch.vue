<script setup lang="ts">
import { computed } from "vue";
import dayImg from "../assets/day.svg";
import nightImg from "../assets/night.svg";
import { useCommonStore } from "../store";
import { storeToRefs } from "pinia";
import { THEME_COLOR } from "../const";

const commonStore = useCommonStore();

const { themeColor } = storeToRefs(commonStore);

const colorFlag = computed(() => {
  return themeColor.value == THEME_COLOR.DAY;
});

const changeThemeColor = (flag: boolean) => {
  commonStore.setThemeColor(flag ? THEME_COLOR.DAY : THEME_COLOR.NIGHT);
};
</script>
<template>
  <div>
    <el-switch v-model="colorFlag" size="large" @change="changeThemeColor">
      <template #active-action>
        <img :src="dayImg" />
      </template>
      <template #inactive-action>
        <img :src="nightImg" />
      </template>
    </el-switch>
  </div>
</template>
<style scoped>
:deep(.el-switch__action) {
  display: flex;
  justify-content: center;
  align-items: center;
}
img {
  width: 20px;
  height: 20px;
}
</style>
