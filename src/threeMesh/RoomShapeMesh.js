import * as THREE from "three";

export default class RoomShapeMesh extends THREE.Mesh {
  constructor(room, isTop = false) {
    super();
    this.room = room;
    this.isTop = isTop;

    this.roomShapePoints = room.areas;
    this.init();
  }

  init() {
    let roomShape = new THREE.Shape();
    // 生成房间形状
    for (let i = 0; i < this.roomShapePoints.length; i++) {
      let point = this.roomShapePoints[i];
      if (i === 0) {
        roomShape.moveTo(point.x / 100, point.y / 100);
      } else {
        roomShape.lineTo(point.x / 100, point.y / 100);
      }
    }
    // 生成房间形状几何体
    let roomShapeGeometry = new THREE.ShapeGeometry(roomShape);
    // 旋转几何体
    roomShapeGeometry.rotateX(-Math.PI / 2);
    this.geometry = roomShapeGeometry;
    this.material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      side: THREE.DoubleSide,
    });

    if (this.isTop) {
      this.position.y = 2.8;
    } else {
      this.position.y = 0;
    }
  }
}
