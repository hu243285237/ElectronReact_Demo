import * as BABYLON from 'babylonjs';

export function init() {
  // 创建场景和相机
  const canvas = document.getElementById('render-canvas');
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera(
    'Camera',
    -Math.PI / 2,
    Math.PI / 2,
    10,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light = new BABYLON.HemisphericLight(
    'light',
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 0.7;

  // Our built-in 'sphere' shape.
  const sphere = BABYLON.MeshBuilder.CreateSphere(
    'sphere',
    { diameter: 2, segments: 32 },
    scene
  );
  sphere.useVertexColors = true;

  // Move the sphere upward 1/2 its height
  sphere.position.y = 1;

  let sphereVertCount = sphere.getTotalVertices();
  let sphereColors = [];
  for (let i = 0; i < sphereVertCount; i++) {
    sphereColors.push(0, 1, 0, 1);
  }
  sphere.setVerticesData(BABYLON.VertexBuffer.ColorKind, sphereColors);

  const box = BABYLON.MeshBuilder.CreateBox('box', { size: 2 }, scene);
  box.position = new BABYLON.Vector3(1, 0, 1);
  box.useVertexColors = true;

  let boxVertCount = box.getTotalVertices();
  let boxColors = [];
  for (let i = 0; i < boxVertCount; i++) {
    boxColors.push(1, 0, 0, 1);
  }
  box.setVerticesData(BABYLON.VertexBuffer.ColorKind, boxColors);

  let sphereCSG = BABYLON.CSG.FromMesh(sphere);
  let boxCSG = BABYLON.CSG.FromMesh(box);

  let booleanCSG = sphereCSG.subtract(boxCSG);

  let newMesh = booleanCSG.toMesh('newMesh', null, scene);

  sphere.visibility = false;
  box.visibility = false;

  // 运行引擎
  engine.runRenderLoop(function () {
    scene.render();
  });

  // 当窗口大小发生变化时调整画布大小
  window.addEventListener('resize', function () {
    engine.resize();
  });
}
