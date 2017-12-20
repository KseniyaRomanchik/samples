import { post, get } from 'services/Api';
import AccountReducer from 'reducers/AccountReducer';
import ModalReducer from 'reducers/ModalReducer';
import { push } from 'react-router-redux';

import config from 'config';

class AccountActions {

  me() {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {

        get('/v1/profile')
          .then(userInfo => {

            dispatch(AccountReducer.actions.setUserInfo(userInfo));
            dispatch(ModalReducer.actions.hideAll());

            return resolve(userInfo);
          })
          .catch(error => reject(error.error || error));
      });
    }
  }

  signUp({ email, password }) {
    return dispatch => {
      return new Promise((resolve, reject) => {

        post('/v1/auth/registration', { email, password })
          .then(userInfo => {

            dispatch(push('/'));
            dispatch(AccountReducer.actions.setUserInfo(userInfo.result));
            dispatch(ModalReducer.actions.hideAll());
            dispatch(ModalReducer.actions.setModalState({ modalName: 'regSuccess', isOpened: true }));

            return resolve(userInfo.result);
          })
          .catch(error => reject(error.error || error));
      });
    }
  }

  logOut() {
    return dispatch => {
      return new Promise((resolve, reject) => {

        get('/v1/auth/logout')
          .then(() => {

            dispatch(push('/'));
            dispatch(AccountReducer.actions.resetUserInfo());

            return resolve();
          })
          .catch(error => reject(error.error || error));
      });
    }
  }

  logIn({ email, password }) {
    return dispatch => {
      return new Promise((resolve, reject) => {

        post('/v1/auth/login', { email, password })
          .then(userInfo => {

            dispatch(push('/'));
            dispatch(AccountReducer.actions.setUserInfo(userInfo.result));
            dispatch(ModalReducer.actions.hideAll());

            return resolve(userInfo.result);
          })
          .catch(error => reject(error.error || error));
      });
    }
  }

  confirmEmail(hash) {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {

        post('/v1/profile/confirm-email', { hash })
          .then(() => {

            dispatch(push('/'));

            if (!getState().account.get('email')) {
              dispatch(ModalReducer.actions.setLoginState(true));
            }

            return resolve();
          })
          .catch(error => reject(error.error || error));
      });
    }
  }

  sendApplication(appParams) {
    return dispatch => {
      return new Promise((resolve, reject) => {

        post('/v1/payments/prepare', appParams)
          .then(addressResponse => {

            dispatch(AccountReducer.actions.setCurrentAppAddress(addressResponse.result.address));
            dispatch(ModalReducer.actions.setModalState({ modalName: 'sendAppSuccess', isOpened: true }));

            return resolve()
          })
          .catch(error => reject(error.error || error));
      });
    }
  } 

  getTransactions() {
    return dispatch => {
      return new Promise((resolve, reject) => {

        get('/v1/payments')
          .then((txs) => resolve(txs))
          .catch(error => reject(error.error || error));
      });
    }
  }

  sendRecoveryEmail(email) {
    return dispatch => {
      return new Promise((resolve, reject) => {

        post('/v1/auth/reset-password', { email })
          .then(() => {

            dispatch(ModalReducer.actions.setModalState({ modalName: 'forgotPassword', isOpened: false }));
            dispatch(ModalReducer.actions.setModalState({ modalName: 'checkEmail', isOpened: true }));

            return resolve();
          })
          .catch(error => reject(error.error || error));
      });
    }
  }

  sendNewPassword(password, hash, key) {
    return dispatch => {
      return new Promise((resolve, reject) => {

        post('/v1/auth/set-new-password', { password, hash, key })
          .then(() => {

            dispatch(ModalReducer.actions.setModalState({ modalName: 'setNewPassword', isOpened: false }));
            dispatch(ModalReducer.actions.setModalState({ modalName: 'login', isOpened: true }));

            return resolve();
          })
          .catch(error => reject(error.error || error));
      });
    }
  }

  changePassword({ oldPassword, newPassword }) {
    return dispatch => {
      return new Promise((resolve, reject) => {

        post('/v1/profile/change-password', {
            current_password: oldPassword,
            new_password: newPassword
          })
          .then(() => resolve())
          .catch(error => reject(error.error || error));
      });
    }
  }
}

export default new AccountActions();