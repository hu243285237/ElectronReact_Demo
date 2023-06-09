import { useEffect } from 'react';
import { init } from './main';
import './index.scss';

export default function () {
  useEffect(() => {
    init();
  }, []);

  return <canvas id="render-canvas"></canvas>;
}
