import React, { Component } from "react";
import PropTypes from "prop-types";
import { DrizzleContext } from "drizzle-react";
import { Title, Box, Control, Field, Label, Input, Button } from "bloomer";
import StarInfo from "./StarInfo";
import StarCoordinates from "./StarCoordinates";

class FindStar extends Component {
  state = {
    starId: null,
    input: ""
  };

  handleSubmit = () => {
    this.setState({ starId: this.state.input });
  };

  handleChange = e => {
    const input = e.target.value;
    this.setState({ input });
  };

  coordinatesToHash = ({ dec, mag, ra }) => {
    const { padLeft, toHex, sha3 } = this.props.utils;

    const hexCoordinates =
      "0x" +
      padLeft(toHex(dec).slice(2), 6) +
      padLeft(toHex(mag).slice(2), 6) +
      padLeft(toHex(ra).slice(2), 6);

    this.setState({
      input: sha3(hexCoordinates)
    });
  };

  render() {
    const { starId, input } = this.state;
    const { toggleModal } = this.props;

    let disabled = false;
    let error = "";

    if (input === "") {
      disabled = true;
    } else {
      if (!/^0x[0-9a-fA-F]{64}$/.test(input)) {
        disabled = true;
        error = "Please enter a star Id hash";
      }
    }

    return (
      <Box>
        <Title>Find a Star</Title>
        <Field>
          <Label>By star token ID (sha3 hash):</Label>
          <Control>
            <Input
              isSize="small"
              type="text"
              className={error === "" ? "" : "is-danger"}
              placeholder="0x3e27a893dc40ef8a7f0841d96639de2f58a132be5ae466d40087a2cfa83b7174"
              onChange={this.handleChange}
              value={input}
            />
          </Control>
          {error !== "" && <p className="help is-danger">{error}</p>}
        </Field>

        <Label>By star coordinates:</Label>

        <StarCoordinates setCoordinates={this.coordinatesToHash} />

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

FindStar.propTypes = {
  toggleModal: PropTypes.func.isRequired,
  utils: PropTypes.shape({
    padLeft: PropTypes.func.isRequired,
    toHex: PropTypes.func.isRequired,
    sha3: PropTypes.func.isRequired
  })
};

export default FindStar;
