import React, { Fragment } from "react";
import { DrizzleContext } from "drizzle-react";
import PropTypes from "prop-types";
import {
  LevelItem,
  Modal,
  ModalBackground,
  ModalContent,
  Message,
  MessageBody,
  MessageHeader
} from "bloomer";

const DrizzleConnectedCurrentAccount = ({ account }) => (
  <LevelItem className="has-text-centered">
    <div>
      {account ? (
        <Fragment>
          <strong>Current Account</strong>
          <p>{account}</p>
          <small>Not the account you expected? Try reloading the page</small>
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
          <Modal isActive>
            <ModalBackground />
            <ModalContent>
              <Message>
                <MessageHeader>
                  <p>No account detected</p>
                </MessageHeader>
                <MessageBody>
                  <p>
                    This browser has no connection to the Ethereum network. Make
                    sure your browser is connected to the Ethereum network and
                    you are logged in your account. Please use the
                    Chrome/FireFox extension MetaMask, or dedicated Ethereum
                    browsers Mist or Parity.
                  </p>
                </MessageBody>
              </Message>
            </ModalContent>
          </Modal>
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
