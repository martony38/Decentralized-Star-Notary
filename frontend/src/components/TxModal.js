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

// TODO: Handle case when user cancel transaction from metamask

class DrizzleConnectedTxModal extends Component {
  render() {
    const { transaction, txHash, toggleActive } = this.props;

    const { status } = transaction || { status: null };

    console.log(transaction);

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
        {[null, "success", "error"].includes(status) && (
          <ModalClose onClick={toggleActive} />
        )}
      </Modal>
    );
  }
}

DrizzleConnectedTxModal.propTypes = {
  txHash: PropTypes.string,
  transaction: PropTypes.object,
  toggleActive: PropTypes.func.isRequired
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

      console.log(transactionStack);

      return (
        <DrizzleConnectedTxModal
          toggleActive={toggleActive}
          txHash={txHash}
          transaction={transactions[txHash]}
        />
      );
    }}
  </DrizzleContext.Consumer>
);

TxModal.propTypes = {
  stackId: PropTypes.number
};

export default TxModal;
