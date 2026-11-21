// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/access/AccessControl.sol";

interface IIdentityRegistry { function isRegistered(bytes32 identityHash, uint32 periodId) external view returns (bool); }

/// @notice Mencatat penyaluran (unit simulasi; bukan transfer dana).
contract AidDisbursement is AccessControl {
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    struct Disbursement { bytes32 identityHash; uint32 programId; uint32 periodId; uint256 amount; bytes32 refId; address officer; uint16 score; uint64 timestamp; }

    IIdentityRegistry public immutable registry;
    uint16 public threshold;
    mapping(bytes32 => mapping(uint32 => uint16)) public attestedScore;
    mapping(bytes32 => mapping(uint32 => mapping(uint32 => bool))) public disbursed; // hash => program => periode
    Disbursement[] private records;

    event ScoreAttested(bytes32 indexed identityHash, uint32 indexed periodId, uint16 score, address indexed oracle);
    event AidDisbursed(bytes32 indexed identityHash, uint32 indexed programId, uint32 periodId, uint256 amount, bytes32 refId, address officer, uint16 score);
    event ThresholdChanged(uint16 newThreshold);

    error NotRegistered(); error ScoreBelowThreshold(); error AlreadyDisbursed(); error ScoreNotAttested(); error InvalidAmount(); error InvalidScore();

    constructor(address registryAddress, uint16 _threshold) {
        registry = IIdentityRegistry(registryAddress);
        threshold = _threshold;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setThreshold(uint16 t) external onlyRole(DEFAULT_ADMIN_ROLE) { if (t == 0 || t > 100) revert InvalidScore(); threshold = t; emit ThresholdChanged(t); }

    function attestScore(bytes32 identityHash, uint32 periodId, uint16 score) external onlyRole(ORACLE_ROLE) {
        if (score == 0 || score > 100) revert InvalidScore();
        attestedScore[identityHash][periodId] = score;
        emit ScoreAttested(identityHash, periodId, score, msg.sender);
    }

    function recordDisbursement(bytes32 identityHash, uint32 programId, uint32 periodId, uint256 amount, bytes32 refId) external onlyRole(OFFICER_ROLE) {
        if (amount == 0) revert InvalidAmount();
        if (!registry.isRegistered(identityHash, periodId)) revert NotRegistered();
        uint16 s = attestedScore[identityHash][periodId];
        if (s == 0) revert ScoreNotAttested();
        if (s < threshold) revert ScoreBelowThreshold();
        if (disbursed[identityHash][programId][periodId]) revert AlreadyDisbursed();
        disbursed[identityHash][programId][periodId] = true;
        records.push(Disbursement(identityHash, programId, periodId, amount, refId, msg.sender, s, uint64(block.timestamp)));
        emit AidDisbursed(identityHash, programId, periodId, amount, refId, msg.sender, s);
    }

    function totalDisbursements() external view returns (uint256) { return records.length; }
    function getDisbursement(uint256 i) external view returns (Disbursement memory) { return records[i]; }
}
