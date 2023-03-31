<script setup>
import * as THREE from "three";
import RoomShapeMesh from "./threeMesh/RoomShapeMesh";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// 创建场景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5.5);

const renderer = new THREE.WebGLRenderer({
  // 抗锯齿
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

requestAnimationFrame(function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
});

const axis = new THREE.AxesHelper(5);
scene.add(axis);

// 加载全景图
const loader = new THREE.TextureLoader();
const texture = loader.load("/assets/HdrSkyCloudy004_JPG_8K.jpg");
texture.mapping = THREE.EquirectangularReflectionMapping;

scene.background = texture;
scene.environment = texture;

// 加载模型
fetch(
  "https://test-1251830808.cos.ap-guangzhou.myqcloud.com/three_course/demo720.json"
)
  .then((res) => res.json())
  .then((obj) => {
    console.log(obj);
    // 循环创建房间
    for (let i = 0; i < obj.objData.roomList.length; i++) {
      // 获取每个房间数据
      const room = obj.objData.roomList[i];

      // 创建房间
      const roomMesh = new RoomShapeMesh(room);
      const roomTopMesh = new RoomShapeMesh(room, true);
      scene.add(roomMesh, roomTopMesh);
    }
  });
</script>

<template>
  <div></div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}
canvas {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}
</style>
