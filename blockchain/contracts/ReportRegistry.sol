// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @notice Jejak publik laporan terverifikasi (isi laporan TETAP off-chain).
/// @dev Tidak menyimpan NIK/PII. Hanya hash + metadata minimal.
contract ReportRegistry is AccessControl {
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE");

    enum Status { VERIFIED, REJECTED }

    struct ReportEntry {
        bytes32 reportHash;    // keccak256(off-chain report id)
        bytes4  regionCode;    // e.g. bytes4(uint32(3201))
        bytes16 category;      // kategori laporan
        Status  status;
        address officer;
        uint64  timestamp;
    }

    ReportEntry[] private _entries;
    mapping(bytes32 => bool) public reported; // cegah duplikat hash

    event ReportVerified(
        bytes32 indexed reportHash,
        bytes4  indexed regionCode,
        bytes16 category,
        Status  status,
        address indexed officer,
        uint64  timestamp
    );

    error DuplicateReport();
    error InvalidHash();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function recordVerification(
        bytes32 reportHash,
        uint32  regionCode,
        string calldata category,
        Status  status
    ) external onlyRole(OFFICER_ROLE) {
        if (reportHash == bytes32(0)) revert InvalidHash();
        if (reported[reportHash]) revert DuplicateReport();
        reported[reportHash] = true;

        bytes4  rc  = bytes4(regionCode);
        bytes16 cat;
        bytes memory cb = bytes(category);
        assembly { cat := mload(add(cb, 32)) }

        _entries.push(ReportEntry(reportHash, rc, cat, status, msg.sender, uint64(block.timestamp)));
        emit ReportVerified(reportHash, rc, cat, status, msg.sender, uint64(block.timestamp));
    }

    function totalReports() external view returns (uint256) { return _entries.length; }
    function getReport(uint256 i) external view returns (ReportEntry memory) { return _entries[i]; }
}
