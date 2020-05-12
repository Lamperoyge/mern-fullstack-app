import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { logout } from "../../actions/auth";
import PropTypes from "prop-types";
const Navbar = ({ logout, auth: { isAuthenticated, loading } }) => {
  const authLinks = () => {
    return (
      <ul>
        <li>
          <a onClick={logout} href="!#">
            <i className="fas fa-sign-out-alt">
              <span className="hide-sm">Logout</span>
            </i>
          </a>
        </li>
      </ul>
    );
  };

  const guestList = () => {
    return (
      <ul>
        <li>
          <a href="profiles.html">Developers</a>
        </li>
        <li>
          <Link to="/register">Register</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>
    );
  };
  return (
    <nav className="navbar bg-dark">
      <h1>
        <Link to="/">
          <i className="fas fa-code"></i> DevConnector
        </Link>
      </h1>
      {!loading && (
        <Fragment>{isAuthenticated ? authLinks() : guestList()}</Fragment>
      )}
    </nav>
  );
};

Navbar.propTypes = {
  logout: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
  };
};

export default connect(mapStateToProps, { logout })(Navbar);
