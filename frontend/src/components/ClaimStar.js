import React, { Component } from "react";
import { DrizzleContext } from "drizzle-react";
import PropTypes from "prop-types";
import { Title, Box, Control, Field, Label, Input, Button } from "bloomer";
import StarCoordinates from "./StarCoordinates";

class DrizzleConnectedClaimStar extends Component {
  state = {
    starName: "",
    starStory: "",
    dec: "",
    mag: "",
    ra: ""
  };

  claimStar = () => {
    const { starName, starStory, dec, mag, ra } = this.state;
    const { createStar, account, toggleModal } = this.props;

    const starDec = Number(dec);
    const starMag = Number(mag);
    const starRa = Number(ra);

    const stackId = createStar.cacheSend(
      starName,
      starStory,
      starDec,
      starMag,
      starRa,
      {
        from: account
      }
    );

    toggleModal(stackId);
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  setCoordinates = (name, value) => {
    this.setState({
      [name]: value
    });
  };

  render() {
    const { starName, starStory, dec, mag, ra } = this.state;

    let disabled = false;

    if (
      starName === "" ||
      starStory === "" ||
      dec === "" ||
      mag === "" ||
      ra === ""
    ) {
      disabled = true;
    }

    return (
      <Box>
        <Title>Claim a New Star</Title>
        <Field>
          <Label>Star Name:</Label>
          <Control>
            <Input
              type="text"
              placeholder="Awesome Star"
              name="starName"
              value={starName}
              onChange={this.handleChange}
            />
          </Control>
        </Field>
        <Field>
          <Label>Star Story:</Label>
          <Control>
            <Input
              type="text"
              placeholder="A star story..."
              name="starStory"
              value={starStory}
              onChange={this.handleChange}
            />
          </Control>
        </Field>
        <Label>Star Coordinates:</Label>
        <StarCoordinates
          setCoordinates={this.setCoordinates}
          dec={dec}
          mag={mag}
          ra={ra}
        />
        <Control>
          <Button
            isColor="primary"
            className="is-fullwidth"
            onClick={this.claimStar}
            disabled={disabled}
          >
            Claim Star
          </Button>
        </Control>
      </Box>
    );
  }
}

DrizzleConnectedClaimStar.propTypes = {
  createStar: PropTypes.func.isRequired,
  account: PropTypes.string.isRequired,
  toggleModal: PropTypes.func.isRequired
};

const ClaimStar = ({ toggleModal }) => (
  <DrizzleContext.Consumer>
    {drizzleContext => {
      const { drizzle, drizzleState, initialized } = drizzleContext;

      if (!initialized) {
        return "Loading...";
      }

      const { createStar } = drizzle.contracts.StarNotary.methods;
      const account = drizzleState.accounts[0];

      return (
        <DrizzleConnectedClaimStar
          toggleModal={toggleModal}
          createStar={createStar}
          account={account}
        />
      );
    }}
  </DrizzleContext.Consumer>
);

ClaimStar.propTypes = {
  toggleModal: PropTypes.func.isRequired
};

export default ClaimStar;
