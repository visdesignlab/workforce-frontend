import React from 'react';
import ReactDOM from 'react-dom';
import SimpleTable from './SimpleTable';

export function SimpleTableCreator(
  node: Element,
  rows: any
) {

  ReactDOM.render(<SimpleTable rows={rows}/>, node);
}
