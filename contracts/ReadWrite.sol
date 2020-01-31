pragma solidity >=0.4.25;

contract ReadWrite {
    uint256 stateCount;
    function readState() public view returns (uint256) {
        return stateCount;
    }
    function writeState(uint256 val) public returns (uint256) {
        stateCount = stateCount + val;
    }
}