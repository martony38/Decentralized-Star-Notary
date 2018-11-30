import React from "react";
import {
  Modal,
  ModalBackground,
  ModalContent,
  Message,
  MessageHeader,
  MessageBody
} from "bloomer";

const NoConnection = () => (
  <Modal isActive>
    <ModalBackground />
    <ModalContent>
      <Message>
        <MessageHeader>
          <p>No account detected</p>
        </MessageHeader>
        <MessageBody>
          <p>
            This browser has no connection to the Ethereum network. Make sure
            your browser is connected to the Rinkeby test network and you are
            logged in your account. Please use the Chrome/FireFox extension{" "}
            <a
              href="https://metamask.io/"
              target="_blank"
              rel="noopener noreferrer"
            >
              MetaMask
            </a>
            {/*, or dedicated Ethereum browsers{" "}
            <a
              href="https://electronjs.org/apps/mist"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mist
            </a>{" "}
            or{" "}
            <a
              href="https://www.parity.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              Parity
            </a>*/}
            .
          </p>
        </MessageBody>
      </Message>
    </ModalContent>
  </Modal>
);

export default NoConnection;
