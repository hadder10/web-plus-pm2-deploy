import React from "react";
import { Route, Link } from "react-router-dom";
import logoPath from "../images/logo.svg";

function Header({ onSignOut, email }) {
  function handleSignOut() {
    onSignOut();
  }
  return (
    <header className="header page__section">
      <img
        src={logoPath}
        alt="Логотип проекта Mesto"
        className="logo header__logo"
      />
      <Route exact path="/">
        <div className="header__wrapper">
          <p className="header__user">{email}</p>
          <button className="header__logout" onClick={handleSignOut}>
            Выйти
          </button>
        </div>
      </Route>
    </header>
  );
}

export default Header;
