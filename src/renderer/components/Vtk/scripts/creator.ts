import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkScalarBarActor from '@kitware/vtk.js/Rendering/Core/ScalarBarActor';
import vtkLookupTable from '@kitware/vtk.js/Common/Core/LookupTable';

/**
 * 创建圆锥演员
 * @returns 返回圆锥演员
 */
export function createConeActor(): vtkActor {
  const coneSource = vtkConeSource.newInstance({ height: 1.0 });
  const mapper = vtkMapper.newInstance();
  mapper.setInputConnection(coneSource.getOutputPort());
  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);
  return actor;
}

/**
 * 创建颜色标尺
 * @param {vtkActor} actor 对应的演员
 * @returns 返回颜色标尺演员
 */
export function createScalarBar(actor: vtkActor): vtkScalarBarActor | void {
  const mapper = actor.getMapper();
  if (!mapper) {
    console.warn(`can't get mapper when create scalarBar`);
    return;
  }
  const scalarBarActor = vtkScalarBarActor.newInstance();
  const lookupTable = mapper.getLookupTable() as vtkLookupTable;
  if (!lookupTable) {
    console.warn(`can't get lookupTable when create scalarBar`);
  }
  scalarBarActor.setScalarsToColors(lookupTable);
  return scalarBarActor;
}
