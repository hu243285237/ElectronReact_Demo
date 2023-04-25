import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';

/**
 * 初始化 vtk 的渲染和交互
 * @param element div 元素或 div 元素的 id
 * @returns 初始化成功时返回渲染器和渲染窗口
 */
export function initVtk(
  element: HTMLDivElement | string
): { renderer: vtkRenderer; renderWindow: vtkRenderWindow } | void {
  // 设置 renderer 和窗口视图
  const renderer = vtkRenderer.newInstance({ background: [0.2, 0.3, 0.4] });
  const renderWindow = vtkRenderWindow.newInstance();
  renderWindow.addRenderer(renderer);
  const openGLRenderWindow = vtkOpenGLRenderWindow.newInstance();
  renderWindow.addView(openGLRenderWindow);
  const container =
    typeof element === 'string'
      ? (document.getElementById(element) as HTMLDivElement)
      : element;
  if (!container) {
    console.error('error element id');
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
  return { renderer, renderWindow };
}
