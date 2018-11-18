import React, { Component, Fragment } from "react";
import { DrizzleContext } from "drizzle-react";
import { Label } from "bloomer";
import BuyStar from "./BuyStar";
import SellStar from "./SellStar";

class StarInfo extends Component {
  state = { starInfoKey: null, starOwnerKey: null, starPriceKey: null };

  componentDidMount() {
    const { starId } = this.props;
    this.setDataKeys(starId);
  }

  setDataKeys = starId => {
    const { tokenIdToStarInfo, ownerOf, starsForSale } = this.props;

    // get and save the key for the variable we are interested in
    const starInfoKey = tokenIdToStarInfo.cacheCall(starId);
    const starOwnerKey = ownerOf.cacheCall(starId);
    const starPriceKey = starsForSale.cacheCall(starId);

    this.setState({ starInfoKey, starOwnerKey, starPriceKey });
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.starId !== this.props.starId) {
      this.setDataKeys(nextProps.starId);
      return true;
    }
    if (nextProps.StarNotary !== this.props.StarNotary) {
      return true;
    }
    if (nextProps.account !== this.props.account) {
      return true;
    }
    return false;
  }

  render() {
    const { starId, StarNotary, account, toggleModal } = this.props;
    const { starInfoKey, starOwnerKey, starPriceKey } = this.state;

    console.log(StarNotary);

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
      return <span>Fetching...</span>;
    }

    const { name, story, dec, mag, ra } = StarNotary.tokenIdToStarInfo[
      starInfoKey
    ].value;
    const owner = StarNotary.ownerOf[starOwnerKey].value;
    const price = StarNotary.starsForSale[starPriceKey].value;

    return (
      <div style={{ marginTop: 20 }}>
        {name === "" &&
        story === "" &&
        dec === "" &&
        mag === "" &&
        ra === "" ? (
          "No star found..."
        ) : (
          <Fragment>
            <Label>Name: {name}</Label>
            <Label>Story: {story}</Label>
            <Label>Star Coordinates:</Label>
            <Label isSize="small">Declination: {dec}</Label>
            <Label isSize="small">Magnitude: {mag}</Label>
            <Label isSize="small">Right Ascension: {ra}</Label>
            <Label>Owner: {owner}</Label>
            {owner === account ? (
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

export default StarInfo;
