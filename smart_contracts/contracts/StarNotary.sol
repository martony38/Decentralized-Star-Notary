pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

    struct Star {
        string name;
        string story;
        string dec;
        string mag;
        string ra;
    }

    // List of existing stars
    Star[] stars;

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string _name, string _story, string _dec, string _mag, string _ra) public {
        require(_checkBlankInputs(_name, _story, _dec, _mag, _ra) == true, "inputs missing");
        require(_checkIfStarExist(_dec, _mag, _ra) == false, "Star already exists");

        // Create new star
        Star memory newStar = Star(_name, _story, _dec, _mag, _ra);

        // Assign tokenID to newly created star
        uint256 _tokenId = stars.length + 1;
        tokenIdToStarInfo[_tokenId] = newStar;

        // Add newly created star to list of stars
        stars.push(newStar);

        _mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(this.ownerOf(_tokenId) == msg.sender, "Only the owner of the star can put it for sale");

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0, "Star must be listed for sale to be able to buy it");

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost, "Cannot buy a star for less than its cost");

        // Transfer token
        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        // Remove star from sale
        starsForSale[_tokenId] = 0;

        // Pay seller
        starOwner.transfer(starCost);

        // Return change to buyer
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function _checkBlankInputs(string _name, string _story, string _dec, string _mag, string _ra) internal pure returns (bool) {
        // Check if any input string is empty
        // See https://ethereum.stackexchange.com/questions/11039/how-can-you-check-if-a-string-is-empty-in-solidity#11040
        if (bytes(_name).length == 0
            || bytes(_story).length == 0
            || bytes(_dec).length == 0
            || bytes(_mag).length == 0
            || bytes(_ra).length == 0) {
            return false;
        }
        return true;
    }

    function _checkIfStarExist(string _dec, string _mag, string _ra) internal view returns (bool) {
        for (uint index = 0; index < stars.length; index++) {
            // Use hash function to compare coordinates (use less gas)
            // See https://ethereum.stackexchange.com/questions/4559/operator-not-compatible-with-type-string-storage-ref-and-literal-string
            if (keccak256(abi.encode(stars[index].dec)) == keccak256(abi.encode(_dec))
            && keccak256(abi.encode(stars[index].mag)) == keccak256(abi.encode(_mag))
            && keccak256(abi.encode(stars[index].ra)) == keccak256(abi.encode(_ra))) {
                return true;
            }
        }

        return false;
    }

    // Public function to expose internal function _checkIfStarExist to test suite.
    // Uncomment following lines before running tests
    //function publicCheckIfStarExist(string _dec, string _mag, string _ra) public view returns (bool) {
    //    return _checkIfStarExist(_dec, _mag, _ra);
    //}





}