window.addEventListener("load", function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== "undefined") {
    // Use Mist/MetaMask's provider
    web3 = new Web3(web3.currentProvider);
  } else {
    console.log("No web3? You should consider trying MetaMask!");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    // Instantiate and set Ganache as provider
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  // The default (top) wallet account from a list of test accounts
  web3.eth.defaultAccount = web3.eth.accounts[0];

  // The interface definition for your smart contract (the ABI)
  const StarNotary = web3.eth.contract(contractABI);
  // Grab the contract at specified deployed address with the interface defined by the ABI
  starNotary = StarNotary.at("0x38843ab48caf8d8fe0c98e0cebf18c2f2e637bcd");
});

document
  .getElementById("star-id")
  .addEventListener("input", checkFindButtonStatus);

function checkFindButtonStatus() {
  console.log("input changed");
  const starID = document.getElementById("star-id").value;

  if (starID === "") {
    document.getElementById("find-button").setAttribute("disabled", "");
  } else {
    if (!/^\d*$/.test(starID)) {
      document
        .getElementById("star-id")
        .setAttribute("class", "input is-danger");
      document.getElementById("find-button").setAttribute("disabled", "");
    } else {
      document.getElementById("find-button").removeAttribute("disabled");
      document.getElementById("star-id").setAttribute("class", "input");
    }
  }
}

document
  .getElementById("new-star-name")
  .addEventListener("input", checkClaimButtonStatus);
document
  .getElementById("new-star-story")
  .addEventListener("input", checkClaimButtonStatus);
document.getElementById("new-star-dec").addEventListener("input", validateDec);
document.getElementById("new-star-mag").addEventListener("input", validateMag);
document.getElementById("new-star-ra").addEventListener("input", validateRa);

function validateDec() {
  const starDec = document.getElementById("new-star-dec").value;

  if (starDec !== "" && !/^dec_\d{3}.\d{3}$/.test(starDec)) {
    console.log("invalid dec");
    document
      .getElementById("new-star-dec")
      .setAttribute("class", "input is-danger");
    document.getElementById("claim-button").setAttribute("disabled", "");
  } else {
    document.getElementById("new-star-dec").setAttribute("class", "input");
    checkClaimButtonStatus();
  }
}

function validateMag() {
  const starMag = document.getElementById("new-star-mag").value;

  if (starMag !== "" && !/^mag_\d{3}.\d{3}$/.test(starMag)) {
    console.log("invalid mag");
    document
      .getElementById("new-star-mag")
      .setAttribute("class", "input is-danger");
    document.getElementById("claim-button").setAttribute("disabled", "");
  } else {
    document.getElementById("new-star-mag").setAttribute("class", "input");
    checkClaimButtonStatus();
  }
}

function validateRa() {
  const starRa = document.getElementById("new-star-ra").value;

  if (starRa !== "" && !/^ra_\d{3}.\d{3}$/.test(starRa)) {
    console.log("invalid ra");
    document
      .getElementById("new-star-ra")
      .setAttribute("class", "input is-danger");
    document.getElementById("claim-button").setAttribute("disabled", "");
  } else {
    document.getElementById("new-star-ra").setAttribute("class", "input");
    checkClaimButtonStatus();
  }
}

function checkClaimButtonStatus() {
  console.log("input changed");
  const starName = document.getElementById("new-star-name").value;
  const starStory = document.getElementById("new-star-story").value;
  const starDec = document.getElementById("new-star-dec").value;
  const starRa = document.getElementById("new-star-ra").value;
  const starMag = document.getElementById("new-star-mag").value;

  if (
    starName === "" ||
    starStory === "" ||
    starDec === "" ||
    starRa === "" ||
    starMag === ""
  ) {
    document.getElementById("claim-button").setAttribute("disabled", "");
  } else {
    document.getElementById("claim-button").removeAttribute("disabled");
  }
}

function addStarInfoToUI(name, story, dec, mag, ra, owner) {
  const starID = document.getElementById("star-id").value;

  document.getElementById("star-info").innerHTML = `
    <label class="label">Name: ${name}</label>
    <label class="label">Story: ${story}</label>
    <label class="label">Star Coordinates:</label>
    <label class="label is-small">Declination: ${dec}</label>
    <label class="label is-small">Magnitude: ${mag}</label>
    <label class="label is-small">Right Ascension: ${ra}</label>
    <label class="label" id="star-owner">Owner: ${owner}</label>
  `;

  starNotary.starsForSale(starID, function(error, price) {
    if (!error) {
      console.log(JSON.stringify(price));

      if (web3.eth.defaultAccount === owner) {
        document.getElementById("star-info").insertAdjacentHTML(
          "beforeend",
          `
          <div class="box" style="margin: 20px 0 0 0">
            <label class="label">${
              Number(price) > 0
                ? `Looks like this is a star you own and have listed for sale for ${price} Wei, you may change its price.`
                : "Looks like you are the owner of this star, you may list it for sale."
            }</label>
            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">Price:</label>
              </div>
              <div class="field-body">
                <div class="field">
                  <div class="control">
                    <input id="star-price" class="input" type="text" ${
                      Number(price) > 0
                        ? `value="${price}"`
                        : 'placeholder="100"'
                    }>
                  </div>
                  <p class="help">
                    Units: Wei
                  </p>
                </div>
              </div>
            </div>
            <div class="control">
              <button id="sell-button" class="button is-danger is-fullwidth" onclick="sellStar(${starID})" disabled>Sell Star</button>
            </div>
          </div>
          `
        );

        document
          .getElementById("star-price")
          .addEventListener("input", validatePrice);
      } else if (Number(price) > 0 && web3.eth.defaultAccount !== owner) {
        document.getElementById("star-info").insertAdjacentHTML(
          "beforeend",
          `
          <div class="box" style="margin: 20px 0 0 0">
            <label class="label">This star is listed for sale, you may buy it.</label>
            <label class="label">Price: ${price} Wei</label>
            <div class="control">
              <button id="buy-button" class="button is-primary is-fullwidth" onclick="buyStar(${starID},${price})">Buy Star (${price} Wei)</button>
            </div>
          </div>
          `
        );
      }
    } else console.error(error);
  });
}

function validatePrice() {
  console.log("price changed");
  const price = document.getElementById("star-price").value;

  if (price === "") {
    document.getElementById("sell-button").setAttribute("disabled", "");
  } else {
    if (!/^\d*$/.test(price)) {
      document
        .getElementById("star-price")
        .setAttribute("class", "input is-danger");
      document.getElementById("sell-button").setAttribute("disabled", "");
    } else {
      document.getElementById("sell-button").removeAttribute("disabled");
      document.getElementById("star-price").setAttribute("class", "input");
    }
  }
}

function findStar() {
  const starId = Number(document.getElementById("star-id").value);

  starNotary.tokenIdToStarInfo(starId, function(error, starInfo) {
    if (!error) {
      console.log(JSON.stringify(starInfo));

      if (
        starInfo[0] === "" &&
        starInfo[1] === "" &&
        starInfo[2] === "" &&
        starInfo[3] === "" &&
        starInfo[4] === ""
      ) {
        // Remove any listener before removing elements from DOM
        const priceInput = document.getElementById("star-price");
        if (priceInput !== null)
          priceInput.removeEventListener("input", validatePrice);

        // Remove any elements in div 'satr-info' from DOM and display message
        document.getElementById("star-info").innerText = "No star found...";
      } else {
        // If a star is found, display star info and owner
        starNotary.ownerOf(starId, function(error, owner) {
          if (!error) {
            console.log(JSON.stringify(owner));
            // Update UI
            addStarInfoToUI(
              starInfo[0],
              starInfo[1],
              starInfo[2],
              starInfo[3],
              starInfo[4],
              owner
            );
          } else console.error(error);
        });
      }
    } else console.error(error);
  });
}

function claimStar() {
  const starName = document.getElementById("new-star-name").value;
  const starStory = document.getElementById("new-star-story").value;
  const starDec = document.getElementById("new-star-dec").value;
  const starMag = document.getElementById("new-star-mag").value;
  const starRa = document.getElementById("new-star-ra").value;

  web3.eth.getAccounts(function(error, result) {
    if (!error) {
      console.log(JSON.stringify(result));
      const account = result[0];

      starNotary.createStar(
        starName,
        starStory,
        starDec,
        starMag,
        starRa,
        { from: account },
        function(error, result) {
          if (!error) {
            console.log(JSON.stringify(result));
            document.getElementById("new-star-info").innerHTML = `
              <label class="label">Star created!</label>
              <label class="label">Transaction Hash: ${JSON.stringify(
                result
              )}</label>
            `;
          } else console.error(error);
        }
      );
    } else console.error(error);
  });
}

function sellStar(starID) {
  const price = document.getElementById("star-price").value;

  web3.eth.getAccounts(function(error, result) {
    if (!error) {
      console.log(JSON.stringify(result));
      const account = result[0];

      starNotary.putStarUpForSale(starID, price, { from: account }, function(
        error,
        result
      ) {
        if (!error) {
          console.log(JSON.stringify(result));
          document.getElementById("star-info").insertAdjacentHTML(
            "beforeend",
            `
              <label class="label" style="margin-top: 20px;">Star is now listed for sale!</label>
              <label class="label">Transaction Hash: ${JSON.stringify(
                result
              )}</label>
            `
          );
        } else console.error(error);
      });
    } else console.error(error);
  });
}

function buyStar(starID, price) {
  web3.eth.getAccounts(function(error, result) {
    if (!error) {
      console.log(JSON.stringify(result));
      const account = result[0];

      starNotary.buyStar(
        starID,
        {
          from: account,
          value: price
        },
        function(error, result) {
          if (!error) {
            console.log(JSON.stringify(result));
            document.getElementById("star-info").insertAdjacentHTML(
              "beforeend",
              `
                <label class="label" style="margin-top: 20px;">Star bought!</label>
                <label class="label">Transaction Hash: ${JSON.stringify(
                  result
                )}</label>
              `
            );
          } else console.error(error);
        }
      );
    } else console.error(error);
  });
}
