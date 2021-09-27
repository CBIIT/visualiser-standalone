import { connect } from 'react-redux';
import { setGraphView } from './action.js';
import DataDictionary from './DataDictionary';
import React from 'react';

// const ReduxDataDictionary = (() => {
//   const mapStateToProps = state => ({
//     isGraphView: state.ddgraph.isGraphView,
//   });

//   const mapDispatchToProps = dispatch => ({
//     onSetGraphView: isGraphView => dispatch(setGraphView(isGraphView)),
//   });

//   return connect(mapStateToProps, mapDispatchToProps)(DataDictionary);
// })();

// export default ReduxDataDictionary;

const ReduxDataDictionary = (props) => {

  return(
    <DataDictionary {...props} />
  )

}

const mapStateToProps = state => ({
  isGraphView: state.ddgraph.isGraphView,
});

const mapDispatchToProps = dispatch => ({
  onSetGraphView: isGraphView => dispatch(setGraphView(isGraphView)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReduxDataDictionary);