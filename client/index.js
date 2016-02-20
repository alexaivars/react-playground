const React = require('react');
const ReactDOM = require('react-dom');
const Immutable = require('immutable');
const thunk = require('redux-thunk');
const { Provider, connect } = require('react-redux');
const { createStore, applyMiddleware, compose, bindActionCreators } = require('redux');
const { default:createSagaMiddleware } = require('redux-saga');
const { put, call, take } = require('redux-saga/effects');



///////////////////////////////////////
// Api
///////////////////////////////////////
const save = data => new Promise((resolve,reject) => setTimeout(() => {
  try {
    localStorage.setItem('redux-table', JSON.stringify(data))
    resolve(data);
  } catch (error) {
    reject(error);
  }
}, 500));

const load = () => new Promise((resolve,reject) => setTimeout(() => {
  try {
    const data = JSON.parse(localStorage.getItem('redux-table'));
    resolve(data);
  } catch (error) {
    reject(error);
  }
}, 500));


///////////////////////////////////////
// ACTION TYPES 
///////////////////////////////////////
const SAVE_STATE = 'SAVE_STATE';
const SAVE_STATE_PENDING = 'SAVE_STATE_PENDING';
const SAVE_STATE_SUCCESS = 'SAVE_STATE_SUCCESS';
const SAVE_STATE_FAILURE = 'SAVE_STATE_FAILURE';
const LOAD_STATE = 'LOAD_STATE';
const LOAD_STATE_PENDING = 'LOAD_STATE_PENDING';
const LOAD_STATE_SUCCESS = 'LOAD_STATE_SUCCESS';
const LOAD_STATE_FAILURE = 'LOAD_STATE_FAILURE';
const CHANGE_FIELD = 'CHANGE_FIELD';


///////////////////////////////////////
// Sagas
///////////////////////////////////////
function* saveStateSaga(getState) {
  while(true) {
    yield take(SAVE_STATE);
    const data = getState();
    try {
      yield put({ type: SAVE_STATE_PENDING});
      yield call(save, data);
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
      yield put({ type: LOAD_STATE_PENDING});
      const data = yield call(load);
      yield put({ type: LOAD_STATE_SUCCESS, data });
    } catch(error) {
      console.log(error);
      yield put({ type: LOAD_STATE_FAILURE, error });
    }
  }
}

const sagaMiddleware = createSagaMiddleware(saveStateSaga, loadStateSaga)

///////////////////////////////////////
// ACTION CREATORS
///////////////////////////////////////
const saveActionCreators = () => ({
  type: SAVE_STATE
})

const loadActionCreators = () => ({
  type: LOAD_STATE
})

const clearActionCreators = () => ({
  type: CLEAR_STATE
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
      case CHANGE_FIELD : return state.setIn(['input',action.id], action.value);
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
    value: state.getIn(['input', id], '')
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
  () => ({}),
  dispatch => ({
    action: bindActionCreators(saveActionCreators, dispatch)
  })
)(Component);

const connectLoad = (Component) => connect(
  () => ({}),
  dispatch => ({
    action: bindActionCreators(loadActionCreators, dispatch)
  })
)(Component);


///////////////////////////////////////
// Components
///////////////////////////////////////
const Button = ({action, label}) => (
  <div onClick={action}>{label}</div>
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
const StateStatus = connectStatus(Info);

const Preview = connect(
  (state) => ({
    json: JSON.stringify(state.toJS(), null, 2)
  })
)(({json}) => (
  <pre>{json}</pre>
));


///////////////////////////////////////
// Setup
///////////////////////////////////////
const store = createStore(reducer, initialState, compose(
    applyMiddleware(thunk, sagaMiddleware),
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
  )
);

ReactDOM.render(
  <Provider store={store}>
    <div>
    <form>
      <StateStatus/>
      <FirstName/>
      <LastName/>
      <SaveButton label="Save state"/>
      <LoadButton label="Load state"/>
    </form>
    <Preview/>
    </div>
  </Provider>
  ,
  document.getElementById('app')
);



