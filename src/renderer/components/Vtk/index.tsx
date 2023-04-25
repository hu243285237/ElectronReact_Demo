import { RefObject, useEffect, useRef } from 'react';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkDataSet from '@kitware/vtk.js/Common/DataModel/DataSet';
import {
  initVtk,
  loadSeriesVtpFile,
  playSeriesDataset,
  setLookupTable,
  createScalarBar,
  loadVtkFile,
  loadVtpFile,
} from './scripts';
import { VtkFileType } from '@/utils/enum';

let timer: NodeJS.Timer;

interface Props {
  fileType: VtkFileType;
  url: string | string[];
}

export default function (props: Props) {
  const { fileType, url } = props;
  const renderRef: RefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    init();
    return () => {
      clearInterval(timer);
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
    switch (fileType) {
      case VtkFileType.VTK:
        if (typeof url === 'string') {
          const res = await loadVtkFile(url);
          if (res) {
            actor = res;
          }
        } else {
          // todo: loadSeriesVtkFile
        }
        break;
      case VtkFileType.VTP:
        if (typeof url === 'string') {
          const res = await loadVtpFile(url);
          if (res) {
            actor = res;
          }
        } else {
          const res = await loadSeriesVtpFile(url);
          if (res) {
            actor = res.actor;
            seriesDataset = res.seriesDataset;
          }
        }
    }

    if (actor) {
      // 播放序列集
      if (seriesDataset.length) {
        timer = playSeriesDataset(actor, seriesDataset, 300, () => {
          renderer.resetCamera();
          renderWindow.render();
        });
      }
      // // 设置颜色映射
      setLookupTable(actor);
      // // 创建颜色标尺
      const scalarBar = createScalarBar(actor);
      scalarBar && renderer.addActor(scalarBar);
      // 将演员加载进场景并渲染
      renderer.addActor(actor);
      renderer.resetCamera();
      renderWindow.render();
    }
  };

  return <div ref={renderRef} />;
}
