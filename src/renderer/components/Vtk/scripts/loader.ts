import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkDataSet from '@kitware/vtk.js/Common/DataModel/DataSet';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import vtkPolyDataReader from '@kitware/vtk.js/IO/Legacy/PolyDataReader';
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';
import vtkHttpDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';

import { getDataTimeStep, setVisibleDataset } from './tool';

// @ts-ignore
const { fetchBinary } = vtkHttpDataAccessHelper;

/**
 * 加载 vtk 文件
 * @param {string} url vtk 文件路径地址
 * @returns 加载成功时返回 actor
 */
export async function loadVtkFile(url: string): Promise<vtkActor | void> {
  const reader = vtkPolyDataReader.newInstance();
  try {
    return new Promise((resolve) => {
      reader.setUrl(url).then(() => {
        const source = reader.getOutputData(0);
        const mapper = vtkMapper.newInstance();
        const actor = vtkActor.newInstance();
        actor.setMapper(mapper);
        mapper.setInputData(source);
        resolve(actor);
      });
    });
  } catch (e: any) {
    console.error(e);
  }
}

/**
 * 加载 vtp 文件
 * @param {string} url vtp 文件路径地址
 * @returns 加载成功时返回 actor
 */
export async function loadVtpFile(url: string): Promise<vtkActor | void> {
  const reader = vtkXMLPolyDataReader.newInstance();
  try {
    return new Promise((resolve) => {
      reader.setUrl(url).then(() => {
        const source = reader.getOutputData(0);
        const mapper = vtkMapper.newInstance();
        const actor = vtkActor.newInstance();
        actor.setMapper(mapper);
        mapper.setInputData(source);
        resolve(actor);
      });
    });
  } catch (e: any) {
    console.error(e);
  }
}

/**
 * 加载 vtp 序列集文件
 * @param urls vtp 序列集文件路径地址
 * @returns 加载成功时返回 actor
 */
export async function loadSeriesVtpFile(
  urls: Array<string>
): Promise<{ actor: vtkActor; seriesDataset: Array<vtkDataSet> } | void> {
  const actor = vtkActor.newInstance();
  const mapper = vtkMapper.newInstance();
  actor.setMapper(mapper);
  try {
    const datasets = (await Promise.all(
      urls.map((url) => {
        return new Promise((resolve) => {
          fetchBinary(url).then((binary: ArrayBuffer) => {
            const reader = vtkXMLPolyDataReader.newInstance();
            reader.parseAsArrayBuffer(binary);
            resolve(reader.getOutputData(0) as vtkPolyData);
          });
        });
      })
    )) as Array<vtkDataSet>;
    const seriesDataset = datasets.filter(
      (dataset: vtkDataSet) => getDataTimeStep(dataset) !== null
    );
    seriesDataset.sort(
      (a: vtkDataSet, b: vtkDataSet) =>
        (getDataTimeStep(a) as number) - (getDataTimeStep(b) as number)
    );
    setVisibleDataset(actor, seriesDataset[0]);
    return { actor, seriesDataset };
  } catch (e: any) {
    console.error(e);
  }
}
