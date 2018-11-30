import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Control,
  Field,
  Label,
  Input,
  FieldBody,
  FieldLabel
} from "bloomer";

class StarCoordinates extends Component {
  state = {
    decInputErrorMsg: null,
    magInputErrorMsg: null,
    raInputErrorMsg: null
  };

  handleChange = e => {
    const { setCoordinates } = this.props;
    const input = e.target.value.replace(".", "");

    if (isNaN(Number(input)) || Number(input) < 0 || input.length > 6) {
      this.setState({
        [e.target.name +
        "InputErrorMsg"]: "Your last input was not valid and has been discarded, coordinates must be a number between 0 and 999.999 (rounded to 3 digits after the decimal point)"
      });
    } else {
      setCoordinates([e.target.name], input);
      this.setState({
        [e.target.name + "InputErrorMsg"]: null
      });
    }
  };

  displayCoords = coord => {
    if (isNaN(Number(coord))) {
      return coord;
    }

    return coord ? (Number(coord) / 1000).toFixed(3).toString() : "";
  };

  render() {
    const { decInputErrorMsg, magInputErrorMsg, raInputErrorMsg } = this.state;
    const { dec, mag, ra, style } = this.props;

    return (
      <Box style={style}>
        <Field isHorizontal>
          <FieldLabel isSize="small">
            <Label>Declination:</Label>
          </FieldLabel>
          <FieldBody style={{ flexGrow: 1 }}>
            <Field>
              <Control>
                <Input
                  type="text"
                  placeholder="0.000"
                  name="dec"
                  maxLength="7"
                  value={this.displayCoords(dec)}
                  onChange={this.handleChange}
                  className={decInputErrorMsg ? "is-danger" : ""}
                />
              </Control>
              {decInputErrorMsg && (
                <p className="help is-danger">{decInputErrorMsg}</p>
              )}
            </Field>
          </FieldBody>
        </Field>

        <Field isHorizontal>
          <FieldLabel isSize="small">
            <Label>Magnitude:</Label>
          </FieldLabel>
          <FieldBody style={{ flexGrow: 1 }}>
            <Field>
              <Control>
                <Input
                  type="text"
                  placeholder="0.000"
                  name="mag"
                  maxLength="7"
                  value={this.displayCoords(mag)}
                  onChange={this.handleChange}
                  className={magInputErrorMsg ? "is-danger" : ""}
                />
              </Control>
              {magInputErrorMsg && (
                <p className="help is-danger">{magInputErrorMsg}</p>
              )}
            </Field>
          </FieldBody>
        </Field>

        <Field isHorizontal>
          <FieldLabel isSize="small">
            <Label>Right Ascension:</Label>
          </FieldLabel>
          <FieldBody style={{ flexGrow: 1 }}>
            <Field>
              <Control>
                <Input
                  type="text"
                  placeholder="0.000"
                  name="ra"
                  maxLength="7"
                  value={this.displayCoords(ra)}
                  onChange={this.handleChange}
                  className={raInputErrorMsg ? "is-danger" : ""}
                />
              </Control>
              {raInputErrorMsg && (
                <p className="help is-danger">{raInputErrorMsg}</p>
              )}
            </Field>
          </FieldBody>
        </Field>
      </Box>
    );
  }
}

StarCoordinates.propTypes = {
  dec: PropTypes.string,
  mag: PropTypes.string,
  ra: PropTypes.string,
  setCoordinates: PropTypes.func.isRequired
};

export default StarCoordinates;
