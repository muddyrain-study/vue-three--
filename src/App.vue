<script setup>
import * as THREE from "three";
import RoomShapeMesh from "./threeMesh/RoomShapeMesh";
import WallShaderMaterial from "./threeMesh/WallShaderMaterial";
import WallMesh from "./threeMesh/WallMesh";
import gsap from "gsap";
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

// 加载接口
let idToPanorama = {};
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

      // 房间到全景图的映射
      for (let j = 0; j < obj.panoramaLocation.length; j++) {
        const panorama = obj.panoramaLocation[j];
        if (panorama.roomId === room.roomId) {
          idToPanorama[room.roomId] = panorama;
          let material = new WallShaderMaterial(panorama);
          panorama.material = material;
        }
      }

      roomMesh.material = idToPanorama[room.roomId].material;
      roomMesh.material.side = THREE.DoubleSide;
      roomTopMesh.material = idToPanorama[room.roomId].material.clone();
      roomTopMesh.material.side = THREE.FrontSide;
    }

    // 创建墙
    for (let i = 0; i < obj.wallRelation.length; i++) {
      let wallPoints = obj.wallRelation[i].wallPoints;
      let faceRelation = obj.wallRelation[i].faceRelation;

      faceRelation.forEach((item) => {
        item.panorama = idToPanorama[item.roomId];
      });

      let mesh = new WallMesh(wallPoints, faceRelation);
      scene.add(mesh);
    }
    console.log(idToPanorama);
  });
let roomIndex = 0;
let timeline = gsap.timeline();
let dir = new THREE.Vector3();
let panoramaLocation;
function changeRoom() {
  let room = panoramaLocation[roomIndex];
  dir = camera.position
    .clone()
    .sub(
      new THREE.Vector3(
        room.point[0].x / 100,
        room.point[0].z / 100,
        room.point[0].y / 100
      )
    )
    .normalize();

  timeline.to(camera.position, {
    duration: 1,
    x: room.point[0].x / 100 + dir.x * 0.01,
    y: room.point[0].z / 100,
    z: room.point[0].y / 100 + dir.z * 0.01,
  });
  camera.lookAt(
    room.point[0].x / 100,
    room.point[0].z / 100,
    room.point[0].y / 100
  );
  controls.target.set(
    room.point[0].x / 100,
    room.point[0].z / 100,
    room.point[0].y / 100
  );
  roomIndex++;
  if (roomIndex >= panoramaLocation.length) {
    roomIndex = 0;
  }
}
</script>

<template>
  <div>
    <button class="btn" @click="changeRoom">切换房间</button>
  </div>
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
.btn {
  position: fixed;
  left: 50px;
  top: 50px;
  background: skyblue;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1000;
}
</style>
