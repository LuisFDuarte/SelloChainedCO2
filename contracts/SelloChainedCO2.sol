//Begin
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4; // Revisar si se requiere version superior

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SelloChainedCO2 is ERC721, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant EVAL_ROLE = keccak256("EVAL_ROLE");
    Counters.Counter private _tokenIdCounter;

    struct StatusNFT {
        address to;
        string uri;
        uint256 tokenId;
        string status;
    }

    string[] statusString = ["pending", "approved", "rejected", "created"];
    enum Status {Pending, Approved, Rejected, Default}

    mapping (address => StatusNFT) public ownerToStatusNFT;
    mapping (address => uint256) public ownerToToken;

    constructor() ERC721("SelloChainedCO2", "SCCO2") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EVAL_ROLE, msg.sender);
        _tokenIdCounter.increment();
    }

    // To create new tokens (any user can do this)
    function mint(string memory _tokenUri) public {
        address to = msg.sender;
        uint256 tokenId = ownerToToken[to];
        
        if(_exists(tokenId)){
            updateMetadata(tokenId, _tokenUri);
            changeStatus(to, uint(Status.Default));
        } else {
            safeMint(to, _tokenUri);
        }
    }

    // When a user wants to verify their token
    // (the notification for approvers should be on front for the moment)
    // TODO: maybe add events
    function requestApproval() public checkTokenId(msg.sender){
        changeStatus(msg.sender, uint(Status.Pending));
    }

    // get the status of a token either it is on pending, approve, rejected or created(default)
    function getStatus(address _nftOwner) public view checkTokenId(_nftOwner) returns(StatusNFT memory) {
        StatusNFT memory last = ownerToStatusNFT[_nftOwner];
        return(last);
    }

    // only an admin can execute this, reject approval request
    function rejectNFT(address _nftOwner) public onlyRole(EVAL_ROLE) checkTokenId(_nftOwner){
        changeStatus(_nftOwner, uint(Status.Rejected));
    }

    // only an admin can execute this, approve request to verify token
    function approveNFT(address _nftOwner) public onlyRole(EVAL_ROLE) checkTokenId(_nftOwner){
        changeStatus(_nftOwner, uint(Status.Approved));
    }

    // is the current user an admin?
    function isReviewer() public view returns(bool){
        return hasRole(EVAL_ROLE, msg.sender);
    }

    // only superadmin can execute, grants permissions to other users
    function grantReviewerAccess(address to) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(EVAL_ROLE, to);
    }

    // Modifiers

    modifier checkTokenId(address _ownderAdd) {
        uint256 tokenId = ownerToToken[_ownderAdd];
        require(_exists(tokenId), "User doesn't have a token");
        _;
    }

    // Internal functions

    function safeMint(address to, string memory tokenUri) internal {
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);
        ownerToToken[to] = tokenId;
        StatusNFT memory newNFT = StatusNFT(
            to,
            tokenUri,
            tokenId,
            statusString[uint(Status.Default)]
        );
        ownerToStatusNFT[msg.sender] = newNFT;
        _tokenIdCounter.increment();
    }

    function updateMetadata(uint256 tokenId, string memory uri) internal {
        _setTokenURI(tokenId, uri);
    }

    function changeStatus(address _nftOwner, uint _state) internal {
        StatusNFT memory lastPending = ownerToStatusNFT[_nftOwner];
        lastPending.status = statusString[_state];
        ownerToStatusNFT[_nftOwner] = lastPending;
    }

    // The following functions are overrides required by Solidity.
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
