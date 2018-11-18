import React, { Component, Fragment } from "react";
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

class TransactionModal extends Component {
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
              {status}
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
        <ModalClose onClick={toggleActive} />
      </Modal>
    );
  }
}

TransactionModal.propTypes = {
  txHash: PropTypes.string,
  transaction: PropTypes.object,
  toggleActive: PropTypes.func.isRequired
};

export default TransactionModal;
