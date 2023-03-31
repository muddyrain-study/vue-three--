import * as THREE from "three";
export default function WallShaderMaterial(panorama) {
  const textureLoader = new THREE.TextureLoader();
  const point = panorama.point[0];
  const panoramaTexture = textureLoader.load(point.panoramaUrl);
  panoramaTexture.flipY = false;
  panoramaTexture.wrapS = true;
  panoramaTexture.wrapT = true;
  const center = new THREE.Vector3(point.x / 1e2, point.z / 1e2, point.y / 1e2);
  return new THREE.ShaderMaterial({
    uniforms: {
      uPanorama: {
        value: panoramaTexture,
      },
      uCenter: { value: center },
    },
    vertexShader: `
    varying vec2 vUv;
    uniform vec3 uCenter;
    varying vec3 vPosition;
    void main(){
        vUv = uv;
        vec4 modelPostion = modelMatrix * vec4(position, 1.0);
        vPosition = modelPostion.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    varying vec2 vUv;
    uniform vec3 uCenter;
    uniform sampler2D uPanorama;
    varying vec3 vPosition;  
    void main(){
        vec3 nPos = normalize(vPosition - uCenter);
        float theta = acos(nPos.y) / 3.14;
        float phi = (atan(nPos.z,nPos.x) + 3.14) / 6.28;
        phi += 0.75;
        vec4 pColor = texture2D(uPanorama , vec2(phi, theta));
        gl_FragColor = pColor;
    }
    `,
  });
}
