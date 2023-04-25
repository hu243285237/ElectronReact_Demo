import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkDataSet from '@kitware/vtk.js/Common/DataModel/DataSet';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import {
  ColorMode,
  ScalarMode,
} from '@kitware/vtk.js/Rendering/Core/Mapper/Constants';

/**
 * 获取时间步长
 * @param dataset 数据集
 * @returns 返回时间步长
 */
export function getDataTimeStep(dataset: vtkDataSet): number | null {
  const arr = dataset.getFieldData().getArrayByName('TimeValue');
  return arr && arr.getData()[0];
}

/**
 * 设置演员当前的数据集
 * @param actor 要设置的演员
 * @param dataset 数据集
 */
export function setVisibleDataset(actor: vtkActor, dataset: vtkDataSet): void {
  const mapper = actor.getMapper();
  mapper?.setInputData(dataset);
}

/**
 * 设置演员的颜色映射表
 * @param actor 要设置的演员
 */
export function setLookupTable(actor: vtkActor): void {
  const mapper = actor.getMapper();
  const inputData = mapper?.getInputData() as vtkDataSet;
  const pointData = inputData.getPointData();
  let scalars = pointData.getScalars();
  let arrayName = '';
  let colorMode = ColorMode.DEFAULT;
  let scalarMode = ScalarMode.DEFAULT;
  if (!scalars) {
    try {
      console.log(
        'getScalars equal null, try to use getArrays get scalars data'
      );
      const arrays = pointData.getArrays()[0];
      if (!arrays) {
        console.warn(`this actor don't have any scalars data`);
        return;
      }
      arrayName = arrays.getName();
      scalars = arrays;
      colorMode = ColorMode.MAP_SCALARS;
      scalarMode = ScalarMode.USE_POINT_FIELD_DATA;
    } catch (e: any) {
      console.error(e);
    }
  }
  const lookupTable = vtkColorTransferFunction.newInstance();
  const dataRange = scalars ? scalars.getRange() : [0, 1];
  if (dataRange[0] === dataRange[1]) {
    console.warn(
      `this actor get same scalar range, both equal ${dataRange[0]}`
    );
  }
  const preset = vtkColorMaps.getPresetByName('Cool to Warm');
  lookupTable.applyColorMap(preset);
  lookupTable.setMappingRange(dataRange[0], dataRange[1]);
  lookupTable.updateRange();
  mapper?.set({
    colorMode,
    scalarMode,
    lookupTable,
    interpolateScalarsBeforeMapping: false,
    useLookupTableScalarRange: true,
    scalarVisibility: true,
    colorByArrayName: arrayName,
  });
}

/**
 * 播放序列数据集
 * @param actor 播放的演员
 * @param seriesDataset 演员的序列数据集
 * @param ms 执行时间间隔
 * @param callback 执行回调函数
 * @returns 返回定时器
 */
export function playSeriesDataset(
  actor: vtkActor,
  seriesDataset: Array<vtkDataSet>,
  ms: number,
  callback: Function
): NodeJS.Timer {
  let index = 0;
  return setInterval(() => {
    setVisibleDataset(actor, seriesDataset[index++]);
    index === seriesDataset.length && (index = 0);
    callback();
  }, ms);
}
