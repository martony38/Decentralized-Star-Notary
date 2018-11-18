import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Control,
  Field,
  Label,
  Input,
  Button,
  FieldLabel,
  FieldBody
} from "bloomer";

class SellStar extends Component {
  state = {
    newPrice: this.props.price
  };

  handleChange = e => {
    this.setState({ newPrice: e.target.value });
  };

  handleSubmit = () => {
    const { starId, putStarUpForSale, account, toggleModal } = this.props;
    const { newPrice } = this.state;

    const stackId = putStarUpForSale.cacheSend(starId, newPrice, {
      from: account
    });

    toggleModal(stackId);
  };

  render() {
    const { price } = this.props;
    const { newPrice } = this.state;

    let disabled = false;
    let error = "";

    /*if (status === "pending") {
      disabled = true;
    } else */ if (
      newPrice === "" ||
      newPrice <= 0 ||
      newPrice === price
    ) {
      disabled = true;
    } else {
      if (!/^\d*$/.test(newPrice)) {
        disabled = true;
        error = "only digits are allowed";
      }
    }

    return (
      <Box style={{ marginTop: 20 }}>
        <Label>
          {Number(price) > 0
            ? `Looks like this is a star you own and have listed for sale for ${price} Wei, you may change its price.`
            : "Looks like you are the owner of this star, you may list it for sale."}
        </Label>
        <Field isHorizontal>
          <FieldLabel isNormal>
            <Label>Price:</Label>
          </FieldLabel>
          <FieldBody>
            <Field>
              <Control>
                <Input
                  type="text"
                  placeholder="100"
                  onChange={this.handleChange}
                  value={newPrice}
                  className={error === "" ? "" : "is-danger"}
                />
              </Control>
              {error !== "" && <p className="help is-danger">{error}</p>}
              <p className="help">Units: Wei</p>
            </Field>
          </FieldBody>
        </Field>
        <Control>
          <Button
            className="is-danger is-fullwidth"
            onClick={this.handleSubmit}
            disabled={disabled}
          >
            {Number(price) > 0 ? "Update Price" : "Sell Star"}
          </Button>
        </Control>
      </Box>
    );
  }
}

SellStar.propTypes = {
  price: PropTypes.string.isRequired,
  starId: PropTypes.string.isRequired,
  putStarUpForSale: PropTypes.func.isRequired,
  account: PropTypes.string.isRequired,
  toggleModal: PropTypes.func.isRequired
};

export default SellStar;
