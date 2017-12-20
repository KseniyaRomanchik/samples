import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import AccountActions from 'actions/AccountActions';

class ConfirmEmail extends React.Component {

    constructor() {
      super();

      this.state = {
        confirmationError: null
      }
    }

    componentDidMount() {

      const { confirmEmail, query } = this.props;

      if (query && query.hash) {

        confirmEmail(query.hash)
        .then(() => query.hash)
        .catch(err => this.setState({
            confirmationError: err.hash || err
          })
        );
      } else {
        this.setState({
          confirmationError: 'Something went wrong'
        });
      }
    }

    render() {
        return (
          <div className="section section__def">
            <div className="container">
              <h2 className="h2">
              { this.state.confirmationError || 'Email is confirmed' }
              </h2>
              {
                !this.state.confirmationError ? 
                <div className="accordion__box">
                  <div id="subscribe_info_panel" className="form__infoBox success" style={{
                    display: 'block'
                  }}>
                    <span className="form__infoTxt">Thank you for your interest. We'll keep you updated</span>
                  </div>
                </div> : null
              }
            </div>
          </div>
        );
    }
}

ConfirmEmail.propTypes = {
  query: PropTypes.shape({
    hash: PropTypes.string
  }),
  confirmEmail: PropTypes.func.isRequired
}

export default connect(
  state => ({
    query: state.routing.locationBeforeTransitions.query
  }),
  dispatch => ({
    confirmEmail: hash => dispatch(AccountActions.confirmEmail(hash))
  })
)(ConfirmEmail);