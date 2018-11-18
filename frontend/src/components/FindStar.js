import React, { Component } from "react";
import { DrizzleContext } from "drizzle-react";
import { Title, Box, Control, Field, Label, Input, Button } from "bloomer";
import StarInfo from "./StarInfo";

class FindStar extends Component {
  state = {
    starId: null,
    input: ""
  };

  handleSubmit = () => {
    this.setState({ starId: this.state.input });
  };

  handleChange = e => {
    this.setState({ input: e.target.value });
  };

  render() {
    const { starId, input } = this.state;
    const { toggleModal } = this.props;

    let disabled = false;
    let error = "";

    if (input === "") {
      disabled = true;
    } else {
      if (!/^\d*$/.test(input)) {
        disabled = true;
        error = "only digits are allowed";
      }
    }

    return (
      <Box>
        <Title>Find a Star</Title>
        <Field>
          <Label>Star ID:</Label>
          <Control>
            <Input
              type="text"
              className={error === "" ? "" : "is-danger"}
              placeholder="Enter the star token ID"
              onChange={this.handleChange}
              value={input}
            />
          </Control>
          {error !== "" && <p className="help is-danger">{error}</p>}
        </Field>
        <Control>
          <Button
            isColor="info"
            className="is-fullwidth"
            onClick={this.handleSubmit}
            disabled={disabled}
          >
            Find Star
          </Button>
        </Control>
        {starId && (
          <DrizzleContext.Consumer>
            {drizzleContext => {
              const { drizzle, drizzleState, initialized } = drizzleContext;

              if (!initialized) {
                return "Loading...";
              }

              const {
                tokenIdToStarInfo,
                ownerOf,
                starsForSale
              } = drizzle.contracts.StarNotary.methods;
              const { StarNotary } = drizzleState.contracts;
              const account = drizzleState.accounts[0];

              return (
                <StarInfo
                  toggleModal={toggleModal}
                  starId={starId}
                  tokenIdToStarInfo={tokenIdToStarInfo}
                  ownerOf={ownerOf}
                  starsForSale={starsForSale}
                  StarNotary={StarNotary}
                  account={account}
                />
              );
            }}
          </DrizzleContext.Consumer>
        )}
      </Box>
    );
  }
}

export default FindStar;
