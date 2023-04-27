import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { VtkFileType } from '@/utils/enum';
import Vtk from '@/renderer/components/Vtk';

import icon from '@assets/icon.svg';
import vtkFileUrl from '@assets/vtk/bunny.vtk';
import vtpFileUrl from '@assets/vtp/earth.vtp';

import './App.scss';

const seriesVtpUrl = [
  'https://kitware.github.io/vtk-js-datasets/data/vtp/can/can_0.vtp',
  'https://kitware.github.io/vtk-js-datasets/data/vtp/can/can_5.vtp',
  'https://kitware.github.io/vtk-js-datasets/data/vtp/can/can_10.vtp',
  'https://kitware.github.io/vtk-js-datasets/data/vtp/can/can_15.vtp',
  'https://kitware.github.io/vtk-js-datasets/data/vtp/can/can_20.vtp',
  'https://kitware.github.io/vtk-js-datasets/data/vtp/can/can_25.vtp',
  'https://kitware.github.io/vtk-js-datasets/data/vtp/can/can_30.vtp',
  'https://kitware.github.io/vtk-js-datasets/data/vtp/can/can_35.vtp',
  'https://kitware.github.io/vtk-js-datasets/data/vtp/can/can_40.vtp',
];
const httpDataSetUrl = 'https://kitware.github.io/vtk-js/data/cow.vtp';
const seriesHttpDataSetUrl =
  'https://kitware.github.io/vtk-js-datasets/data/temporal';

function Hello() {
  return (
    <div className="app-container">
      <div className="Hello">
        <img width="100" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="folded hands">
              🙏
            </span>
            Donate
          </button>
        </a>
      </div>
      <ul className="vtk-container-list">
        <li className="vtk-container-item">
          <p>single .vtk file use polyDataReader</p>
          <Vtk fileType={VtkFileType.VTK} url={vtkFileUrl} />
        </li>
        <li className="vtk-container-item">
          <p>single .vtp file use XMLPolyDataReader</p>
          <Vtk fileType={VtkFileType.VTP} url={vtpFileUrl} />
        </li>
        <li className="vtk-container-item">
          <p>series .vtp file use XMLPolyDataReader and httpDataAccessHelper</p>
          <Vtk fileType={VtkFileType.VTP} url={seriesVtpUrl} isSeries />
        </li>
        <li className="vtk-container-item">
          <p>single .vtp gz file use httpDataSetReader</p>
          <Vtk url={httpDataSetUrl} isHttpDataSet />
        </li>
        <li className="vtk-container-item">
          <p>series .vtp gz file use httpDataSetReaderSeries</p>
          <Vtk url={seriesHttpDataSetUrl} isHttpDataSet isSeries />
        </li>
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
