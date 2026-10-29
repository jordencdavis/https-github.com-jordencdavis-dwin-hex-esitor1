/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DwinProject } from '../types/dwin';
import { formatVpHex } from './hexEngine';

/**
 * Generates an embedded C/C++ header file with VP defines and struct mappings
 */
export function generateCHeader(project: DwinProject): string {
  const dateStr = new Date().toISOString();
  
  const paramDefines = project.parameters
    .map(p => {
      const hex = formatVpHex(p.vpAddress);
      const comment = `// ${p.name} (${p.dataType}, ${p.unit || 'unitless'}) - Scale: 1/${p.scale}`;
      return `#define VP_${p.identifier.padEnd(28)} ${hex}  ${comment}`;
    })
    .join('\n');

  const screenDefines = project.screens
    .map(s => {
      const idSafe = s.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      return `#define SCREEN_${idSafe.padEnd(24)} ${s.screenNumber} // 0x${s.screenNumber.toString(16).padStart(4, '0').toUpperCase()} - ${s.group}`;
    })
    .join('\n');

  return `/**
 * ============================================================================
 * DWIN DGUS HMI - Variable Pointer & Screen Definitions
 * Project: ${project.name} (v${project.version})
 * Target Hardware: ${project.dwinModel}
 * Resolution: ${project.resolution}
 * Generated: ${dateStr}
 * ============================================================================
 */

#ifndef DWIN_VP_DEFS_H_
#define DWIN_VP_DEFS_H_

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Standard DGUS II Header Bytes */
#define DWIN_FRAME_HEADER_H       0x5A
#define DWIN_FRAME_HEADER_L       0xA5

/* DGUS Commands */
#define DWIN_CMD_SYS_WRITE        0x80
#define DWIN_CMD_SYS_READ         0x81
#define DWIN_CMD_VAR_WRITE        0x82
#define DWIN_CMD_VAR_READ         0x83
#define DWIN_CMD_CURVE_WRITE      0x84

/* System Register VP Addresses */
#define DWIN_SYS_VP_PIC_ID        0x0084 /* Page Switch Register (write 5A 01 00 xx) */
#define DWIN_SYS_VP_RTC           0x0010 /* RTC Date/Time (7 bytes) */
#define DWIN_SYS_VP_BRIGHTNESS    0x0082 /* Backlight Brightness */
#define DWIN_SYS_VP_BUZZER        0x00A0 /* Buzzer Beep Control */

/* ==========================================
 * SCREEN NUMBER REGISTRY
 * ========================================== */
${screenDefines}

/* ==========================================
 * PARAMETER VARIABLE POINTER (VP) REGISTRY
 * ========================================== */
${paramDefines}

/* ==========================================
 * APPLICATION TELEMETRY STRUCT LAYOUT
 * ========================================== */
typedef struct {
${project.parameters
  .map(p => {
    let cType = 'uint16_t';
    if (p.dataType === 'INT16') cType = 'int16_t';
    else if (p.dataType === 'UINT32') cType = 'uint32_t';
    else if (p.dataType === 'INT32') cType = 'int32_t';
    else if (p.dataType === 'FLOAT32') cType = 'float';
    else if (p.dataType === 'STRING') cType = `char[${p.words * 2}]`;
    return `    ${cType.padEnd(12)} ${p.identifier.toLowerCase()}; /* VP: ${formatVpHex(p.vpAddress)}, Unit: ${p.unit} */`;
  })
  .join('\n')}
} dwin_telemetry_t;

#ifdef __cplusplus
}
#endif

#endif /* DWIN_VP_DEFS_H_ */
`;
}

/**
 * Generates a Python communication module for DWIN serial testing
 */
export function generatePythonDriver(project: DwinProject): string {
  return `"""
DWIN DGUS II Protocol Driver & VP Dictionary
Project: ${project.name}
Model: ${project.dwinModel}
"""

import struct
from typing import Union, List, Tuple

HEADER = bytes([0x5A, 0xA5])

# Screen IDs
SCREENS = {
${project.screens.map(s => `    "${s.name.replace(/[^a-zA-Z0-9_]/g, '_')}": ${s.screenNumber},`).join('\n')}
}

# Parameter VP Registry
PARAMETERS = {
${project.parameters
  .map(
    p =>
      `    "${p.identifier}": {"name": "${p.name}", "vp": ${formatVpHex(p.vpAddress)}, "type": "${p.dataType}", "words": ${p.words}, "scale": ${p.scale}, "unit": "${p.unit}"},`
  )
  .join('\n')}
}


def build_write_vp_frame(vp_address: int, value: Union[int, float], data_type: str = "UINT16") -> bytes:
    """Encodes a 0x82 variable memory write packet."""
    if data_type == "UINT16":
        payload = struct.pack(">H", int(value))
    elif data_type == "INT16":
        payload = struct.pack(">h", int(value))
    elif data_type == "UINT32":
        payload = struct.pack(">I", int(value))
    elif data_type == "INT32":
        payload = struct.pack(">i", int(value))
    elif data_type == "FLOAT32":
        payload = struct.pack(">f", float(value))
    else:
        payload = struct.pack(">H", int(value))

    # Length byte = Command (1) + VP (2) + payload length
    cmd = 0x82
    vp_high = (vp_address >> 8) & 0xFF
    vp_low = vp_address & 0xFF
    length = 1 + 2 + len(payload)

    return HEADER + bytes([length, cmd, vp_high, vp_low]) + payload


def build_page_switch_frame(screen_id: int) -> bytes:
    """Sends page jump command to DWIN system VP 0x0084."""
    # 5A A5 07 82 00 84 5A 01 [Page_High] [Page_Low]
    payload = bytes([0x5A, 0x01, (screen_id >> 8) & 0xFF, screen_id & 0xFF])
    return HEADER + bytes([0x07, 0x82, 0x00, 0x84]) + payload


def decode_response(frame: bytes) -> dict:
    """Decodes DWIN response with length checking."""
    if len(frame) < 3 or frame[:2] != HEADER:
        raise ValueError("Invalid DWIN header")
    
    declared_len = frame[2]
    actual_len = len(frame) - 3
    if declared_len != actual_len:
        print(f"Warning: Frame length mismatch! Declared {declared_len}, got {actual_len}")

    cmd = frame[3]
    vp = (frame[4] << 8) | frame[5]
    data = frame[6:]
    return {"command": hex(cmd), "vp": hex(vp), "data": data.hex().upper()}
`;
}

/**
 * Generates CSV parameter dictionary for DGUS import / documentation
 */
export function generateCsvExport(project: DwinProject): string {
  const headers = [
    'Parameter Name',
    'Identifier',
    'VP Address (Hex)',
    'VP Address (Dec)',
    'Data Type',
    'Word Count',
    'Scale Factor',
    'Engineering Unit',
    'Min',
    'Max',
    'Default',
    'VP Role',
    'Group',
    'Description'
  ];

  const rows = project.parameters.map(p => [
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.identifier}"`,
    `"${formatVpHex(p.vpAddress)}"`,
    p.vpAddress,
    p.dataType,
    p.words,
    p.scale,
    `"${p.unit}"`,
    p.min,
    p.max,
    p.defaultValue,
    p.role,
    `"${p.group}"`,
    `"${p.description.replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
