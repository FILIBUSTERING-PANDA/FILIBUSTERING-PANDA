import { LOGIN_SUCCESS, LOGIN_FAIL, LOGIN, TOGGLE_LOGIN_MODAL } from 'constants/ActionTypes.js';
import { baseRef, FIREBASE_TIMESTAMP } from 'actions/firebaseVars.js';

export function checkAuth() {
  return (dispatch) => {
    const authData = baseRef.getAuth();
    if (authData) {
      const displayName = authData[authData.provider].displayName;
      dispatch(_loginSuccess(authData.uid, displayName));
    }
  };
}

export function toggleLoginModal() {
  return {
    type: TOGGLE_LOGIN_MODAL
  };
}

export function login(provider) {
  return (dispatch) => {
    dispatch(_loggingIn());

    baseRef.authWithOAuthPopup(provider, (error, authData) => {
      if (error) {
        dispatch(_loginFailure(error));
      } else {
        _loginOrSignupUser(authData, dispatch);
      }
    });
  };
}

function _loginOrSignupUser(authData, dispatch) {
  baseRef.child('users').child(authData.uid).once('value', (snapshot) => {
    const displayName = authData[authData.provider].displayName;

    if (!snapshot.exists()) {
      baseRef.child('users').child(authData.uid).set({
        createdAt: FIREBASE_TIMESTAMP,
        updatedAt: FIREBASE_TIMESTAMP,
        authProvider: authData.provider,
        displayName: displayName
      });
    } else {
      baseRef.child('users').child(authData.uid).update({
        updatedAt: FIREBASE_TIMESTAMP
      });
    }
    dispatch(_loginSuccess(authData.uid, displayName));
  });
}

function _loggingIn() {
  return {
    type: LOGIN
  };
}

function _loginSuccess(uid, displayName) {
  return {
    type: LOGIN_SUCCESS,
    payload: { uid, displayName }
  };
}

function _loginFailure(error) {
  /* eslint no-console: [0] */
  console.error(error);
  return {
    type: LOGIN_FAIL,
    payload: {...error }
  };
}