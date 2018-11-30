import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { DrizzleContext } from "drizzle-react";
import {
  Title,
  Box,
  Control,
  Field,
  Label,
  Input,
  Button,
  FieldBody
} from "bloomer";
import StarInfo from "./StarInfo";
import StarCoordinates from "./StarCoordinates";

class FindStar extends Component {
  state = {
    dec: "",
    mag: "",
    ra: "",
    starId: null,
    starIdHash: "",
    showTokenId: false,
    showCoordinates: false
  };

  toggleTokenId = () => {
    this.setState(prevState => ({ showTokenId: !prevState.showTokenId }));
  };

  toggleCoordinates = () => {
    this.setState(prevState => ({
      showCoordinates: !prevState.showCoordinates
    }));
  };

  handleSubmit = () => {
    this.setState({ starId: this.state.starIdHash });
  };

  handleChange = e => {
    const { numberToHex } = this.props.utils;
    const { dec, mag, ra } = this.state;

    if (e.target.value === "") {
      this.setState({ starIdHash: "" });
    } else {
      let input;

      if (e.target.name === "inputId") {
        // Check input is a number
        if (/^\d*$/.test(e.target.value)) {
          input = numberToHex(e.target.value);
        }
      } else {
        input = e.target.value;
      }

      if (/(^0{0,1}$|^(0x|0X)[0-9a-fA-F]{0,64}$)/.test(input)) {
        // Empty coordinates input fields if new hash does not correspond to
        // coordinates.
        if (this.coordinatesToHash({ dec, mag, ra }) !== input) {
          this.setState({ dec: "", mag: "", ra: "" });
        }

        this.setState({ starIdHash: input });
      }
    }
  };

  setCoordinates = (name, value) => {
    this.setState({
      [name]: value,
      starIdHash: this.coordinatesToHash({ ...this.state, [name]: value })
    });
  };

  coordinatesToHash = ({ dec, mag, ra }) => {
    const { padLeft, numberToHex, sha3 } = this.props.utils;

    const hexCoordinates =
      "0x" +
      padLeft(numberToHex(dec).slice(2), 6) +
      padLeft(numberToHex(mag).slice(2), 6) +
      padLeft(numberToHex(ra).slice(2), 6);

    return sha3(hexCoordinates);
  };

  render() {
    const {
      starId,
      starIdHash,
      dec,
      mag,
      ra,
      showTokenId,
      showCoordinates
    } = this.state;
    const {
      toggleModal,
      utils: { hexToNumberString }
    } = this.props;

    let disabled = false;
    //let error = null;

    if (starIdHash === "") {
      disabled = true;
    } else {
      if (!/^(0x|0X)[0-9a-fA-F]{64}$/.test(starIdHash)) {
        disabled = true;
        //error = "Star Id hash is not valid";
      }
    }

    return (
      <Box style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            flexDirection: "column",
            justifyContent: "flex-end",
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem"
          }}
        >
          {!showTokenId && (
            <Button
              className="is-rounded"
              style={{ margin: "0 0 0.5rem 0" }}
              isSize="small"
              isColor="dark"
              onClick={this.toggleTokenId}
            >
              by Star ID
            </Button>
          )}
          {!showCoordinates && (
            <Button
              className="is-rounded"
              isSize="small"
              isColor="dark"
              onClick={this.toggleCoordinates}
            >
              by Coordinates
            </Button>
          )}
        </div>

        <Title>Find a Star</Title>

        {showTokenId && (
          <Field>
            <Label>By star token ID:</Label>
            <FieldBody>
              <Field hasAddons>
                <Control isExpanded>
                  <Input
                    name="inputId"
                    isSize="small"
                    type="text"
                    maxLength="78"
                    className={disabled && starIdHash ? "is-danger" : ""}
                    placeholder={hexToNumberString(
                      this.coordinatesToHash({ dec, mag, ra })
                    )}
                    onChange={this.handleChange}
                    value={hexToNumberString(starIdHash)}
                  />
                </Control>
                <Control>
                  <Button
                    isSize="small"
                    style={{ backgroundColor: "#e5e5e5" }}
                    onClick={this.toggleTokenId}
                  >
                    Hide
                  </Button>
                </Control>
              </Field>
            </FieldBody>
            {disabled && starIdHash && (
              <p className="help is-danger">Token Id not valid</p>
            )}
          </Field>
        )}

        <Field>
          <Label>By Hash:</Label>
          <Control>
            <Input
              name="starIdHash"
              isSize="small"
              type="text"
              className={disabled && starIdHash ? "is-danger" : ""}
              placeholder={this.coordinatesToHash({ dec, mag, ra })}
              onChange={this.handleChange}
              value={starIdHash}
            />
          </Control>
          {disabled && starIdHash && (
            <p className="help is-danger">Hash not valid</p>
          )}
        </Field>

        {showCoordinates && (
          <Fragment>
            <Label>By Coordinates:</Label>
            <div style={{ position: "relative" }}>
              {showCoordinates && (
                <Button
                  style={{
                    position: "absolute",
                    top: "-1.75rem",
                    right: 0,
                    borderBottomRightRadius: 0,
                    borderBottomLeftRadius: 0,
                    backgroundColor: "#e5e5e5",
                    borderColor: "transparent"
                  }}
                  isSize="small"
                  onClick={this.toggleCoordinates}
                >
                  Hide
                </Button>
              )}
            </div>
            <StarCoordinates
              style={{ borderTopRightRadius: 0 }}
              setCoordinates={this.setCoordinates}
              dec={dec}
              mag={mag}
              ra={ra}
            />
          </Fragment>
        )}

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
    numberToHex: PropTypes.func.isRequired,
    sha3: PropTypes.func.isRequired
  })
};

export default FindStar;
