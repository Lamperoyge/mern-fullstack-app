import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
const Alert = ({ alerts }) => {
  return alerts && alerts.length
    ? alerts.map((alert, idx) => {
        return (
          <div key={idx} className={`alert alert-${alert.alertType}`}>
            {alert.msg}
          </div>
        );
      })
    : null;
};

Alert.propTypes = {};

const mapStateToProps = (state) => {
  return {
    alerts: state.alert,
  };
};

const mapActionsToProps = (dispatch) => {
  return {};
};
export default connect(mapStateToProps, mapActionsToProps)(Alert);
