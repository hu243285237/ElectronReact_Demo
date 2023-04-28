import { RefObject, useEffect, useRef } from 'react';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkDataSet from '@kitware/vtk.js/Common/DataModel/DataSet';
import vtkHttpDataSetSeriesReader from '@kitware/vtk.js/IO/Core/HttpDataSetSeriesReader';
import {
  initVtk,
  loadSeriesVtpFile,
  playSeriesDataset,
  setLookupTable,
  createScalarBar,
  loadVtkFile,
  loadVtpFile,
  loadWithHttpDataSet,
  loadWithHttpDataSetSeries,
  playTimeSteps,
  loadScene,
} from './scripts';
import { VtkFileType } from '@/utils/enum';

let timers: NodeJS.Timer[] = [];

interface Props {
  url: string | string[];
  fileType?: VtkFileType;
  isSeries?: boolean;
  isHttpDataSet?: boolean;
  isScene?: boolean;
  isFileUrl?: boolean;
}

export default function (props: Props) {
  const { url, fileType, isSeries, isHttpDataSet, isScene, isFileUrl } = props;
  const renderRef: RefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    init();
    return () => {
      while (timers.length) {
        const timer = timers.pop();
        clearInterval(timer);
      }
    };
  }, []);

  /**
   * vtk 执行流程
   */
  const init = async (): Promise<void> => {
    // 初始化 vtk
    const initRes = initVtk(renderRef.current as HTMLDivElement);
    if (!initRes) return;
    const { renderer, renderWindow } = initRes;

    // 加载文件
    let actor: vtkActor | null = null;
    let seriesDataset: vtkDataSet[] = [];
    let reader: vtkHttpDataSetSeriesReader | null = null;
    let timeSteps: number[] = [];
    try {
      if (isScene) {
        const _url = url as string;
        await loadScene(renderer, _url, isFileUrl as boolean);
      } else if (isHttpDataSet) {
        const _url = url as string;
        if (isSeries) {
          const res = await loadWithHttpDataSetSeries(_url);
          if (res) {
            actor = res.actor;
            reader = res.reader;
            timeSteps = res.timeSteps;
          }
        } else {
          const res = await loadWithHttpDataSet(_url);
          res && (actor = res);
        }
      } else {
        if (isSeries) {
          const _url = url as string[];
          switch (fileType) {
            case VtkFileType.VTK:
              break;
            case VtkFileType.VTP:
              const res = await loadSeriesVtpFile(_url);
              if (res) {
                actor = res.actor;
                seriesDataset = res.seriesDataset;
              }
              break;
          }
        } else {
          const _url = url as string;
          if (fileType === VtkFileType.VTK) {
            const res = await loadVtkFile(_url);
            res && (actor = res);
          } else if (fileType === VtkFileType.VTP) {
            const res = await loadVtpFile(_url);
            res && (actor = res);
          }
        }
      }
    } catch (e: any) {
      console.error(e);
    }

    if (actor) {
      // 根据序列集播放动画
      if (seriesDataset.length) {
        const timer = playSeriesDataset(actor, seriesDataset, 300, () => {
          renderer.resetCamera();
          renderWindow.render();
        });
        timers.push(timer);
      }
      // 根据时间步数播放动画
      if (reader && timeSteps.length) {
        const timer = playTimeSteps(reader, timeSteps, 300, () => {
          renderer.resetCamera();
          renderWindow.render();
        });
        timers.push(timer);
      }
      // 设置颜色映射
      setLookupTable(actor);
      // 创建颜色标尺
      const scalarBar = createScalarBar(actor);
      scalarBar && renderer.addActor(scalarBar);
      // 将演员加载进场景并渲染
      renderer.addActor(actor);
    }
    renderer.resetCamera();
    renderWindow.render();
  };

  return <div ref={renderRef} />;
}
