import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkDataSet from '@kitware/vtk.js/Common/DataModel/DataSet';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import vtkPolyDataReader from '@kitware/vtk.js/IO/Legacy/PolyDataReader';
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkHttpDataSetSeriesReader from '@kitware/vtk.js/IO/Core/HttpDataSetSeriesReader';
import vtkHttpSceneLoader from '@kitware/vtk.js/IO/Core/HttpSceneLoader';
import vtkDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper';
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
  return await loadFile(reader, url);
}

/**
 * 加载 vtp 文件
 * @param {string} url vtp 文件路径地址
 * @returns 加载成功时返回 actor
 */
export async function loadVtpFile(url: string): Promise<vtkActor | void> {
  const reader = vtkXMLPolyDataReader.newInstance();
  return await loadFile(reader, url);
}

/**
 * 使用 httpDataSet 加载文件
 * @param url 文件路径地址
 * @returns 加载成功时返回 actor
 */
export async function loadWithHttpDataSet(
  url: string
): Promise<vtkActor | void> {
  const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });
  return await loadFile(reader, url);
}

/**
 * 使用 httpDataSetSeries 加载文件
 * @param url 文件路径地址
 * @returns 加载成功时返回 actor、reader 和 timeSteps
 */
export async function loadWithHttpDataSetSeries(url: string): Promise<{
  actor: vtkActor;
  reader: vtkHttpDataSetSeriesReader;
  timeSteps: Array<number>;
} | void> {
  const reader = vtkHttpDataSetSeriesReader.newInstance({ fetchGzip: true });
  try {
    return await new Promise((resolve) => {
      reader.setUrl(url).then(() => {
        const mapper = vtkMapper.newInstance();
        const actor = vtkActor.newInstance();
        actor.setMapper(mapper);
        mapper.setInputConnection(reader.getOutputPort());
        const timeSteps = reader.getTimeSteps();
        resolve({ actor, reader, timeSteps });
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

/**
 * 加载场景
 * @param renderer 渲染器
 * @param url 场景地址
 */
export async function loadScene(
  renderer: vtkRenderer,
  url: string,
  isFileUrl: boolean
): Promise<void> {
  try {
    if (!isFileUrl) {
      const sceneImporter = vtkHttpSceneLoader.newInstance({ fetchGzip: true });
      sceneImporter.setRenderer(renderer);
      sceneImporter.setUrl(url);
      return new Promise((resolve) => {
        // @ts-ignore
        sceneImporter.onReady(() => {
          resolve();
        });
      });
    } else {
      return new Promise((resolve) => {
        fetchBinary(url).then((zipContent: ArrayBuffer) => {
          const dataAccessHelper = vtkDataAccessHelper.get('zip', {
            zipContent,
            callback: (zip: any) => {
              const sceneImporter = vtkHttpSceneLoader.newInstance({
                fetchGzip: true,
                // @ts-ignore
                dataAccessHelper,
              });
              sceneImporter.setRenderer(renderer);
              sceneImporter.setUrl('index.json');
              // @ts-ignore
              sceneImporter.onReady(() => {
                resolve();
              });
            },
          });
        });
      });
    }
  } catch (e: any) {
    console.error(e);
  }
}

/**
 * 加载单个文件通用方法
 * @param reader 使用的读取器
 * @param url 文件路径地址
 * @returns 加载成功时返回 actor
 */
async function loadFile(
  reader: vtkPolyDataReader | vtkXMLPolyDataReader | vtkHttpDataSetReader,
  url: string
): Promise<vtkActor | void> {
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
