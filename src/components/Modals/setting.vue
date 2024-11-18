<script setup lang="ts">
import { ref, toRaw } from "vue";
import { storeToRefs } from "pinia";
import { SCALEPLATE_LIST } from "../../const/const.map";
import { MODAL_NULL } from "../../const/const.modals";
import { ScaleLine } from "ol/control";
import { useModalStore, useMapStore } from "../../store";
import { Map } from "ol";

const mapStore = useMapStore();

const { map } = storeToRefs(mapStore);
const modalStore = useModalStore();

const scaleValue = ref(SCALEPLATE_LIST[0].t);

const selectScaleUnit = (unit: string) => {
  const v = SCALEPLATE_LIST.filter(({ t }) => unit == t)[0].v;
  const mapInstance: Map = toRaw(map.value);

  const scaleControl: ScaleLine | undefined = mapInstance
    .getControls()
    .getArray()
    .find((control: any) => control instanceof ScaleLine);

  if (scaleControl && scaleControl.getUnits() != v) {
    scaleControl.setUnits(v);
  }
};
const hideModal = () => {
  modalStore.setModalType(MODAL_NULL);
};

const loading = ref(false);
</script>
<template>
  <el-dialog
    :model-value="true"
    title="设置"
    width="30%"
    :close-on-press-escape="false"
    @close="hideModal()"
  >
    <div v-loading="loading">
      <div class="content">
        <div class="item">
          <span>比例尺</span>
          <el-select
            v-model="scaleValue"
            placeholder="请选择比例尺单位"
            style="width: 80%"
            @change="selectScaleUnit"
          >
            <template v-for="item in SCALEPLATE_LIST">
              <el-option :label="item.t" :value="item.t">
                <span style="float: left">{{ item.t }}</span>
                <span style="float: right; color: #aaa">{{ item.v }}</span>
              </el-option>
            </template>
          </el-select>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<style scoped>
.item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.item span {
  margin-right: 10px;
}
</style>
