// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @notice Registri identitas berpseudonim (HMAC off-chain). Tanpa NIK/PII on-chain.
contract IdentityRegistry is AccessControl {
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE");
    struct Registration { uint32 programId; address officer; uint64 timestamp; bool active; }

    mapping(uint32 => mapping(bytes32 => Registration)) private regs; // periode => hash => data
    mapping(uint32 => bool) public programActive;
    uint32 public minPeriod; uint32 public maxPeriod;
    uint256 public totalRegistered;
    mapping(uint32 => uint256) public countByProgram;

    event IdentityRegistered(bytes32 indexed identityHash, uint32 indexed programId, uint32 periodId, address indexed officer);
    event IdentityRevoked(bytes32 indexed identityHash, uint32 periodId, string reason, address admin);

    error IdentityAlreadyRegistered(); error InvalidProgram(); error InvalidPeriod(); error ZeroHash(); error NotFound();

    constructor(uint32 _minPeriod, uint32 _maxPeriod) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        minPeriod = _minPeriod; maxPeriod = _maxPeriod;
    }

    function setProgram(uint32 programId, bool active) external onlyRole(DEFAULT_ADMIN_ROLE) { programActive[programId] = active; }
    function setPeriodRange(uint32 _min, uint32 _max) external onlyRole(DEFAULT_ADMIN_ROLE) { minPeriod = _min; maxPeriod = _max; }

    function registerIdentity(bytes32 identityHash, uint32 programId, uint32 periodId) external onlyRole(OFFICER_ROLE) {
        if (identityHash == bytes32(0)) revert ZeroHash();
        if (!programActive[programId]) revert InvalidProgram();
        if (periodId < minPeriod || periodId > maxPeriod) revert InvalidPeriod();
        if (regs[periodId][identityHash].active) revert IdentityAlreadyRegistered(); // lintas program, periode sama
        regs[periodId][identityHash] = Registration(programId, msg.sender, uint64(block.timestamp), true);
        totalRegistered++; countByProgram[programId]++;
        emit IdentityRegistered(identityHash, programId, periodId, msg.sender);
    }

    function isRegistered(bytes32 identityHash, uint32 periodId) external view returns (bool) { return regs[periodId][identityHash].active; }
    function getIdentityStatus(bytes32 identityHash, uint32 periodId) external view returns (Registration memory) { return regs[periodId][identityHash]; }

    /// Koreksi teraudit: event riwayat tetap ada, registrasi dinonaktifkan.
    function revokeIdentity(bytes32 identityHash, uint32 periodId, string calldata reason) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Registration storage r = regs[periodId][identityHash];
        if (!r.active) revert NotFound();
        r.active = false; totalRegistered--; countByProgram[r.programId]--;
        emit IdentityRevoked(identityHash, periodId, reason, msg.sender);
    }
}
