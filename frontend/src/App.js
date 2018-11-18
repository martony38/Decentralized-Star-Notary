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
  Footer,
  Content
} from "bloomer";
import FindStar from "./components/FindStar";
import ClaimStar from "./components/ClaimStar";
import TransactionModal from "./components/TransactionModal";

class App extends Component {
  state = {
    showModal: false,
    stackId: null
  };

  toggleModal = stackId => {
    this.setState(prevState => ({
      showModal: !prevState.showModal,
      stackId
    }));
  };

  render() {
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
            <Columns>
              <Column>
                <FindStar toggleModal={this.toggleModal} />
              </Column>
              <Column>
                <DrizzleContext.Consumer>
                  {drizzleContext => {
                    const {
                      drizzle,
                      drizzleState,
                      initialized
                    } = drizzleContext;

                    if (!initialized) {
                      return "Loading...";
                    }

                    const { createStar } = drizzle.contracts.StarNotary.methods;
                    const account = drizzleState.accounts[0];

                    return (
                      <ClaimStar
                        toggleModal={this.toggleModal}
                        createStar={createStar}
                        account={account}
                      />
                    );
                  }}
                </DrizzleContext.Consumer>
              </Column>
            </Columns>
          </Container>
        </Section>
        <Footer>
          <Container>
            <Content>
              <Columns>
                <Column isSize="full">
                  <p>
                    Made by <a>ls</a>
                  </p>
                </Column>
              </Columns>
              <Content isSize="small">
                <p>
                  This work is licensed under{" "}
                  <a
                    target="_blank"
                    href="https://opensource.org/licenses/mit-license.php"
                  >
                    MIT
                  </a>
                  .
                </p>
              </Content>
            </Content>
          </Container>
        </Footer>
        {showModal && (
          <DrizzleContext.Consumer>
            {drizzleContext => {
              const { drizzleState, initialized } = drizzleContext;

              if (!initialized) {
                return "Loading...";
              }

              const { transactions, transactionStack } = drizzleState;
              const txHash = transactionStack[stackId] || null;

              return (
                <TransactionModal
                  toggleActive={this.toggleModal}
                  txHash={txHash}
                  transaction={transactions[txHash]}
                />
              );
            }}
          </DrizzleContext.Consumer>
        )}
      </div>
    );
  }
}

export default App;
