const React = require('react');
const ReactDOM = require('react-dom');
const Immutable = require('immutable');
const thunkMiddleware = require('redux-thunk');
const { Provider, connect } = require('react-redux');
const { createStore, applyMiddleware, compose, bindActionCreators } = require('redux');
const { default:createSagaMiddleware } = require('redux-saga');
const { put, call, take } = require('redux-saga/effects');


///////////////////////////////////////
// Api
///////////////////////////////////////
const key = 'redux-form';
const api = {
  save: data => new Promise((resolve,reject) => setTimeout(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      resolve(data);
    } catch (error) {
      reject(error);
    }
  }, 500)),
  load: () => new Promise((resolve,reject) => setTimeout(() => {
    try {
      const data = JSON.parse(localStorage.getItem(key)) || {};
      resolve(data);
    } catch (error) {
      reject(error);
    }
  }, 500)),
  delete: () => new Promise((resolve,reject) => setTimeout(() => {
    try {
      localStorage.removeItem(key);
      resolve();
    } catch (error) {
      reject(error);
    }
  }, 500)) 
}

///////////////////////////////////////
// ACTION TYPES 
///////////////////////////////////////
const MERGE_CHANGE = 'MERGE_CHANGE';
const CANCEL_CHANGE = 'CANCEL_CHANGE';
const SAVE_STATE = 'SAVE_STATE';
const SAVE_STATE_PENDING = 'SAVE_STATE_PENDING';
const SAVE_STATE_SUCCESS = 'SAVE_STATE_SUCCESS';
const SAVE_STATE_FAILURE = 'SAVE_STATE_FAILURE';
const LOAD_STATE = 'LOAD_STATE';
const LOAD_STATE_PENDING = 'LOAD_STATE_PENDING';
const LOAD_STATE_SUCCESS = 'LOAD_STATE_SUCCESS';
const LOAD_STATE_FAILURE = 'LOAD_STATE_FAILURE';
const DELETE_STATE = 'DELETE_STATE';
const DELETE_STATE_PENDING = 'DELETE_STATE_PENDING';
const DELETE_STATE_SUCCESS = 'DELETE_STATE_SUCCESS';
const DELETE_STATE_FAILURE = 'DELETE_STATE_FAILURE';
const CHANGE_FIELD = 'CHANGE_FIELD';


///////////////////////////////////////
// Sagas
///////////////////////////////////////
function* saveStateSaga(getState) {
  while(true) {
    yield take(SAVE_STATE);
    const data = getState();
    try {
      yield put({ type: SAVE_STATE_PENDING });
      yield call(api.save, data);
      yield put({ type: SAVE_STATE_SUCCESS, data });
    } catch(error) {
      yield put({ type: SAVE_STATE_FAILURE, error });
    }
  }
}


function* loadStateSaga(getState) {
  while(true) {
    yield take(LOAD_STATE);
    try {
      yield put({ type: LOAD_STATE_PENDING });
      const data = yield call(api.load);
      yield put({ type: LOAD_STATE_SUCCESS, data });
    } catch(error) {
      console.log(error);
      yield put({ type: LOAD_STATE_FAILURE, error });
    }
  }
}

function* deleteStateSaga() {
  while(true) {
    yield take(DELETE_STATE);
    try {
      yield put({ type: DELETE_STATE_PENDING });
      yield call(api.delete);
      yield put({ type: DELETE_STATE_SUCCESS });
    } catch(error) {
      yield put({ type: DELETE_STATE_FAILURE });
    }
  }
}

const sagaMiddleware = createSagaMiddleware(saveStateSaga, loadStateSaga, deleteStateSaga)

///////////////////////////////////////
// ACTION CREATORS
///////////////////////////////////////
const saveState = () => ({
  type: SAVE_STATE
})

const loadState = () => ({
  type: LOAD_STATE
})

const deleteState = () => ({
  type: DELETE_STATE
})

const mergeChange = () => ({
  type: MERGE_CHANGE
})

const cancelChange = () => ({
  type: CANCEL_CHANGE
})

const updateActionCreators = (value, id) => ({
  type: CHANGE_FIELD,
  value,
  id
})


///////////////////////////////////////
// Reducer
///////////////////////////////////////
const initialState = Immutable.Map();
const reducer = (state = Immutable.Map(), action = {}) => {
  switch(action.type) {
    default:
      case MERGE_CHANGE : return state.delete('change').mergeDeep(state.get('change'));
      case CANCEL_CHANGE : return state.delete('change');
      case CHANGE_FIELD : return state.setIn(['change', action.id], action.value);
      case LOAD_STATE_PENDING : return state.set('status', 'loading');
      case LOAD_STATE_SUCCESS : return Immutable.fromJS(action.data);
      case SAVE_STATE_PENDING : return state.set('status', 'saving');
      case SAVE_STATE_SUCCESS : return state.delete('status');
      return state;
  }
}


///////////////////////////////////////
// Redux Component Connectors
///////////////////////////////////////
const connectInput = (Component, id) => connect(
  (state) => ({
    value: state.getIn(['change', id], state.get(id, ''))
  }),
  (dispatch) => ({
    action: bindActionCreators(updateActionCreators, dispatch)
  }),
  (stateProps, dispatchProps, ownProps) => (Object.assign(
    {},
    {
      id
    },
    ownProps, 
    stateProps,
    {
      action: (value) => {
        dispatchProps.action(value, id)
      }
    }
  ))
)(Component);

const connectStatus = (Component) => connect(
  (state) => ({
    status: state.get('status')
  })
)(Component);

const connectSave = (Component) => connect(
  undefined,
  dispatch => ({
    action: bindActionCreators(saveState, dispatch)
  })
)(Component);

const connectLoad = (Component) => connect(
  undefined,
  dispatch => ({
    action: bindActionCreators(loadState, dispatch)
  })
)(Component);

const connectDelete = (Component) => connect(
  undefined,
  dispatch => ({
    action: bindActionCreators(deleteState, dispatch)
  })
)(Component);

const connectMerge = (Component) => connect(
  undefined,
  dispatch => ({
    action: bindActionCreators(mergeChange, dispatch)
  })
)(Component);

const connectCancel = (Component) => connect(
  undefined,
  dispatch => ({
    action: bindActionCreators(cancelChange, dispatch)
  })
)(Component);


///////////////////////////////////////
// React Components
///////////////////////////////////////
const Button = ({action, label}) => (
  <button type="submit" value={label} onClick={(event) => { event.preventDefault(); action() }}>{label}</button>
);

const Input = ({value, action}) => (
  <input onChange={(event) => {
    action(event.target.value) 
  }} value={value}/>
)

const Info = ({status}) => ((!status)?(
    <noscript/>
  ):(
    <div>{status}</div>
  )
);
  
const FirstName = connectInput(Input, 'first_name');
const LastName = connectInput(Input, 'last_name');
const SaveButton = connectSave(Button);
const LoadButton = connectLoad(Button);
const DeleteButton = connectDelete(Button);
const MergeButton = connectMerge(Button);
const CancelButton = connectCancel(Button);
const StateStatus = connectStatus(Info);

const Preview = connect(state => state.toJS())(state => (
  <pre>{JSON.stringify(state, null, 2)}</pre>
));


///////////////////////////////////////
// Setup
///////////////////////////////////////
const store = createStore(reducer, initialState, compose(
    applyMiddleware(thunkMiddleware, sagaMiddleware),
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
  )
);

store.dispatch(loadState());
ReactDOM.render(
  <Provider store={store}>
    <div>
    <form>
      <StateStatus/>
      <FirstName/>
      <LastName/>
      <MergeButton label="Merge change"/>
      <CancelButton label="Cancel change"/>
      <SaveButton label="Save state"/>
      <LoadButton label="Load state"/>
      <DeleteButton label="Delete state"/>
    </form>
    <Preview/>
    </div>
  </Provider>
  ,
  document.getElementById('app')
);
