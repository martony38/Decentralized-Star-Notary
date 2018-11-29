import React, { Fragment } from "react";
import { DrizzleContext } from "drizzle-react";
import PropTypes from "prop-types";
import { LevelItem } from "bloomer";
import NoConnection from "./NoConnection";

const DrizzleConnectedCurrentAccount = ({ account }) => (
  <LevelItem className="has-text-centered">
    <div>
      {account ? (
        <Fragment>
          <strong>Current Account</strong>
          <p>{account}</p>
        </Fragment>
      ) : (
        <Fragment>
          <strong>No account detected</strong>
          <p>
            <small>
              Make sure your browser is connected to the Ethereum network and
              you are logged in your account.
            </small>
          </p>
          <NoConnection />
        </Fragment>
      )}
    </div>
  </LevelItem>
);

DrizzleConnectedCurrentAccount.propTypes = {
  account: PropTypes.string.isRequired
};

const CurrentAccount = () => (
  <DrizzleContext.Consumer>
    {drizzleContext => {
      const { drizzleState, initialized } = drizzleContext;

      if (!initialized) {
        return "Loading...";
      }

      const account = drizzleState.accounts[0];

      return <DrizzleConnectedCurrentAccount account={account} />;
    }}
  </DrizzleContext.Consumer>
);

export default CurrentAccount;
