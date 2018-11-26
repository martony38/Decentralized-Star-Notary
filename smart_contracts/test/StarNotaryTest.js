const StarNotary = artifacts.require("StarNotary");

// Helper methods to get star token id from coordinates
function convertToBytes3(coord) {
  const size = coord.length - 2;
  let result = "";
  switch (size) {
    case 1:
      result += "0";
    case 2:
      result += "0";
    case 3:
      result += "0";
    case 4:
      result += "0";
    case 5:
      result += "0";
    default:
      result += coord.slice(2);
  }
  return result;
}

function concatHexCoords(dec, mag, ra) {
  const formattedInput =
    convertToBytes3(web3.toHex(dec)) +
    convertToBytes3(web3.toHex(mag)) +
    convertToBytes3(web3.toHex(ra));
  return "0x" + formattedInput;
}

function tokenIdFromCoordinates(dec, mag, ra) {
  const hash = web3.sha3(concatHexCoords(dec, mag, ra), { encoding: "hex" });
  return web3.toBigNumber(hash);
}

// Helper method to test async errors
const expectThrow = async function(promise) {
  try {
    await promise;
  } catch (error) {
    assert.exists(error);
    return;
  }

  assert.fail("Expected an error but didnt see one!");
};

contract("StarNotary", accounts => {
  beforeEach(async function() {
    this.contract = await StarNotary.new({ from: accounts[0] });
  });

  describe("test function checkIfStarExist()", () => {
    beforeEach(async function() {
      await this.contract.createStar(
        "awesome star!",
        "this is a star story",
        121874,
        245978,
        32155,
        { from: accounts[0] }
      );
    });

    it("returns false if star does not exist", async function() {
      const starExist = await this.contract.publicCheckIfStarExist(
        122874,
        245978,
        32155
      );
      expect(starExist).to.equal(false);
    });

    it("returns true if star already exists", async function() {
      const starExist = await this.contract.publicCheckIfStarExist(
        121874,
        245978,
        32155
      );
      expect(starExist).to.equal(true);
    });
  });

  describe("test functions createStar() and tokenIdToStarInfo()", () => {
    beforeEach(async function() {
      await this.contract.createStar(
        "1st awesome star!",
        "this is a star story",
        121874,
        245978,
        32155,
        { from: accounts[0] }
      );
      await this.contract.createStar(
        "2nd awesome star!",
        "this is another star story",
        120874,
        240978,
        30155,
        { from: accounts[0] }
      );
    });

    it("cannot create a star if bad coordinates are given", async function() {
      await expectThrow(
        this.contract.createStar(
          "A star",
          "this is a star story",
          120871,
          140978,
          "ryheui",
          { from: accounts[0] }
        )
      );
      await expectThrow(
        this.contract.createStar(
          "A Star",
          "this is a star story",
          120871,
          1208717,
          39155,
          { from: accounts[0] }
        )
      );
    });

    it("cannot create a star if inputs are missing", async function() {
      await expectThrow(
        this.contract.createStar(
          "",
          "this is a star story",
          120871,
          140978,
          39155,
          { from: accounts[0] }
        )
      );
      await expectThrow(
        this.contract.createStar("A Star", "", 120871, 140978, 39155, {
          from: accounts[0]
        })
      );
      await expectThrow(
        this.contract.createStar(
          "A Star",
          "this is a star story",
          140978,
          39155,
          { from: accounts[0] }
        )
      );
      await expectThrow(
        this.contract.createStar("A Star", "this is a star story", 140978, {
          from: accounts[0]
        })
      );
      await expectThrow(
        this.contract.createStar("A Star", "this is a star story", {
          from: accounts[0]
        })
      );
      await expectThrow(
        this.contract.createStar("", "", "", "", "", { from: accounts[0] })
      );
    });

    it("can create a star and get its metadata", async function() {
      const starInfo = await this.contract.tokenIdToStarInfo(
        tokenIdFromCoordinates(121874, 245978, 32155)
      );

      console.log(
        "tokenId bigNumber",
        tokenIdFromCoordinates(121874, 245978, 32155)
      );
      console.log(
        "tokenId number",
        tokenIdFromCoordinates(121874, 245978, 32155).toNumber()
      );
      console.log(
        "tokenId hex: ",
        web3.toHex(tokenIdFromCoordinates(121874, 245978, 32155))
      );
      console.log(
        "tokenId back to bigNumber: ",
        web3.toBigNumber(
          web3.toHex(tokenIdFromCoordinates(121874, 245978, 32155))
        )
      );

      assert.deepEqual(starInfo, [
        "1st awesome star!",
        "this is a star story",
        web3.toBigNumber(121874),
        web3.toBigNumber(245978),
        web3.toBigNumber(32155)
      ]);
    });

    it("cannot create a star with the same coordinates", async function() {
      await expectThrow(
        this.contract.createStar(
          "1st awesome star!",
          "this is a star story",
          121874,
          245978,
          32155,
          { from: accounts[0] }
        )
      );
    });

    it("increments star ID correctly", async function() {
      let starInfo = await this.contract.tokenIdToStarInfo(
        tokenIdFromCoordinates(120874, 240978, 30155)
      );
      assert.deepEqual(starInfo, [
        "2nd awesome star!",
        "this is another star story",
        web3.toBigNumber(120874),
        web3.toBigNumber(240978),
        web3.toBigNumber(30155)
      ]);

      await this.contract.createStar(
        "3rd awesome star!",
        "this is another star story",
        web3.toBigNumber(100874),
        web3.toBigNumber(200978),
        web3.toBigNumber(30155),
        { from: accounts[0] }
      );

      starInfo = await this.contract.tokenIdToStarInfo(
        tokenIdFromCoordinates(100874, 200978, 30155)
      );
      assert.deepEqual(starInfo, [
        "3rd awesome star!",
        "this is another star story",
        web3.toBigNumber(100874),
        web3.toBigNumber(200978),
        web3.toBigNumber(30155)
      ]);
    });
  });

  describe("test functions putStarUpForSale(), buyStar() and starsForSale()", () => {
    const seller = accounts[1];
    const buyer = accounts[2];
    const randomMaliciousUser = accounts[3];

    const starId = tokenIdFromCoordinates(121874, 245978, 32155);
    const starPrice = web3.toWei(0.01, "ether");

    beforeEach(async function() {
      await this.contract.createStar(
        "awesome star!",
        "this is a star story",
        121874,
        245978,
        32155,
        { from: seller }
      );
    });

    describe("test functions putStarUpForSale() and starsForSale()", () => {
      it("star is not listed for sale initially", async function() {
        assert.equal(await this.contract.starsForSale(starId), 0);
      });

      it("the owner can put up their star for sale", async function() {
        assert.equal(await this.contract.ownerOf(starId), seller);
        await this.contract.putStarUpForSale(starId, starPrice, {
          from: seller
        });

        assert.equal(await this.contract.starsForSale(starId), starPrice);
      });

      it("the owner can change the sale price", async function() {
        assert.equal(await this.contract.ownerOf(starId), seller);
        await this.contract.putStarUpForSale(starId, starPrice, {
          from: seller
        });
        assert.equal(await this.contract.starsForSale(starId), starPrice);
        const newStarPrice = web3.toWei(0.02, "ether");
        await this.contract.putStarUpForSale(starId, newStarPrice, {
          from: seller
        });
        assert.equal(await this.contract.starsForSale(starId), newStarPrice);
      });

      it("only the owner can put up their star for sale", async function() {
        await expectThrow(
          this.contract.putStarUpForSale(starId, starPrice, {
            from: randomMaliciousUser
          })
        );
      });
    });

    describe("test function buyStar() and starsForSale()", () => {
      beforeEach(async function() {
        await this.contract.putStarUpForSale(starId, starPrice, {
          from: seller
        });
      });

      it("star is removed from starForSale() after being bought", async function() {
        assert.equal(await this.contract.starsForSale(starId), starPrice);

        await this.contract.buyStar(starId, {
          from: buyer,
          value: starPrice,
          gasPrice: 0
        });

        assert.equal(await this.contract.starsForSale(starId), 0);
      });

      it("star can be bought only once", async function() {
        await this.contract.buyStar(starId, {
          from: buyer,
          value: starPrice,
          gasPrice: 0
        });

        await expectThrow(
          this.contract.buyStar(starId, {
            from: randomMaliciousUser,
            value: starPrice,
            gasPrice: 0
          })
        );
      });

      it("star cannot be bought for less than its price", async function() {
        await expectThrow(
          this.contract.buyStar(starId, {
            from: randomMaliciousUser,
            value: web3.toWei(0.0099, "ether"),
            gasPrice: 0
          })
        );
      });

      it("buyer is the owner of the star after they buy it", async function() {
        await this.contract.buyStar(starId, {
          from: buyer,
          value: starPrice,
          gasPrice: 0
        });
        assert.equal(await this.contract.ownerOf(starId), buyer);
      });

      it("buyer ether balance changes correctly", async function() {
        const overpaidAmount = web3.toWei(0.05, "ether");
        const balanceBeforeTransaction = web3.eth.getBalance(buyer);
        await this.contract.buyStar(starId, {
          from: buyer,
          value: overpaidAmount,
          gasPrice: 0
        });
        const balanceAfterTransaction = web3.eth.getBalance(buyer);

        assert.equal(
          balanceBeforeTransaction.sub(balanceAfterTransaction),
          starPrice
        );
      });

      it("seller ether balance changes correctly", async function() {
        const balanceBeforeTransaction = web3.eth.getBalance(seller);
        await this.contract.buyStar(starId, {
          from: buyer,
          value: starPrice,
          gasPrice: 0
        });
        const balanceAfterTransaction = web3.eth.getBalance(seller);

        assert.equal(
          balanceBeforeTransaction.add(starPrice).toNumber(),
          balanceAfterTransaction.toNumber()
        );
      });
    });
  });

  // functions mint(), approve(), safeTransferFrom(), SetApprovalForAll(),
  // getApproved(), isApprovedForAll() and ownerOf() are taken from
  // OpenZeppelin library and are already tested as part of their ERC721
  // implementation.
});
