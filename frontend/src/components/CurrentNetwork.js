import React from "react";
import { DrizzleContext } from "drizzle-react";
import PropTypes from "prop-types";
import { LevelItem } from "bloomer";

const DrizzleConnectedCurrentNetwork = ({ networkId }) => {
  let network;
  switch (networkId) {
    case 1:
      network = "Mainnet";
      break;
    case 2:
      network = "Morden test network (deprecated)";
      break;
    case 3:
      network = "Ropsten test network";
      break;
    case 4:
      network = "Rinkeby test network";
      break;
    case 42:
      network = "Kovan test network";
      break;
    default:
      network = "unknown network";
  }

  return (
    <LevelItem className="has-text-centered">
      <div>
        <strong>Current Network</strong>
        <p>{network}</p>
      </div>
    </LevelItem>
  );
};

DrizzleConnectedCurrentNetwork.propTypes = {
  networkId: PropTypes.number.isRequired
};

const CurrentNetwork = () => (
  <DrizzleContext.Consumer>
    {drizzleContext => {
      const { drizzleState, initialized } = drizzleContext;

      if (!initialized) {
        return "Loading...";
      }
      const { networkId } = drizzleState.web3;

      return <DrizzleConnectedCurrentNetwork networkId={networkId} />;
    }}
  </DrizzleContext.Consumer>
);

export default CurrentNetwork;
