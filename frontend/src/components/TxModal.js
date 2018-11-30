import React, { Component, Fragment } from "react";
import { DrizzleContext } from "drizzle-react";
import PropTypes from "prop-types";
import {
  Button,
  Modal,
  ModalBackground,
  ModalContent,
  ModalClose,
  Message,
  MessageHeader,
  MessageBody
} from "bloomer";

class DrizzleConnectedTxModal extends Component {
  state = {
    status: null,
    tokenId: null
  };

  componentDidMount() {
    const { txHash, events, transaction } = this.props;

    if (transaction && transaction.status) {
      this.setState({ status: transaction.status });
    }

    events.forEach(event => {
      if (event.transactionHash === txHash) {
        this.setState({ status: "success" });
      }
    });
  }

  componentDidUpdate(prevProps) {
    const { txHash, events, transaction, transactions } = this.props;

    if (events !== prevProps.events) {
      console.log(events);
      // transaction.status fail to update when creating a new star
      // so we need to listen to the new StarCreation event and
      // update status if TxHash match
      events.forEach(event => {
        if (event.transactionHash === txHash) {
          this.setState({ status: "success", tokenId: event.returnValues[0] });
        }
      });
    } else if (transaction !== prevProps.transaction) {
      this.setState({ status: transaction.status });
    } else if (
      transactions !== prevProps.transactions &&
      transactions.undefined &&
      transactions.undefined.status === "error" &&
      transactions.undefined.error.message.includes(
        "MetaMask Tx Signature: User denied transaction signature"
      )
    ) {
      // Update status when user cancel transaction from metamask
      this.setState({ status: "canceled" });
    }
  }

  copyToken = () => {
    const { tokenId } = this.state;
    const { toHex } = this.props;

    if (!navigator.clipboard) {
      // TODO: Display error message
      console.log("cannot copy to clipboard");
      return;
    }

    navigator.clipboard.writeText(toHex(tokenId)).then(
      function() {
        // TODO: Display success message
        console.log("Async: Copying to clipboard was successful!");
      },
      function(err) {
        // TODO: Display error message
        console.error("Async: Could not copy text: ", err);
      }
    );
  };

  render() {
    const { transaction, txHash, toggleActive, toHex } = this.props;
    const { status, tokenId } = this.state;

    return (
      <Modal isActive>
        <ModalBackground />
        <ModalContent>
          <Message
            isColor={
              !status
                ? "dark"
                : status === "pending"
                ? "info"
                : status === "success"
                ? "success"
                : status === "canceled"
                ? "warning"
                : "danger"
            }
          >
            <MessageHeader>
              {status === null ? (
                <p>Waiting for transaction confirmation...</p>
              ) : (
                <p>Transaction Status: {status}</p>
              )}
            </MessageHeader>
            <MessageBody>
              {!status && (
                <p>
                  Please use your Ethereum provider to confirm or cancel
                  transaction.
                </p>
              )}
              {status === "pending" && (
                <Fragment>
                  <p>Please wait...</p>
                </Fragment>
              )}
              {status === "success" && (
                <Fragment>
                  <p>TxHash:</p>
                  <small>{txHash}</small>
                  {/* TODO: extend modal window to display token */}
                  {tokenId && (
                    <Fragment>
                      <p>Star Token Id:</p>
                      <small>{tokenId}</small>
                      <p>Star Token Id Hash:</p>
                      <small>{toHex(tokenId)}</small>
                      <Button isColor="info" onClick={this.copyToken}>
                        Copy hash to clipboard
                      </Button>
                    </Fragment>
                  )}
                  <Button isColor="danger" onClick={toggleActive}>
                    Close
                  </Button>
                </Fragment>
              )}
              {status === "canceled" && (
                <Fragment>
                  <p>Transaction canceled by user.</p>
                  <Button isColor="danger" onClick={toggleActive}>
                    Close
                  </Button>
                </Fragment>
              )}
              {status === "error" && (
                <Fragment>
                  <p>Transaction failed.</p>
                  <p>{transaction.error}</p>
                  <Button isColor="danger" onClick={toggleActive}>
                    Close
                  </Button>
                </Fragment>
              )}
            </MessageBody>
          </Message>
        </ModalContent>
        {[null, "success", "canceled", "error"].includes(status) && (
          <ModalClose onClick={toggleActive} />
        )}
      </Modal>
    );
  }
}

DrizzleConnectedTxModal.propTypes = {
  txHash: PropTypes.string,
  transaction: PropTypes.object,
  toggleActive: PropTypes.func.isRequired,
  events: PropTypes.array,
  transactions: PropTypes.object
};

const TxModal = ({ stackId, toggleActive }) => (
  <DrizzleContext.Consumer>
    {drizzleContext => {
      const { drizzle, drizzleState, initialized } = drizzleContext;

      if (!initialized) {
        return "Loading...";
      }

      const { transactions, transactionStack } = drizzleState;
      const txHash = transactionStack[stackId] || null;
      const { events } = drizzleState.contracts.StarNotary;
      const { toHex } = drizzle.web3.utils;

      return (
        <DrizzleConnectedTxModal
          toggleActive={toggleActive}
          txHash={txHash}
          transaction={transactions[txHash]}
          events={events}
          transactions={transactions}
          toHex={toHex}
        />
      );
    }}
  </DrizzleContext.Consumer>
);

TxModal.propTypes = {
  stackId: PropTypes.number
};

export default TxModal;
