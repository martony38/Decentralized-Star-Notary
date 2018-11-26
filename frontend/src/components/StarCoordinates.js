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
    dec: "",
    mag: "",
    ra: "",
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
      setCoordinates({ ...this.state, [e.target.name]: input });
      this.setState({
        [e.target.name]: input,
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
    const {
      dec,
      mag,
      ra,
      decInputErrorMsg,
      magInputErrorMsg,
      raInputErrorMsg
    } = this.state;

    return (
      <Box>
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
                  className={decInputErrorMsg ? "is-warning" : ""}
                />
              </Control>
              {decInputErrorMsg && (
                <p className="help is-warning">{decInputErrorMsg}</p>
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
                  className={magInputErrorMsg ? "is-warning" : ""}
                />
              </Control>
              {magInputErrorMsg && (
                <p className="help is-warning">{magInputErrorMsg}</p>
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
                  className={raInputErrorMsg ? "is-warning" : ""}
                />
              </Control>
              {raInputErrorMsg && (
                <p className="help is-warning">{raInputErrorMsg}</p>
              )}
            </Field>
          </FieldBody>
        </Field>
      </Box>
    );
  }
}

StarCoordinates.propTypes = {
  setCoordinates: PropTypes.func.isRequired
};

export default StarCoordinates;
