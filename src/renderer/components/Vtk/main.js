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

import vtkFileUrl from '../../../../assets/vtk/sphere.vtk';
import vtpFileUrl from '../../../../assets/vtp/test.vtp';

function init() {
  // ----------------------------------------------------------------------------
  // Standard rendering code setup
  // ----------------------------------------------------------------------------

  const renderWindow = vtkRenderWindow.newInstance();
  const renderer = vtkRenderer.newInstance({ background: [0.2, 0.3, 0.4] });
  renderWindow.addRenderer(renderer);

  // ----------------------------------------------------------------------------
  // Simple pipeline ConeSource --> Mapper --> Actor
  // ----------------------------------------------------------------------------

  const coneSource = vtkConeSource.newInstance({ height: 1.0 });

  const mapper = vtkMapper.newInstance();
  mapper.setInputConnection(coneSource.getOutputPort());

  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);

  // ----------------------------------------------------------------------------
  // Add the actor to the renderer and set the camera based on it
  // ----------------------------------------------------------------------------

  renderer.addActor(actor);
  renderer.resetCamera();

  // ----------------------------------------------------------------------------
  // Use OpenGL as the backend to view the all this
  // ----------------------------------------------------------------------------

  const openGLRenderWindow = vtkOpenGLRenderWindow.newInstance();
  renderWindow.addView(openGLRenderWindow);

  // ----------------------------------------------------------------------------
  // Create a div section to put this into
  // ----------------------------------------------------------------------------

  const container = document.getElementById('render-container');
  if (!container) return;
  openGLRenderWindow.setContainer(container);

  // ----------------------------------------------------------------------------
  // Capture size of the container and set it to the renderWindow
  // ----------------------------------------------------------------------------

  const { width, height } = container.getBoundingClientRect();
  openGLRenderWindow.setSize(width, height);

  // ----------------------------------------------------------------------------
  // Setup an interactor to handle mouse events
  // ----------------------------------------------------------------------------

  const interactor = vtkRenderWindowInteractor.newInstance();
  interactor.setView(openGLRenderWindow);
  interactor.initialize();
  interactor.bindEvents(container);

  // ----------------------------------------------------------------------------
  // Setup interactor style to use
  // ----------------------------------------------------------------------------

  interactor.setInteractorStyle(
    vtkInteractorStyleTrackballCamera.newInstance()
  );

  // 加载 vtk 文件
  function loadVtkFile(url) {
    const reader = vtkPolyDataReader.newInstance();
    reader.setUrl(url).then(() => {
      const polydata = reader.getOutputData(0);
      const mapper = vtkMapper.newInstance();
      const actor = vtkActor.newInstance();
      actor.setMapper(mapper);
      mapper.setInputData(polydata);
      renderer.addActor(actor);
      renderer.resetCamera();
      renderWindow.render();
    });
  }

  // 加载 vtp 文件
  function loadVtpFile(url) {
    const reader = vtkXMLPolyDataReader.newInstance();
    reader.setUrl(url).then(() => {
      const polydata = reader.getOutputData(0);
      const mapper = vtkMapper.newInstance();
      const actor = vtkActor.newInstance();
      actor.setMapper(mapper);
      mapper.setInputData(polydata);
      renderer.addActor(actor);
      renderer.resetCamera();
      renderWindow.render();
    });
  }

  // loadVtkFile(vtkFileUrl);
  // loadVtpFile(vtpFileUrl);
}

export { init };
