import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import ModalActions from 'actions/ModalActions';
import AccountActions from 'actions/AccountActions';

import StringTransformer from 'services/StringTransformer';
import Validator from 'services/Validator';

class SetNewPassword extends React.Component {

  constructor() {
    super();

    this.initState = {
      password: '',
      repeatedPassword: '',
      passwordError: null,
      copmarisonError: false,
      isLoading: false
    }

    this.state = this.initState;
  }

  onCloseModal() {
    this.props.setModalState('setNewPassword', false);
  }
  
  onInputField(field, e) {

    this.setState({
      [field]: e.target.value,
      copmarisonError: false
    });

    if (this.state.passwordError && field === 'password' && Validator.validatePassword(e.target.value)) {
      this.setState({
        passwordError: null
      });
    }
  }

  onSubmitPassword(e) {

    const { password, repeatedPassword } = this.state;
    const { hash, key } = this.props.resettingQuery;

    if (!Validator.validatePassword(password)) {
      return this.setState({
        passwordError: 'Invalid password'
      });
    }

    if (password !== repeatedPassword) {
      return this.setState({
        copmarisonError: true
      });
    }

    this.setState({
      copmarisonError: false,
      passwordError: null,
      isLoading: true
    });

    this.props.sendNewPassword(password, hash, key)
    .then(() => this.setState(this.initState))
    .catch(err => this.setState({
      passwordError: err.password ? StringTransformer.capitalize(err.password) : err,
      isLoading: false
    }));
  }

  render() {

    const { password, repeatedPassword, passwordError, isLoading, copmarisonError } = this.state;
    const { isOpened } = this.props;

    return (
      isOpened ?
      <div className="modal-dialog" role="document">
        <div className="modal-content w-640">
          <div className="modal-header">
            <button 
              type="button" 
              className="modal__close" 
              onClick={ this.onCloseModal.bind(this) }
            >
              <span className="modal__closeIcon icon-close"></span>
            </button>
            <div className="modal__heading">
              <div className="modal__title">Reset Password</div>
            </div>
          </div>
          <div className="modal-body">
            <div className="form__row requ">
              <input 
                type="password" 
                className="input input-light"
                placeholder="Password"
                value={ password }
                onChange={ this.onInputField.bind(this,'password') }
              />
            </div>
            <div className="form__row requ">
              <input 
                type="password" 
                className="input input-light"
                placeholder="Repeat Password"
                value={ repeatedPassword }
                onChange={ this.onInputField.bind(this,'repeatedPassword') }
              />
            </div>
            <div className="form__note">
              <span className="attn">*</span><i>Minimum 9 symbols", "At least one letter", "At least one number</i>
            </div>
            {
              passwordError ? 
              <div className="error global">
                <div className="error__text">
                  { passwordError }
                </div>
              </div> : null
            }
            {
              copmarisonError ?
              <div className="error global">
                <div className="error__text">
                  Password are not equal
                </div>
              </div> : null
            }
          </div>
          <div className="modal-footer">
            {
              isLoading ? 
              <div 
                type="button" 
                className="btn btn-def btn-center btn-width-full btn-c-white loader loader-btn loader-s"
              ></div> :
              <button 
                onClick={ this.onSubmitPassword.bind(this) }
                className="btn btn-def btn-center btn-width-full btn-c-white"
              >Reset Password</button>
            }
          </div>
        </div>
      </div> : null
    )
  }
}

SetNewPassword.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  setModalState: PropTypes.func.isRequired,
  sendNewPassword: PropTypes.func.isRequired,
  resettingQuery: PropTypes.shape({
    hash: PropTypes.string,
    key: PropTypes.string
  })
}

export default connect(
  state => ({
    isOpened: state.modal.get('setNewPassword'),
    resettingQuery: state. routing.locationBeforeTransitions.query
  }),
  dispatch => ({
    setModalState: (modalName, state) => dispatch(ModalActions.setModalState(modalName, state)),
    sendNewPassword: (password, hash, key) => dispatch(AccountActions.sendNewPassword(password, hash, key))
  })
)(SetNewPassword);
