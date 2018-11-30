import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { DrizzleContext } from "drizzle-react";
import { Label } from "bloomer";
import BuyStar from "./BuyStar";
import SellStar from "./SellStar";

class StarInfo extends Component {
  state = { starInfoKey: null, starOwnerKey: null, starPriceKey: null };

  setDataKeys = starId => {
    const { tokenIdToStarInfo, ownerOf, starsForSale } = this.props;

    // get and save the key for the variable we are interested in
    const starInfoKey = tokenIdToStarInfo.cacheCall(starId);
    const starOwnerKey = ownerOf.cacheCall(starId);
    const starPriceKey = starsForSale.cacheCall(starId);

    this.setState({ starInfoKey, starOwnerKey, starPriceKey });
  };

  componentDidMount() {
    const { starId } = this.props;
    this.setDataKeys(starId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.starId !== prevProps.starId) {
      this.setDataKeys(this.props.starId);
    }
  }

  render() {
    const { starId, StarNotary, account, toggleModal } = this.props;
    const { starInfoKey, starOwnerKey, starPriceKey } = this.state;

    // Contract is not yet intialized.
    if (!StarNotary.initialized) {
      return <span>Initializing...</span>;
    }

    // If the cache keys we received earlier isn't in the store yet; the initial value is still being fetched.
    if (
      !(starInfoKey in StarNotary.tokenIdToStarInfo) ||
      !(starOwnerKey in StarNotary.ownerOf) ||
      !(starPriceKey in StarNotary.starsForSale)
    ) {
      return <div style={{ marginTop: 20 }}>Fetching...</div>;
    }

    const { name, story, dec, mag, ra } = StarNotary.tokenIdToStarInfo[
      starInfoKey
    ].value;
    const owner = StarNotary.ownerOf[starOwnerKey].value;
    const price = StarNotary.starsForSale[starPriceKey].value;

    return (
      <div style={{ marginTop: 20 }}>
        {name === "" ? (
          <div>Nothing here but emptiness...</div>
        ) : (
          <Fragment>
            <Label>Name: {name}</Label>
            <Label>Story: {story}</Label>
            <Label>Star Coordinates:</Label>
            <Label isSize="small">
              Declination: {(Number(dec) / 1000).toFixed(3)}
            </Label>
            <Label isSize="small">
              Magnitude: {(Number(mag) / 1000).toFixed(3)}
            </Label>
            <Label isSize="small">
              Right Ascension: {(Number(ra) / 1000).toFixed(3)}
            </Label>
            <Label>Owner: {owner}</Label>
            {owner.toLowerCase() === account.toLowerCase() ? (
              <DrizzleContext.Consumer>
                {drizzleContext => {
                  const { drizzle, drizzleState, initialized } = drizzleContext;

                  if (!initialized) {
                    return "Loading...";
                  }

                  const {
                    putStarUpForSale
                  } = drizzle.contracts.StarNotary.methods;
                  const account = drizzleState.accounts[0];

                  return (
                    <SellStar
                      toggleModal={toggleModal}
                      price={price}
                      starId={starId}
                      putStarUpForSale={putStarUpForSale}
                      account={account}
                    />
                  );
                }}
              </DrizzleContext.Consumer>
            ) : (
              Number(price) > 0 && (
                <DrizzleContext.Consumer>
                  {drizzleContext => {
                    const {
                      drizzle,
                      drizzleState,
                      initialized
                    } = drizzleContext;

                    if (!initialized) {
                      return "Loading...";
                    }

                    const { buyStar } = drizzle.contracts.StarNotary.methods;
                    const account = drizzleState.accounts[0];

                    return (
                      <BuyStar
                        toggleModal={toggleModal}
                        price={price}
                        starId={starId}
                        buyStar={buyStar}
                        account={account}
                      />
                    );
                  }}
                </DrizzleContext.Consumer>
              )
            )}
          </Fragment>
        )}
      </div>
    );
  }
}

StarInfo.propTypes = {
  tokenIdToStarInfo: PropTypes.func.isRequired,
  ownerOf: PropTypes.func.isRequired,
  starsForSale: PropTypes.func.isRequired,
  toggleModal: PropTypes.func.isRequired,
  starId: PropTypes.string.isRequired,
  StarNotary: PropTypes.object.isRequired,
  account: PropTypes.string.isRequired
};

export default StarInfo;
