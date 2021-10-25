import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PolygonEditor } from '../dist';

describe('it', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<PolygonEditor polygons={[]} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
