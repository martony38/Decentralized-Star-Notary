const StarNotary = artifacts.require("StarNotary");

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
        "dec_121.874",
        "mag_245.978",
        "ra_032.155",
        1,
        { from: accounts[0] }
      );
    });

    it("returns false if star does not exist", async function() {
      const starExist = await this.contract.publicCheckIfStarExist(
        "dec_122.874",
        "mag_245.978",
        "ra_032.155"
      );
      expect(starExist).to.equal(false);
    });

    it("returns true if star already exists", async function() {
      const starExist = await this.contract.publicCheckIfStarExist(
        "dec_121.874",
        "mag_245.978",
        "ra_032.155"
      );
      expect(starExist).to.equal(true);
    });
  });

  describe("test functions createStar() and tokenIdToStarInfo()", () => {
    beforeEach(async function() {
      await this.contract.createStar(
        "awesome star!",
        "this is a star story",
        "dec_121.874",
        "mag_245.978",
        "ra_032.155",
        1,
        { from: accounts[0] }
      );
    });

    it("can create a star and get its metadata", async function() {
      const starInfo = await this.contract.tokenIdToStarInfo(1);
      assert.deepEqual(starInfo, [
        "awesome star!",
        "this is a star story",
        "dec_121.874",
        "mag_245.978",
        "ra_032.155"
      ]);
    });

    it("cannot create a star with the same coordinates", async function() {
      await expectThrow(
        this.contract.createStar(
          "awesome star!",
          "this is a star story",
          "dec_121.874",
          "mag_245.978",
          "ra_032.155",
          2,
          { from: accounts[0] }
        )
      );
    });
  });

  describe("test functions putStarUpForSale(), buyStar() and starsForSale()", () => {
    const seller = accounts[1];
    const buyer = accounts[2];
    const randomMaliciousUser = accounts[3];

    const starId = 1;
    const starPrice = web3.toWei(0.01, "ether");

    beforeEach(async function() {
      await this.contract.createStar(
        "awesome star!",
        "this is a star story",
        "dec_121.874",
        "mag_245.978",
        "ra_032.155",
        starId,
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
