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
    status: null
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
      // transaction.status fail to update when creating a new star
      // so we need to listen to the new StarCreation event and
      // update status if TxHash match
      events.forEach(event => {
        if (event.transactionHash === txHash) {
          this.setState({ status: "success" });
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

  render() {
    const { transaction, txHash, toggleActive } = this.props;
    const { status } = this.state;

    return (
      <Modal isActive>
        <ModalBackground />
        <ModalContent>
          <Message>
            <MessageHeader>
              <p>Transaction Status</p>
            </MessageHeader>
            <MessageBody>
              {status === null
                ? "waiting for transaction to be confirmed by user..."
                : status}
              {status === "success" && (
                <Fragment>
                  <p>TxHash: {txHash}</p>
                  <Button onClick={toggleActive}>Close</Button>
                </Fragment>
              )}
              {status === "canceled" && (
                <Fragment>
                  <p>Transaction canceled by user.</p>
                  <Button onClick={toggleActive}>Close</Button>
                </Fragment>
              )}
              {status === "error" && (
                <Fragment>
                  <p>Transaction failed.</p>
                  <p>{transaction.error}</p>
                  <Button onClick={toggleActive}>Close</Button>
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
      const { drizzleState, initialized } = drizzleContext;

      if (!initialized) {
        return "Loading...";
      }

      const { transactions, transactionStack } = drizzleState;
      const txHash = transactionStack[stackId] || null;
      const { events } = drizzleState.contracts.StarNotary;

      return (
        <DrizzleConnectedTxModal
          toggleActive={toggleActive}
          txHash={txHash}
          transaction={transactions[txHash]}
          events={events}
          transactions={transactions}
        />
      );
    }}
  </DrizzleContext.Consumer>
);

TxModal.propTypes = {
  stackId: PropTypes.number
};

export default TxModal;
