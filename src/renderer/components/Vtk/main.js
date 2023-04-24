import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';
import vtkPolyDataReader from '@kitware/vtk.js/IO/Legacy/PolyDataReader';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkScalarBarActor from '@kitware/vtk.js/Rendering/Core/ScalarBarActor';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import {
  ColorMode,
  ScalarMode,
} from '@kitware/vtk.js/Rendering/Core/Mapper/Constants';
import vtkHttpDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';

import vtkFileUrl from '../../../../assets/vtk/bunny.vtk';
import vtpFileUrl from '../../../../assets/vtp/earth.vtp';

const { fetchBinary } = vtkHttpDataAccessHelper;

/**
 * vtkjs 初始化
 */
async function init() {
  // 设置 renderer 和窗口视图
  const renderer = vtkRenderer.newInstance({ background: [0.2, 0.3, 0.4] });
  const renderWindow = vtkRenderWindow.newInstance();
  renderWindow.addRenderer(renderer);
  const openGLRenderWindow = vtkOpenGLRenderWindow.newInstance();
  renderWindow.addView(openGLRenderWindow);
  const container = document.getElementById('render-container');
  if (!container) {
    console.error('error render element id');
    return;
  }
  openGLRenderWindow.setContainer(container);
  const { width, height } = container.getBoundingClientRect();
  openGLRenderWindow.setSize(width, height);

  // 设置交互方式
  const interactor = vtkRenderWindowInteractor.newInstance();
  interactor.setView(openGLRenderWindow);
  interactor.initialize();
  interactor.bindEvents(container);
  interactor.setInteractorStyle(
    vtkInteractorStyleTrackballCamera.newInstance()
  );

  // 创建圆锥演员
  // const coneActor = createConeActor();
  // renderer.addActor(coneActor);

  // 加载序列集
  const actor = vtkActor.newInstance();
  const mapper = vtkMapper.newInstance();
  actor.setMapper(mapper);
  const data = await loadTimeSeries();
  const timeSeriesData = data.filter((ds) => getDataTimeStep(ds) !== null);
  timeSeriesData.sort((a, b) => getDataTimeStep(a) - getDataTimeStep(b));
  setVisibleDataset(actor, timeSeriesData[0]);
  renderer.addActor(actor);
  renderer.resetCamera();
  renderWindow.render();

  let index = 0;
  setInterval(() => {
    setVisibleDataset(actor, timeSeriesData[index++]);
    renderer.resetCamera();
    renderWindow.render();
    if (index === timeSeriesData.length) index = 0;
  }, 500);

  // 加载 vtk 文件
  // const actor = await loadVtkFile(vtkFileUrl);
  // renderer.addActor(actor);

  // 加载 vtp 文件
  // const actor = await loadVtpFile(vtpFileUrl);
  // renderer.addActor(actor);

  // 设置颜色映射
  setLookupTable(actor);

  // 创建颜色标尺
  const scalarBar = createScalarBar(actor.getMapper());
  renderer.addActor(scalarBar);

  // 重置摄像机并渲染
  renderer.resetCamera();
  renderWindow.render();
}

/**
 * 创建圆锥演员
 * @returns 返回圆锥演员
 */
function createConeActor() {
  const coneSource = vtkConeSource.newInstance({ height: 1.0 });
  const mapper = vtkMapper.newInstance();
  mapper.setInputConnection(coneSource.getOutputPort());
  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);
  return actor;
}

/**
 * 创建颜色标尺
 * @param {vtkMapper} mapper 对应的映射器
 * @returns 返回标尺演员
 */
function createScalarBar(mapper) {
  const scalarBarActor = vtkScalarBarActor.newInstance();
  scalarBarActor.setScalarsToColors(mapper.getLookupTable());
  return scalarBarActor;
}

/**
 * 加载 vtk 文件
 * @param {string} url vtk 文件路径地址
 * @returns 加载成功时返回 actor
 */
async function loadVtkFile(url) {
  const reader = vtkPolyDataReader.newInstance();
  return new Promise((resolve, reject) => {
    reader
      .setUrl(url)
      .then(() => {
        const source = reader.getOutputData(0);
        const mapper = vtkMapper.newInstance();
        const actor = vtkActor.newInstance();
        actor.setMapper(mapper);
        mapper.setInputData(source);
        resolve(actor);
      })
      .catch(reject);
  });
}

/**
 * 加载 vtp 文件
 * @param {string} url vtp 文件路径地址
 * @returns 加载成功时返回 actor
 */
async function loadVtpFile(url) {
  const reader = vtkXMLPolyDataReader.newInstance();
  return new Promise((resolve, reject) => {
    reader
      .setUrl(url)
      .then(() => {
        const source = reader.getOutputData(0);
        const mapper = vtkMapper.newInstance();
        const actor = vtkActor.newInstance();
        actor.setMapper(mapper);
        mapper.setInputData(source);
        resolve(actor);
      })
      .catch(reject);
  });
}

/**
 * 加载序列集
 * @returns dataset 集合
 */
async function loadTimeSeries() {
  const BASE_URL = 'https://kitware.github.io/vtk-js-datasets/data/vtp/can/';
  const files = [
    'can_0.vtp',
    'can_5.vtp',
    'can_10.vtp',
    'can_15.vtp',
    'can_20.vtp',
    'can_25.vtp',
    'can_30.vtp',
    'can_35.vtp',
    'can_40.vtp',
  ];
  return await Promise.all(
    files.map((filename) => {
      return new Promise((resolve, reject) => {
        fetchBinary(`${BASE_URL}/${filename}`).then((binary) => {
          const reader = vtkXMLPolyDataReader.newInstance();
          reader.parseAsArrayBuffer(binary);
          resolve(reader.getOutputData(0));
        });
      });
    })
  );
}

function setVisibleDataset(actor, ds) {
  const mapper = actor.getMapper();
  mapper.setInputData(ds);
  // renderer.resetCamera();
  // renderWindow.render();
}

function getDataTimeStep(vtkObj) {
  const arr = vtkObj.getFieldData().getArrayByName('TimeValue');
  if (arr) {
    return arr.getData()[0];
  }
  return null;
}

/**
 * 设置演员的颜色映射
 * @param {vtkActor} actor
 */
function setLookupTable(actor) {
  const mapper = actor.getMapper();
  const input = mapper.getInputData();
  const pointData = input.getPointData();
  let scalars = pointData.getScalars();
  let arrayName = '';
  let colorMode = ColorMode.DEFAULT;
  let scalarMode = ScalarMode.DEFAULT;
  if (!scalars) {
    try {
      console.log(
        'pointData.getScalars fail, try to use pointData.getArrayByName get scalars data'
      );
      const arrays = pointData.getArrays()[0];
      if (!arrays) {
        console.error('this file dont have any scalars data');
      }
      arrayName = arrays.getName();
      scalars = pointData.getArrayByName(arrayName);
      colorMode = ColorMode.MAP_SCALARS;
      scalarMode = ScalarMode.USE_POINT_FIELD_DATA;
    } catch (e) {
      console.error('get scalars error: ', e);
    }
  }
  const lookupTable = vtkColorTransferFunction.newInstance();
  const dataRange = [].concat(scalars ? scalars.getRange() : [0, 1]);
  if (dataRange[0] === dataRange[1]) {
    console.error(`setLookupTable: get same dataRange, both: ${dataRange[0]}`);
  }
  const preset = vtkColorMaps.getPresetByName('Cool to Warm');
  lookupTable.applyColorMap(preset);
  lookupTable.setMappingRange(dataRange[0], dataRange[1]);
  lookupTable.updateRange();
  mapper.set({
    colorMode,
    scalarMode,
    lookupTable,
    interpolateScalarsBeforeMapping: false,
    useLookupTableScalarRange: true,
    scalarVisibility: true,
    colorByArrayName: arrayName,
  });
}

export { init };
