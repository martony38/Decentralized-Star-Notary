import React, { Component } from "react";
import { DrizzleContext } from "drizzle-react";
import PropTypes from "prop-types";
import {
  Title,
  Box,
  Control,
  Field,
  Label,
  Input,
  Button,
  FieldBody,
  FieldLabel
} from "bloomer";

class DrizzleConnectedClaimStar extends Component {
  state = {
    starName: "",
    starStory: "",
    starDec: "",
    starMag: "",
    starRa: ""
  };

  formatCoordinates(coordinates) {
    switch (coordinates.length) {
      case 5:
        return "dec_00" + coordinates;
      case 6:
        return "dec_0" + coordinates;
      default:
        return "dec_" + coordinates;
    }
  }

  claimStar = () => {
    const { starName, starStory, starDec, starMag, starRa } = this.state;
    const { createStar, account, toggleModal } = this.props;

    const dec = this.formatCoordinates(Number(starDec).toFixed(3));
    const mag = this.formatCoordinates(Number(starMag).toFixed(3));
    const ra = this.formatCoordinates(Number(starRa).toFixed(3));

    const stackId = createStar.cacheSend(starName, starStory, dec, mag, ra, {
      from: account
    });

    toggleModal(stackId);
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    const { starName, starStory, starDec, starMag, starRa } = this.state;

    let disabled = false;
    let starDecClass = "";
    let starMagClass = "";
    let starRaClass = "";
    let errorDec = "";
    let errorMag = "";
    let errorRa = "";

    if (
      starName === "" ||
      starStory === "" ||
      starDec === "" ||
      starMag === "" ||
      starRa === ""
    ) {
      disabled = true;
    }

    if (starDec !== "" && !/(^\d{1,3}[.]\d{0,}$|^\d{1,3}$)/.test(starDec)) {
      starDecClass = "is-danger";
      errorDec =
        "Coordinates must be a number between 0 and 999.999 (rounded to 3 digits after the decimal point)";
      disabled = true;
    }

    if (starMag !== "" && !/(^\d{1,3}[.]\d{0,}$|^\d{1,3}$)/.test(starMag)) {
      starMagClass = "is-danger";
      errorMag =
        "Coordinates must be a number between 0 and 999.999 (rounded to 3 digits after the decimal point)";
      disabled = true;
    }

    if (starRa !== "" && !/(^\d{1,3}[.]\d{0,}$|^\d{1,3}$)/.test(starRa)) {
      starRaClass = "is-danger";
      errorRa =
        "Coordinates must be a number between 0 and 999.999 (rounded to 3 digits after the decimal point)";
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

        <Field isHorizontal>
          <FieldLabel isSize="small">
            <Label>Declination:</Label>
          </FieldLabel>
          <FieldBody>
            <Field>
              <Control>
                <Input
                  type="text"
                  placeholder="100.100"
                  name="starDec"
                  value={starDec}
                  onChange={this.handleChange}
                  className={starDecClass}
                />
              </Control>
              {errorDec !== "" && <p className="help is-danger">{errorDec}</p>}
            </Field>
          </FieldBody>
        </Field>

        <Field isHorizontal>
          <FieldLabel isSize="small">
            <Label>Magnitude:</Label>
          </FieldLabel>
          <FieldBody>
            <Field>
              <Control>
                <Input
                  type="text"
                  placeholder="100.100"
                  name="starMag"
                  value={starMag}
                  onChange={this.handleChange}
                  className={starMagClass}
                />
              </Control>
              {errorMag !== "" && <p className="help is-danger">{errorMag}</p>}
            </Field>
          </FieldBody>
        </Field>

        <Field isHorizontal>
          <FieldLabel isSize="small">
            <Label>Right Ascension:</Label>
          </FieldLabel>
          <FieldBody>
            <Field>
              <Control>
                <Input
                  type="text"
                  placeholder="100.100"
                  name="starRa"
                  value={starRa}
                  onChange={this.handleChange}
                  className={starRaClass}
                />
              </Control>
              {errorRa !== "" && <p className="help is-danger">{errorRa}</p>}
            </Field>
          </FieldBody>
        </Field>

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
