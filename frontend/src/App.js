import React, { Component } from "react";
import { DrizzleContext } from "drizzle-react";
import "bulma/css/bulma.css";
import {
  Hero,
  HeroBody,
  Container,
  Title,
  Subtitle,
  Section,
  Columns,
  Column,
  Level,
  Modal,
  ModalBackground,
  ModalContent,
  Message,
  MessageHeader,
  MessageBody
} from "bloomer";
import FindStar from "./components/FindStar";
import ClaimStar from "./components/ClaimStar";
import TxModal from "./components/TxModal";
import Credits from "./components/Credits";
import CurrentAccount from "./components/CurrentAccount";

class DrizzleConnectedApp extends Component {
  state = {
    showModal: false,
    stackId: null
  };

  componentDidMount() {
    const { provider, dispatch } = this.props;

    if (provider.isMetaMask) {
      // Add callback that updates drizzle store when user changes account
      // (see https://ethereum.stackexchange.com/questions/42768/how-can-i-detect-change-in-account-in-metamask)
      provider.publicConfigStore.on("update", ({ selectedAddress }) => {
        dispatch({ type: "ACCOUNTS_FETCHED", accounts: [selectedAddress] });
      });
    }
  }

  toggleModal = stackId => {
    this.setState(prevState => ({
      showModal: !prevState.showModal,
      stackId
    }));
  };

  render() {
    const { utils } = this.props;
    const { showModal, stackId } = this.state;

    return (
      <div>
        <Hero isColor="dark" isBold isSize="small">
          <HeroBody>
            <Container>
              <Title>Star Notary 3.0</Title>
              <Subtitle>
                The marketplace for stars: find stars, buy and sell stars or
                claim new ones.
              </Subtitle>
            </Container>
          </HeroBody>
        </Hero>
        <Section>
          <Container>
            <Level>
              <CurrentAccount />
            </Level>
            <Columns>
              <Column>
                <FindStar toggleModal={this.toggleModal} utils={utils} />
              </Column>
              <Column>
                <ClaimStar toggleModal={this.toggleModal} />
              </Column>
            </Columns>
          </Container>
        </Section>
        <Credits />
        {showModal && (
          <TxModal stackId={stackId} toggleActive={this.toggleModal} />
        )}
      </div>
    );
  }
}

const App = () => (
  <DrizzleContext.Consumer>
    {drizzleContext => {
      const { drizzle, drizzleState, initialized } = drizzleContext;

      if (!initialized) {
        if (!drizzleState || drizzleState.web3.status === "failed") {
          return (
            // Display a web3 warning.
            <Modal isActive>
              <ModalBackground />
              <ModalContent>
                <Message>
                  <MessageHeader>
                    <p>No connection to the Ethereum network</p>
                  </MessageHeader>
                  <MessageBody>
                    <p>
                      This browser has no connection to the Ethereum network.
                      Please use the Chrome/FireFox extension MetaMask, or
                      dedicated Ethereum browsers Mist or Parity.
                    </p>
                  </MessageBody>
                </Message>
              </ModalContent>
            </Modal>
          );
        }
        return (
          // Display a loading indicator.
          <Modal isActive>
            <ModalBackground />
            <ModalContent>
              <Message>
                <MessageHeader>
                  <p>Loading dapp...</p>
                </MessageHeader>
                <MessageBody>
                  <p>Connecting to the Ethereum network...</p>
                </MessageBody>
              </Message>
            </ModalContent>
          </Modal>
        );
      }

      // Load the dapp.
      return (
        <DrizzleConnectedApp
          provider={drizzle.web3.currentProvider}
          utils={drizzle.web3.utils}
          dispatch={drizzle.store.dispatch}
        />
      );
    }}
  </DrizzleContext.Consumer>
);

export default App;
