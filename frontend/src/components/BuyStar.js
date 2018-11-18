import React, { Component } from "react";
import PropTypes from "prop-types";
import { Box, Control, Label, Button } from "bloomer";

class BuyStar extends Component {
  handleSubmit = () => {
    const { starId, price, account, buyStar, toggleModal } = this.props;

    const stackId = buyStar.cacheSend(starId, {
      from: account,
      value: price
    });

    toggleModal(stackId);
  };

  render() {
    const { price } = this.props;

    return (
      <Box style={{ marginTop: 20 }}>
        <Label>This star is listed for sale, you may buy it.</Label>
        <Label>Price: {price} Wei</Label>
        <Control>
          <Button
            className="is-primary is-fullwidth"
            onClick={this.handleSubmit}
          >
            Buy Star ({price} Wei)
          </Button>
        </Control>
      </Box>
    );
  }
}

BuyStar.propTypes = {
  price: PropTypes.string.isRequired,
  starId: PropTypes.string.isRequired,
  buyStar: PropTypes.func.isRequired,
  account: PropTypes.string.isRequired,
  toggleModal: PropTypes.func.isRequired
};

export default BuyStar;
