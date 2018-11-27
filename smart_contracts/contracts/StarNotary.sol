pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

    struct Star {
        string name;
        string story;
        uint24 dec;
        uint24 mag;
        uint24 ra;
    }

    event StarCreation(
        uint256 _tokenId,
        address _owner
    );

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string _name, string _story, uint24 _dec, uint24 _mag, uint24 _ra) public returns (uint256 _tokenId) {
        require(_checkBlankInputs(_name, _story) == true, "inputs missing");
        require(_checkInput(_dec) == true, "bad dec");
        require(_checkInput(_mag) == true, "bad mag");
        require(_checkInput(_ra) == true, "bad ra");
        require(_checkIfStarExist(_dec, _mag, _ra) == false, "Star already exists");

        // Create new star
        Star memory newStar = Star(_name, _story, _dec, _mag, _ra);

        // Assign tokenID to newly created star
        _tokenId = uint256(keccak256(bytes3(_dec), bytes3(_mag), bytes3(_ra)));
        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);

        emit StarCreation(_tokenId, msg.sender);
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

    function _checkBlankInputs(string _name, string _story) internal pure returns (bool) {
        // Check if any input string is empty
        // See https://ethereum.stackexchange.com/questions/11039/how-can-you-check-if-a-string-is-empty-in-solidity#11040
        if (bytes(_name).length == 0
            || bytes(_story).length == 0) {
            return false;
        }
        return true;
    }

    function _checkInput(uint24 _input) internal pure returns (bool) {
        if (_input > 999999) return false;
        else return true;
    }

    function _checkIfStarExist(uint24 _dec, uint24 _mag, uint24 _ra) internal view returns (bool) {
        uint256 _tokenId = uint256(keccak256(bytes3(_dec), bytes3(_mag), bytes3(_ra)));

        if (bytes(tokenIdToStarInfo[_tokenId].name).length != 0) {
            return true;
        } else {
            return false;
        }
    }

    // Public function to expose internal function _checkIfStarExist to test suite.
    // Uncomment following lines before running tests
    //function publicCheckIfStarExist(uint24 _dec, uint24 _mag, uint24 _ra) public view returns (bool) {
    //    return _checkIfStarExist(_dec, _mag, _ra);
    //}
}